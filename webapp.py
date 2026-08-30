from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from main import agent, get_answer
import os
import re
import time
import base64
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Allow requests from the Vite dev server and any local origin
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]}})

MEDICINE_PROMPT = """You are CareBridge, an AI healthcare awareness assistant.

A user has uploaded an image of a medicine, tablet, capsule, syrup, or medical product.

Analyse the image carefully and provide a clear, simple, patient-friendly explanation covering:

1. **Medicine Name** – What is this medicine called? (brand name and generic name if visible)
2. **What it is used for** – What conditions or symptoms is it typically used to treat?
3. **How to take it** – Dosage instructions (if visible on packaging), with or without food, timing.
4. **When NOT to take it** – Key contraindications, allergy warnings, who should avoid it.
5. **Common side effects** – List the most common ones in simple language.
6. **Important warnings** – Pregnancy, children, elderly, interactions with other medicines.
7. **Storage** – How to store it (temperature, light, moisture).

If the image does not show a medicine clearly, say so and ask the user to upload a clearer photo.
Always end with: "⚠️ This is for awareness only. Always follow your doctor's or pharmacist's instructions."

Reply in the same language the user is likely using based on the medicine packaging language."""


# ---------------------------------------------------------------------------
# Safety level detection — scans the AI reply text for keywords
# ---------------------------------------------------------------------------

_URGENT_PATTERNS = re.compile(
    r"\b(emergency|911|ambulance|call.*help|heart attack|stroke|chest pain|"
    r"can't breathe|cannot breathe|bleeding heavily|unconscious|overdose|"
    r"emergency service|emergency department|nearest hospital)\b",
    re.IGNORECASE,
)
_CAUTION_PATTERNS = re.compile(
    r"\b(consult|see a doctor|see a physician|healthcare professional|"
    r"medical advice|seek.*medical|symptoms|fever|pain|infection|"
    r"visit.*clinic|please consult)\b",
    re.IGNORECASE,
)


def _detect_safety_level(text: str) -> str:
    if _URGENT_PATTERNS.search(text):
        return "urgent"
    if _CAUTION_PATTERNS.search(text):
        return "caution"
    return "normal"


# ---------------------------------------------------------------------------
# Mock resource data (returned by GET /api/resources)
# ---------------------------------------------------------------------------

MOCK_RESOURCES = [
    {
        "id": "1",
        "name": "City General Hospital",
        "location": "123 Health Ave, Downtown",
        "services": ["Emergency", "General Healthcare", "Vaccination"],
        "openingHours": "Open 24 Hours",
        "contact": "+1 555-0100",
        "distance": "2.5 km",
    },
    {
        "id": "2",
        "name": "Community Health Centre",
        "location": "456 Oak Street, Westside",
        "services": ["General Healthcare", "Maternal Health", "Vaccination"],
        "openingHours": "09:00 - 17:00",
        "contact": "+1 555-0101",
        "distance": "1.2 km",
    },
    {
        "id": "3",
        "name": "Sunrise Pediatric Clinic",
        "location": "789 Pine Road, Eastside",
        "services": ["Child Health", "Vaccination", "Nutrition"],
        "openingHours": "08:00 - 18:00",
        "contact": "+1 555-0102",
        "distance": "3.8 km",
    },
    {
        "id": "4",
        "name": "Wellness Mental Health Center",
        "location": "101 Maple Blvd",
        "services": ["Mental Wellbeing", "Counseling"],
        "openingHours": "10:00 - 20:00",
        "contact": "+1 555-0103",
        "distance": "4.1 km",
    },
    {
        "id": "5",
        "name": "Downtown Pharmacy & Clinic",
        "location": "202 Elm Street",
        "services": ["Vaccination", "General Healthcare"],
        "openingHours": "08:00 - 22:00",
        "contact": "+1 555-0104",
        "distance": "0.8 km",
    },
]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
def index():
    return render_template("index.html")


