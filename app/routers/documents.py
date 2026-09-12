"""
Document Management endpoints: upload, list, get info, delete, re-process.
This covers the "Document Management" panel required in the frontend spec.
"""
import os
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from app.config import settings
from app.models import DocumentInfo, DashboardStats
from app.services import store, vectorstore, extraction, chunking, embeddings

router = APIRouter(prefix="/documents", tags=["documents"])

ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}


def process_document(doc_id: str, path: str, filename: str):
    """Runs in the background so upload requests return immediately (important at scale)."""
    try:
        pages = extraction.extract_text(path, filename)
        if not pages:
            raise ValueError("No extractable text found in file.")

        chunks = chunking.chunk_document(pages)
        for i, c in enumerate(chunks):
            c["chunk_id"] = f"{doc_id}_c{i}"

        texts = [c["text"] for c in chunks]
        chunk_embeddings = embeddings.embed_texts(texts)

        vectorstore.add_chunks(doc_id, filename, chunks, chunk_embeddings)

        num_pages = max((p["page"] for p in pages if p["page"]), default=None)
        store.update_document(doc_id, status="processed", num_chunks=len(chunks), num_pages=num_pages)

    except Exception as e:
        store.update_document(doc_id, status="failed", error_message=str(e))


@router.post("/upload", response_model=DocumentInfo)
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    ext = file.filename.lower().rsplit(".", 1)[-1] if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type '.{ext}'. Allowed: PDF, DOCX, TXT.")

    doc = store.create_document(file.filename)

    os.makedirs(settings.upload_dir, exist_ok=True)
    path = os.path.join(settings.upload_dir, f"{doc.id}_{file.filename}")
    with open(path, "wb") as f:
        f.write(await file.read())

    background_tasks.add_task(process_document, doc.id, path, file.filename)
    return doc


@router.get("", response_model=list[DocumentInfo])
def list_documents():
    return store.list_documents()


@router.get("/{doc_id}", response_model=DocumentInfo)
def get_document(doc_id: str):
    doc = store.get_document(doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    return doc


@router.delete("/{doc_id}")
def delete_document(doc_id: str):
    doc = store.get_document(doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    vectorstore.delete_document(doc_id)
    store.delete_document(doc_id)
    return {"deleted": doc_id}


@router.post("/{doc_id}/reprocess", response_model=DocumentInfo)
def reprocess_document(doc_id: str, background_tasks: BackgroundTasks):
    doc = store.get_document(doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    matches = [f for f in os.listdir(settings.upload_dir) if f.startswith(doc_id)]
    if not matches:
        raise HTTPException(404, "Original file no longer on disk; please re-upload.")
    path = os.path.join(settings.upload_dir, matches[0])

    vectorstore.delete_document(doc_id)
    store.update_document(doc_id, status="processing", num_chunks=0, error_message=None)
    background_tasks.add_task(process_document, doc_id, path, doc.filename)
    return store.get_document(doc_id)


@router.get("/stats/dashboard", response_model=DashboardStats)
def dashboard_stats():
    docs = store.list_documents()
    return DashboardStats(
        total_documents=len(docs),
        processed=sum(1 for d in docs if d.status == "processed"),
        processing=sum(1 for d in docs if d.status == "processing"),
        failed=sum(1 for d in docs if d.status == "failed"),
        total_chunks=vectorstore.count_chunks(),
        total_questions=store.total_questions(),
    )
