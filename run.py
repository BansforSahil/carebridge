"""
CareBridge — One-command launcher
Run with:  python run.py

What it does:
  1. Creates a Python venv if one doesn't exist
  2. Installs / upgrades Python dependencies
  3. Installs Node.js dependencies (npm ci) inside frontend/
  4. Builds the React frontend (npm run build) → outputs to frontend_dist/
  5. Opens http://localhost:5000 in your browser
  6. Starts the Flask backend (serves both the API and the built React app)
"""

import os
import sys
import subprocess
import webbrowser
import time
import threading
import shutil

# ── Paths ────────────────────────────────────────────────────────────────────
ROOT         = os.path.dirname(os.path.abspath(__file__))
VENV_DIR     = os.path.join(ROOT, ".venv")
FRONTEND_DIR = os.path.join(ROOT, "frontend")
DIST_DIR     = os.path.join(ROOT, "frontend_dist")
REQUIREMENTS = os.path.join(ROOT, "requirements.txt")
WEBAPP       = os.path.join(ROOT, "webapp.py")
PORT         = int(os.environ.get("PORT", 5000))
URL          = f"http://localhost:{PORT}"   # always localhost — required for mic/voice

if sys.platform == "win32":
    VENV_PYTHON = os.path.join(VENV_DIR, "Scripts", "python.exe")
    VENV_PIP    = os.path.join(VENV_DIR, "Scripts", "pip.exe")
else:
    VENV_PYTHON = os.path.join(VENV_DIR, "bin", "python")
    VENV_PIP    = os.path.join(VENV_DIR, "bin", "pip")


def step(msg: str):
    print(f"\n[CareBridge] {msg}")


def run(cmd, **kwargs):
    """Run a command, raise on failure."""
    subprocess.check_call(cmd, **kwargs)


# ── 1. Python venv ───────────────────────────────────────────────────────────
if not os.path.isfile(VENV_PYTHON):
    step("Creating Python virtual environment...")
    run([sys.executable, "-m", "venv", VENV_DIR])

# ── 2. Python dependencies ───────────────────────────────────────────────────
step("Installing Python dependencies...")
run([VENV_PYTHON, "-m", "pip", "install", "--quiet", "--upgrade", "pip"])
run([VENV_PYTHON, "-m", "pip", "install", "--quiet", "-r", REQUIREMENTS])
step("Python dependencies ready.")

# ── 3. Node.js check ─────────────────────────────────────────────────────────
npm = shutil.which("npm")
if not npm:
    print("\n[CareBridge] ERROR: npm not found.")
    print("  Install Node.js from https://nodejs.org (LTS version recommended).")
    print("  After installing, restart this script.")
    sys.exit(1)

# ── 4. Install frontend npm packages ────────────────────────────────────────
step("Installing frontend npm packages...")
# Use 'npm install' (not 'npm ci') so it works even without package-lock.json
run([npm, "install", "--silent"], cwd=FRONTEND_DIR)
step("npm packages ready.")

# ── 5. Build React frontend ──────────────────────────────────────────────────
step("Building React frontend...")
run([npm, "run", "build"], cwd=FRONTEND_DIR)
step(f"Frontend built → {DIST_DIR}")

# ── 6. Open browser after short delay ───────────────────────────────────────
def _open_browser():
    time.sleep(2.5)
    webbrowser.open(URL)

threading.Thread(target=_open_browser, daemon=True).start()

# ── 7. Start Flask ───────────────────────────────────────────────────────────
step(f"Starting CareBridge at {URL}  (press Ctrl+C to stop)\n")
os.environ["PORT"] = str(PORT)
os.execv(VENV_PYTHON, [VENV_PYTHON, WEBAPP])
