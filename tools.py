"""
CareBridge tools for LangChain 1.x.

Uses the modern @tool decorator instead of the removed/changed
langchain.tools.Tool class.
"""

from datetime import datetime
from langchain_core.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun


# ---------------------------------------------------------
# Web search
# ---------------------------------------------------------

_web_search = DuckDuckGoSearchRun()


@tool
def health_search_tool(query: str) -> str:
    """Search the web for current healthcare information or healthcare resources.

    Use this for location-specific resources, current vaccination/prevention
    information, public-health guidance, or other information that may change.
    Prefer trustworthy medical/public-health sources in the final answer.
    """
    try:
        return _web_search.run(query)
    except Exception as e:
        return f"Healthcare web search failed: {e}"


# ---------------------------------------------------------
# Save useful responses
# ---------------------------------------------------------

@tool
def save_tool(data: str) -> str:
    """Save a CareBridge response or useful healthcare information to a text file."""
    filename = "carebridge_output.txt"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    formatted_text = (
        "--- CareBridge Healthcare Information ---\n"
        f"Timestamp: {timestamp}\n\n"
        f"{data}\n\n"
    )

    try:
        with open(filename, "a", encoding="utf-8") as f:
            f.write(formatted_text)

        return f"Data successfully saved to {filename}"
    except Exception as e:
        return f"Could not save the information: {e}"
