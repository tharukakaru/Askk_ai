from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import Message
from graph import get_ai_response

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend is running!"}

@app.post("/ask")
def ask_ai(message: Message):
    response = get_ai_response(message.text)
    return {"response": response}

# Run with: uvicorn main:app --reload --port 8000
