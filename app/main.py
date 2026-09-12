
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import documents, chat

app = FastAPI(title="Document RAG Chatbot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router)
app.include_router(chat.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "RAG backend is running. See /docs for API reference."}
