from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
import os

# ✅ Load .env
load_dotenv()

# ✅ Create FastAPI app
app = FastAPI()

# ✅ Allow frontend requests (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Initialize OpenAI client
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("❌ Missing OPENAI_API_KEY in environment variables or .env file")

client = OpenAI(api_key=api_key)

# ✅ Request model
class Query(BaseModel):
    text: str

# ✅ POST endpoint
@app.post("/ask")
async def ask(query: Query):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are Smart Work Assistant — summarize, make to-do lists, generate code snippets, and decide intelligently.",
            },
            {"role": "user", "content": query.text},
        ],
    )
    answer = completion.choices[0].message.content
    return {"response": answer}