@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True) or {}
    query = (data.get("message") or "").strip()
    language = (data.get("language") or "en").strip()

    if not query:
        return jsonify({"error": "Please enter a message."}), 400

    try:
        result = agent.invoke({
            "messages": [{"role": "user", "content": query}]
        })
        answer_text = get_answer(result)

        return jsonify({
            "message": answer_text,
            "language": language,
            "safetyLevel": _detect_safety_level(answer_text),
            "sources": [{"title": "CareBridge AI", "url": "#"}],
        })
    except Exception as exc:
        return jsonify({
            "error": "CareBridge could not process that request.",
            "detail": str(exc)
        }), 500


@app.get("/api/resources")
def resources():
    location = (request.args.get("location") or "").strip().lower()
    service = (request.args.get("service") or "").strip().lower()
    open_now = request.args.get("openNow", "").lower() == "true"

    filtered = list(MOCK_RESOURCES)

    if location:
        filtered = [
            r for r in filtered
            if location in r["location"].lower() or location in r["name"].lower()
        ]

    if service:
        filtered = [
            r for r in filtered
            if any(service in s.lower() for s in r["services"])
        ]

    if open_now:
        filtered = [r for r in filtered if "24" in r["openingHours"]]

    return jsonify({"resources": filtered})


# ---------------------------------------------------------------------------
# Image analysis (medicine scan)
# ---------------------------------------------------------------------------

_OR_VISION_MODELS = [
    "google/gemma-4-26b-a4b-it:free",
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
]

_RETRIES_PER_MODEL = 1
_RETRY_DELAY_SECONDS = 2


_LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
}


def _call_openrouter_vision(model_name: str, api_key: str, data_url: str, lang_name: str = "English"):
    prompt = MEDICINE_PROMPT + f"\n\nIMPORTANT: Reply entirely in {lang_name}. Do not use any other language."
    resp = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": model_name,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                }
            ],
        },
        timeout=60,
    )
    return resp


@app.post("/api/analyze-image")
def analyze_image():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No image selected."}), 400

    language = (request.form.get("language") or "en").strip()
    lang_name = _LANGUAGE_NAMES.get(language, "English")

    image_bytes = file.read()
    mime_type = file.content_type or "image/jpeg"
    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{b64_image}"

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return jsonify({
            "error": "Server is missing the OpenRouter API key.",
            "detail": "GEMINI_API_KEY is not set in your .env file."
        }), 500

    last_error = None

    for model_name in _OR_VISION_MODELS:
        attempts = 1 + _RETRIES_PER_MODEL

        for attempt in range(attempts):
            try:
                resp = _call_openrouter_vision(model_name, api_key, data_url, lang_name)
            except Exception as exc:
                last_error = str(exc)
                break

            if resp.status_code == 200:
                answer = resp.json()["choices"][0]["message"]["content"]
                return jsonify({"answer": answer, "model_used": model_name})

            last_error = f"{resp.status_code} {resp.text}"

            if resp.status_code == 429:
                if attempt < attempts - 1:
                    time.sleep(_RETRY_DELAY_SECONDS)
                    continue
                else:
                    break

            if resp.status_code == 404:
                break

            return jsonify({
                "error": "Image analysis failed.",
                "detail": last_error
            }), 500

    return jsonify({
        "error": "All free image-analysis models are rate-limited right now. Please wait a minute and try again.",
        "detail": last_error
    }), 500


if __name__ == "__main__":
    use_https = os.getenv("USE_HTTPS", "0") == "1"

    if use_https:
        try:
            from werkzeug.serving import make_ssl_devcert
            cert_dir = os.path.join(os.path.dirname(__file__), ".ssl")
            os.makedirs(cert_dir, exist_ok=True)
            cert_path = os.path.join(cert_dir, "carebridge")
            if not os.path.exists(cert_path + ".crt"):
                make_ssl_devcert(cert_path, host="localhost")
            ssl_ctx = (cert_path + ".crt", cert_path + ".key")
            print("Running with HTTPS — open https://<your-ip>:5000 in the browser.")
            print("You may need to accept the self-signed certificate warning once.")
        except Exception as e:
            print(f"Could not create SSL cert ({e}); falling back to plain HTTP.")
            ssl_ctx = None
    else:
        ssl_ctx = None
        print("Tip: set USE_HTTPS=1 to enable HTTPS so voice works over the network.")
        print("For local use, open http://localhost:5000 (voice works on localhost).")

    app.run(host="0.0.0.0", port=5000, debug=True, ssl_context=ssl_ctx)
