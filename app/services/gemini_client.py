"""
Gemini wrapper — used ONLY for generation (answering questions) now.
Embeddings were moved to embeddings.py (local, via sentence-transformers) so this
file no longer needs to talk to Gemini's embedding endpoint at all.
"""
from google import genai
from app.config import settings

_client = genai.Client(api_key=settings.gemini_api_key)


def generate_answer(prompt: str) -> str:
    response = _client.models.generate_content(
        model=settings.generation_model,
        contents=prompt,
    )
    return response.text
