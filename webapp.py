from flask import Flask, send_from_directory, request, jsonify, session
from flask_cors import CORS
from main import agent, get_answer
import os
import re
import time
import base64
import uuid
import requests
from dotenv import load_dotenv

load_dotenv()

# Resolve the built React app directory (one level up from this file)
_ROOT         = os.path.dirname(os.path.abspath(__file__))
_FRONTEND_DIR = os.path.join(_ROOT, "frontend_dist")

app = Flask(__name__, static_folder=_FRONTEND_DIR, static_url_path="")
app.secret_key = os.getenv("FLASK_SECRET_KEY", os.urandom(24))

# Session cookie must be Lax (not Strict) so it is sent on same-origin fetch()
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_HTTPONLY"] = True

# Allow the Vite dev server to reach /api/* during development.
# supports_credentials=True is needed so the browser sends the session cookie.
CORS(app,
     resources={r"/api/*": {"origins": [
         "http://localhost:5173",
         "http://127.0.0.1:5173",
         "http://localhost:3000",
         "http://localhost:5000",
         "http://127.0.0.1:5000",
     ]}},
     supports_credentials=True)

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

@app.get("/", defaults={"path": ""})
@app.get("/<path:path>")
def serve_frontend(path: str):
    """Serve the built React app for every non-API route."""
    # Serve a real file if it exists (JS, CSS, assets…)
    full = os.path.join(_FRONTEND_DIR, path)
    if path and os.path.isfile(full):
        return send_from_directory(_FRONTEND_DIR, path)
    # Fall back to index.html so React Router handles the route
    return send_from_directory(_FRONTEND_DIR, "index.html")


# In-memory conversation history keyed by session ID.
# Each value is a list of LangChain message dicts.
_conversations: dict = {}


@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True) or {}
    query = (data.get("message") or "").strip()
    language = (data.get("language") or "en").strip()

    if not query:
        return jsonify({"error": "Please enter a message."}), 400

    # Assign a session ID so conversation history persists across requests
    if "sid" not in session:
        session["sid"] = str(uuid.uuid4())
    sid = session["sid"]

    history = _conversations.setdefault(sid, [])

    # Inject language instruction into the user message when non-English
    lang_names = {"en": "English", "hi": "Hindi"}
    lang_name = lang_names.get(language, "English")
    user_content = query
    if language != "en":
        user_content = f"[Please reply in {lang_name}] {query}"

    history.append({"role": "user", "content": user_content})

    try:
        result = agent.invoke({"messages": history})
        answer_text = get_answer(result)

        # Update history with the full message list returned by the agent
        # (includes tool calls, intermediate steps, etc.)
        _conversations[sid] = result.get("messages", history)

        return jsonify({
            "message": answer_text,
            "language": language,
            "safetyLevel": _detect_safety_level(answer_text),
            "sources": [{"title": "CareBridge AI", "url": "#"}],
        })
    except Exception as exc:
        # Remove the last user message from history so it can be retried
        if history:
            history.pop()
        return jsonify({
            "error": "CareBridge could not process that request.",
            "detail": str(exc)
        }), 500


@app.post("/api/clear")
def clear_history():
    """Clears the server-side conversation history for this session."""
    if "sid" in session:
        _conversations.pop(session["sid"], None)
    return jsonify({"ok": True})


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
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    "google/gemma-4-26b-a4b-it:free",
    "google/gemma-4-31b-it:free",
]

_RETRIES_PER_MODEL = 2
_RETRY_DELAY_SECONDS = 3


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

    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        return jsonify({
            "error": "Server is missing the OpenRouter API key.",
            "detail": "OPENROUTER_API_KEY is not set in your .env file."
        }), 500

    last_error = None

    for model_name in _OR_VISION_MODELS:
        attempts = 1 + _RETRIES_PER_MODEL

        for attempt in range(attempts):
            try:
                resp = _call_openrouter_vision(model_name, api_key, data_url, lang_name)
            except Exception as exc:
                last_error = str(exc)
                break  # network error — skip to next model

            body = resp.json()

            # OpenRouter sometimes returns status 200 with an error payload
            # (e.g. {"error": {"code": 429, ...}}) — handle that too
            if resp.status_code == 200 and "choices" in body:
                answer = body["choices"][0]["message"]["content"]
                return jsonify({"answer": answer, "model_used": model_name})

            # Extract a readable error from the body if possible
            err_body = body.get("error", {})
            err_code = err_body.get("code", resp.status_code)
            err_msg  = err_body.get("message", resp.text)
            last_error = f"{err_code}: {err_msg}"

            # Rate-limited — retry after delay, then move to next model
            if resp.status_code == 429 or err_code == 429:
                if attempt < attempts - 1:
                    time.sleep(_RETRY_DELAY_SECONDS)
                    continue
                break  # exhausted retries for this model

            # Model not found — skip immediately
            if resp.status_code == 404:
                break

            # Any other non-200 — report immediately
            return jsonify({
                "error": "Image analysis failed.",
                "detail": last_error
            }), 500

    return jsonify({
        "error": "All free image-analysis models are rate-limited right now. Please wait a minute and try again.",
        "detail": last_error
    }), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
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
            print(f"Running with HTTPS — open https://localhost:{port} in the browser.")
        except Exception as e:
            print(f"Could not create SSL cert ({e}); falling back to plain HTTP.")
            ssl_ctx = None
    else:
        ssl_ctx = None
        print(f"CareBridge is running → open http://localhost:{port}")
        print("NOTE: Voice input requires the page to be open on localhost (not an IP address).")

    # Bind only to localhost — this is intentional.
    # Voice (SpeechRecognition) and cookies require a secure context.
    # localhost is treated as secure by all browsers; a plain-http IP address is not.
    app.run(host="127.0.0.1", port=port, debug=False, ssl_context=ssl_ctx)
