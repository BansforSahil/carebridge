# CareBridge IBM-style frontend

This adds a minimal IBM/Carbon-inspired web UI to the existing CareBridge LangChain/Groq backend.

## Files
- `webapp.py` — Flask web server/API
- `templates/index.html` — UI
- `static/styles.css` — IBM-inspired styling

## Run

1. Install dependencies:
   `pip install -r requirements.txt`

2. Start:
   `python webapp.py`

3. Open:
   `http://localhost:5000`

The existing `main(1).py` and `tools(1).py` should be renamed to `main.py` and `tools.py` in the project folder because the imports in the original code use those module names.

The existing backend uses Groq + LangChain and exposes healthcare web search and response-saving tools. The frontend calls the same agent through `/api/chat`.
