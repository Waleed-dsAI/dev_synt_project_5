"""
Pydantic schemas — these define the exact shape of data going in/out of the API.
FastAPI uses these to validate requests and auto-generate API docs at /docs.
"""
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class DocumentInfo(BaseModel):
    id: str
    filename: str
    status: Literal["processing", "processed", "failed"]
    uploaded_at: datetime
    num_chunks: int = 0
    num_pages: Optional[int] = None
    error_message: Optional[str] = None


class DashboardStats(BaseModel):
    total_documents: int
    processed: int
    processing: int
    failed: int
    total_chunks: int
    total_questions: int


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str


class SourceRef(BaseModel):
    document_name: str
    document_id: str
    page_number: Optional[int] = None
    chunk_id: str
    snippet: str


class ChatResponse(BaseModel):
    session_id: str
    answer: str
    sources: list[SourceRef]
    timestamp: datetime


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    timestamp: datetime
    sources: list[SourceRef] = []


class ChatSession(BaseModel):
    session_id: str
    created_at: datetime
    messages: list[ChatMessage]
