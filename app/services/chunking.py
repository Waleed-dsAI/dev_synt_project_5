
from app.config import settings


def chunk_page_text(text: str, chunk_size: int = None, overlap: int = None) -> list[str]:
    chunk_size = chunk_size or settings.chunk_size
    overlap = overlap or settings.chunk_overlap

    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]

        # try to end on a sentence/paragraph boundary rather than mid-word
        if end < len(text):
            last_break = max(chunk.rfind("\n\n"), chunk.rfind(". "), chunk.rfind("\n"))
            if last_break > chunk_size * 0.5:  # only trim if we don't lose too much
                chunk = chunk[: last_break + 1]

        chunks.append(chunk.strip())
        start += len(chunk) - overlap if len(chunk) > overlap else len(chunk)

    return [c for c in chunks if c]


def chunk_document(pages: list[dict]) -> list[dict]:
    """
    Input: [{"page": 1, "text": "..."}, ...]
    Output: [{"page": 1, "text": "chunk text..."}, ...] — one entry per chunk,
    still tagged with the page it came from.
    """
    all_chunks = []
    for page in pages:
        for chunk_text in chunk_page_text(page["text"]):
            all_chunks.append({"page": page["page"], "text": chunk_text})
    return all_chunks
