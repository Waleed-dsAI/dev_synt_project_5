"""
STEP 3+4 of the pipeline: store chunk embeddings with metadata, and search them later.

ChromaDB is used because it's file-based (no separate server to run), which matters
under a tight deadline. It stores three things per chunk: the embedding vector, the
raw text (so we can show it back as context), and metadata (doc name, doc id, page, chunk id)
— exactly what the task spec requires for source citations.
"""
import chromadb
from app.config import settings

_client = chromadb.PersistentClient(path=settings.chroma_dir)
_collection = _client.get_or_create_collection(name="documents")


def add_chunks(document_id: str, document_name: str, chunks: list[dict], embeddings: list[list[float]]):
    """
    chunks: [{"page": 1, "text": "...", "chunk_id": "doc123_c0"}, ...]
    embeddings: matching list of vectors, same order as chunks
    """
    _collection.add(
        ids=[c["chunk_id"] for c in chunks],
        embeddings=embeddings,
        documents=[c["text"] for c in chunks],
        metadatas=[
            {
                "document_id": document_id,
                "document_name": document_name,
                "page": c["page"] if c["page"] is not None else -1,
            }
            for c in chunks
        ],
    )


def search(query_embedding: list[float], top_k: int) -> list[dict]:
    results = _collection.query(query_embeddings=[query_embedding], n_results=top_k)
    hits = []
    for i in range(len(results["ids"][0])):
        meta = results["metadatas"][0][i]
        hits.append(
            {
                "chunk_id": results["ids"][0][i],
                "text": results["documents"][0][i],
                "document_id": meta["document_id"],
                "document_name": meta["document_name"],
                "page": meta["page"] if meta["page"] != -1 else None,
                "distance": results["distances"][0][i],
            }
        )
    return hits


def delete_document(document_id: str):
    _collection.delete(where={"document_id": document_id})


def count_chunks() -> int:
    return _collection.count()
