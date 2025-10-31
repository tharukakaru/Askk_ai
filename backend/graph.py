import os
import requests
from dotenv import load_dotenv

load_dotenv()

LANGRAPH_API = os.getenv("LANGRAPH_API")
LANGRAPH_KEY = os.getenv("LANGRAPH_KEY")

def get_ai_response(prompt):
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {LANGRAPH_KEY}"
    }
    payload = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": prompt}]
    }
    try:
        response = requests.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Error: {str(e)}"
