"""
Chatbot Interface endpoints: create sessions, send messages, view history.
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.models import ChatRequest, ChatResponse, ChatMessage, ChatSession
from app.services import store, rag

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/sessions", response_model=ChatSession)
def new_session():
    return store.create_session()


@router.get("/sessions", response_model=list[ChatSession])
def list_sessions():
    return store.list_sessions()


@router.get("/sessions/{session_id}", response_model=ChatSession)
def get_session(session_id: str):
    session = store.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    return session


@router.post("/message", response_model=ChatResponse)
def send_message(req: ChatRequest):
    session_id = req.session_id
    if not session_id or not store.get_session(session_id):
        session_id = store.create_session().session_id

    store.add_message(session_id, ChatMessage(role="user", content=req.message, timestamp=datetime.utcnow()))

    try:
        answer, sources = rag.answer_question(req.message)
    except Exception as e:
        raise HTTPException(500, f"Failed to generate answer: {e}")

    timestamp = datetime.utcnow()
    store.add_message(
        session_id,
        ChatMessage(role="assistant", content=answer, timestamp=timestamp, sources=sources),
    )

    return ChatResponse(session_id=session_id, answer=answer, sources=sources, timestamp=timestamp)
