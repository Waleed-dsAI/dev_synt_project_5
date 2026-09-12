"""
Tracks document metadata (status, chunk counts) and chat sessions in memory.

NOTE for you: this resets when the server restarts, which is fine for a graded demo.
For real production you'd swap this for a Postgres table — the rest of the app doesn't
need to change, since everything goes through the functions below.
"""
import uuid
from datetime import datetime
from app.models import DocumentInfo, ChatSession, ChatMessage

_documents: dict[str, DocumentInfo] = {}
_sessions: dict[str, ChatSession] = {}
_total_questions = 0


# ---- documents ----

def create_document(filename: str) -> DocumentInfo:
    doc_id = str(uuid.uuid4())
    doc = DocumentInfo(id=doc_id, filename=filename, status="processing", uploaded_at=datetime.utcnow())
    _documents[doc_id] = doc
    return doc


def update_document(doc_id: str, **kwargs):
    doc = _documents[doc_id]
    for k, v in kwargs.items():
        setattr(doc, k, v)


def get_document(doc_id: str) -> DocumentInfo | None:
    return _documents.get(doc_id)


def list_documents() -> list[DocumentInfo]:
    return sorted(_documents.values(), key=lambda d: d.uploaded_at, reverse=True)


def delete_document(doc_id: str):
    _documents.pop(doc_id, None)


# ---- chat sessions ----

def create_session() -> ChatSession:
    session_id = str(uuid.uuid4())
    session = ChatSession(session_id=session_id, created_at=datetime.utcnow(), messages=[])
    _sessions[session_id] = session
    return session


def get_session(session_id: str) -> ChatSession | None:
    return _sessions.get(session_id)


def add_message(session_id: str, message: ChatMessage):
    global _total_questions
    _sessions[session_id].messages.append(message)
    if message.role == "user":
        _total_questions += 1


def list_sessions() -> list[ChatSession]:
    return sorted(_sessions.values(), key=lambda s: s.created_at, reverse=True)


def total_questions() -> int:
    return _total_questions
