"""
Embeddings via Gemini's API. Not sentence-transformers, because that pulls in torch,
which alone uses more RAM than Render's free tier (512MB) allows, and also hits
Windows Smart App Control blocks on some locked-down machines. Gemini's API is just
an HTTPS call — tiny memory footprint, no native binaries, works everywhere.
"""
from google import genai
from app.config import settings

_client = genai.Client(api_key=settings.gemini_api_key)


def embed_texts(texts: list[str], task_type: str = "retrieval_document") -> list[list[float]]:
    result = _client.models.embed_content(
        model=settings.embedding_model,
        contents=texts,
        config={"task_type": task_type},
    )
    return [e.values for e in result.embeddings]


def embed_query(text: str) -> list[float]:
    return embed_texts([text], task_type="retrieval_query")[0]
