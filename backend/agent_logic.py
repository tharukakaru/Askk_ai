# backend/agent_logic.py
import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

SYSTEM_PROMPT = """You are SmartWorkAssistant.
You help users by:
- Summarizing text clearly
- Making to-do lists when asked
- Writing short, useful code snippets
- Suggesting the next action after each response
Be concise and professional."""

def run_agent(user_input: str):
    """Calls the model securely from the backend only"""
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_input},
    ]
    try:
        resp = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=400,
            temperature=0.3
        )
        return resp["choices"][0]["message"]["content"].strip()
    except Exception as e:
        return f"Error: {str(e)}"
