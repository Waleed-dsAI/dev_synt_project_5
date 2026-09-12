# RAG Backend — Setup

## 1. Install dependencies

```
pip install -r requirements.txt
```

## 2. Configure environment
```
cp .env.example .env
```


## 3. Run the server
```
uvicorn app.main:app --reload
```


## Folder structure
```
app/
  main.py            # FastAPI app + router registration
  config.py          # loads .env into typed settings
  models.py          # Pydantic request/response schemas
  routers/
    documents.py      # upload, list, delete, reprocess, dashboard stats
    chat.py           # chat sessions + message endpoint
  services/
    extraction.py     # PDF/DOCX/TXT -> text (with page numbers)
    chunking.py        # text -> overlapping chunks
    gemini_client.py   # Gemini embeddings + generation wrapper
    vectorstore.py     # ChromaDB storage + semantic search
    rag.py              # retrieval + grounded prompt + hallucination guardrail
    store.py            # in-memory document/session metadata
storage/
  uploads/            # raw uploaded files land here
  chroma/              # ChromaDB's on-disk vector index
```

## Key endpoints
| Method | Path | Purpose |
|---|---|---|
| POST | /documents/upload | upload a PDF/DOCX/TXT, processes in background |
| GET | /documents | list all documents + status |
| GET | /documents/{id} | single document info |
| DELETE | /documents/{id} | delete a document + its chunks |
| POST | /documents/{id}/reprocess | re-run extraction/chunking/embedding |
| GET | /documents/stats/dashboard | counts for the dashboard home page |
| POST | /chat/sessions | start a new chat session |
| GET | /chat/sessions | list past sessions |
| GET | /chat/sessions/{id} | full history of one session |
| POST | /chat/message | ask a question, get answer + sources |

## How the hallucination guardrail works
See `app/services/rag.py`. The model is only ever given retrieved chunks as context and
is explicitly instructed to say it couldn't find the answer rather than guess. Test this
with a question that has nothing to do with your documents (e.g. "What's the weather in Tokyo?").


