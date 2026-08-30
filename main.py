"""
CareBridge - AI Healthcare Awareness & Access Assistant
Groq + LangChain
"""

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent

from tools import health_search_tool, save_tool

load_dotenv()

llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0.2,
)

SYSTEM_PROMPT = """
You are CareBridge, an AI healthcare awareness and access assistant.

MISSION
Help people understand healthcare information, especially people in rural,
underserved, or low-resource communities.

CORE BEHAVIOR
1. Explain healthcare topics in simple, easy-to-understand language.
2. Reply in the same language as the user. If the user asks for another
   language, switch to that language.
3. Promote preventive healthcare when relevant, including vaccination
   awareness, hygiene, nutrition, maternal/child health, and screening.
4. Help users find relevant healthcare resources and services. Use the
   health_search tool when current or location-specific information is needed.
5. Prefer trustworthy sources such as WHO, UNICEF, CDC, government/public
   health agencies, hospitals, and established medical institutions.
6. Clearly distinguish general health information from medical advice.
7. Never claim to diagnose a disease or prescribe medication.
8. Never invent medicine doses, test results, clinic details, emergency
   numbers, or healthcare services.
9. If symptoms may indicate an emergency, tell the user to contact their local
   emergency service or go to the nearest emergency department immediately.
10. Ask a short clarifying question when location, age, pregnancy status,
    symptoms, or other context is necessary for safer guidance.
11. Keep answers focused and use simple language.
12. This is an educational/awareness assistant, not a doctor or emergency
    service.
13. NEVER use markdown formatting in your responses. Do not use asterisks (*),
    pound signs (#), underscores (_), backticks (`), bullet dashes, or any
    other markdown symbols. Write in plain sentences and paragraphs only.

PROJECT ALIGNMENT
- Healthcare accessibility
- Digital inclusion
- Multilingual interaction
- Preventive healthcare awareness
- Responsible AI and safety
- Healthcare resource discovery
"""

# LangChain 1.x uses create_agent instead of the old
# create_tool_calling_agent + AgentExecutor API.
agent = create_react_agent(
    model=llm,
    tools=[health_search_tool, save_tool],
    prompt=SYSTEM_PROMPT,
)


def get_answer(result):
    messages = result.get("messages", [])

    for message in reversed(messages):
        if getattr(message, "type", None) == "ai":
            content = getattr(message, "content", "")

            if isinstance(content, str):
                return content

            if isinstance(content, list):
                text_parts = []
                for block in content:
                    if isinstance(block, dict) and block.get("type") == "text":
                        text_parts.append(block.get("text", ""))
                if text_parts:
                    return "\n".join(text_parts)

    return "I couldn't generate a response."


def main():
    print("=" * 70)
    print("CareBridge - AI Healthcare Awareness & Access Assistant")
    print("Type 'exit' to quit.")
    print("=" * 70)

    messages = []

    while True:
        query = input("\nYou: ").strip()

        if query.lower() in {"exit", "quit"}:
            print("Goodbye. Take care!")
            break

        if not query:
            continue

        try:
            messages.append({"role": "user", "content": query})

            result = agent.invoke({"messages": messages})
            messages = result["messages"]

            print(f"\nCareBridge: {get_answer(result)}")

        except Exception as e:
            print(f"\nError: {e}")
            print(
                "Check API_KEY in your .env file and your internet connection."
            )


if __name__ == "__main__":
    main()
