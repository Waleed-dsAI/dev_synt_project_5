
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str
    generation_model: str = "gemini-2.5-flash"
    embedding_model: str = "gemini-embedding-001"

    upload_dir: str = "storage/uploads"
    chroma_dir: str = "storage/chroma"

    chunk_size: int = 800
    chunk_overlap: int = 150
    top_k: int = 5

    class Config:
        env_file = ".env"


settings = Settings()
