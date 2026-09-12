"""
STEP 5+6 of the pipeline (question side): retrieve relevant chunks, build a grounded
prompt, and generate an answer that must NOT rely on the model's general knowledge.

This is the file that matters most for the "RAG Requirements & Hallucination Guardrails"
section of your task. Two things enforce grounding:
  1. The prompt explicitly instructs the model to say "I couldn't find that in the
     documents" if the context doesn't contain the answer.
  2. We only ever pass retrieved chunks as context — never let the model answer from
     its own training knowledge about real estate in general.
"""
from app.config import settings
from app.services import vectorstore, embeddings, gemini_client
from app.models import SourceRef

NOT_FOUND_PHRASE = "I couldn't find this information in the uploaded documents."

PROMPT_TEMPLATE = """You are a helpful assistant that answers questions ONLY using the context below, \
which was retrieved from the user's uploaded documents. Do not use any outside knowledge.

RULES:
- If the answer is fully or partially contained in the context, answer using only that information.
- If the context does not contain the answer, respond EXACTLY with: "{not_found}"
- Never guess, assume, or fabricate details not present in the context.
- Be concise and direct.

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:"""


def answer_question(question: str) -> tuple[str, list[SourceRef]]:
    query_embedding = embeddings.embed_query(question)
    hits = vectorstore.search(query_embedding, top_k=settings.top_k)

    if not hits:
        return NOT_FOUND_PHRASE, []

    context = "\n\n---\n\n".join(
        f"[Source: {h['document_name']}"
        + (f", Page {h['page']}" if h['page'] else "")
        + f"]\n{h['text']}"
        for h in hits
    )

    prompt = PROMPT_TEMPLATE.format(not_found=NOT_FOUND_PHRASE, context=context, question=question)
    answer = gemini_client.generate_answer(prompt).strip()

    # If the model says it couldn't find the answer, don't attach misleading sources
    if NOT_FOUND_PHRASE.lower() in answer.lower():
        return NOT_FOUND_PHRASE, []

    sources = [
        SourceRef(
            document_name=h["document_name"],
            document_id=h["document_id"],
            page_number=h["page"],
            chunk_id=h["chunk_id"],
            snippet=h["text"][:200],
        )
        for h in hits
    ]
    return answer, sources
