"""
STEP 1 of the document pipeline: turn a raw file into plain text, page by page.
We keep page numbers because the task requires citing "Company_Overview.pdf — Page 3" style sources.
"""
import pymupdf as fitz
import docx


def extract_pdf(path: str) -> list[dict]:
    """Returns [{"page": 1, "text": "..."}, {"page": 2, "text": "..."}, ...]"""
    pages = []
    doc = fitz.open(path)
    for i, page in enumerate(doc, start=1):
        text = page.get_text().strip()
        if text:
            pages.append({"page": i, "text": text})
    doc.close()
    return pages


def extract_docx(path: str) -> list[dict]:
    """DOCX has no native page concept, so we treat the whole doc as one 'page'."""
    document = docx.Document(path)
    text = "\n".join(p.text for p in document.paragraphs if p.text.strip())
    return [{"page": None, "text": text}] if text else []


def extract_txt(path: str) -> list[dict]:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read().strip()
    return [{"page": None, "text": text}] if text else []


def extract_text(path: str, filename: str) -> list[dict]:
    """Router: picks the right extractor based on file extension."""
    ext = filename.lower().rsplit(".", 1)[-1]
    if ext == "pdf":
        return extract_pdf(path)
    elif ext == "docx":
        return extract_docx(path)
    elif ext == "txt":
        return extract_txt(path)
    else:
        raise ValueError(f"Unsupported file type: .{ext}")
