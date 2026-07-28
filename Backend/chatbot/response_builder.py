"""Builds a constrained RAG prompt with history before knowledge and question."""
from __future__ import annotations

from .knowledge_loader import KnowledgeChunk

SYSTEM_PROMPT = '''You are PharmaVigil AI.

You are NOT ChatGPT. You are NOT a general assistant.

You ONLY answer questions related to Pharmacovigilance, Drug Safety, the PharmaVigil AI Project, Dataset, Machine Learning, Classification, Regression, Causality, SHAP, Dashboard, Visualizations, APIs, and Project Documentation.

If a user asks unrelated questions, politely refuse. Never answer programming questions. Never write unrelated code. Never answer sports, politics, movies, mathematics, or general knowledge. Never hallucinate.

Use retrieved knowledge as the primary source. If retrieved knowledge is empty, say that information is unavailable. Be concise, professional, medically responsible, and context-aware.'''


def build_response_prompt(
    question: str,
    chunks: list[KnowledgeChunk],
    artifacts: str,
    history: list[dict[str, str]],
    current_topic: str | None = None,
) -> str:
    conversation = "\n".join(f"{item['role'].title()}: {item['content']}" for item in history[-8:]) or "No previous messages."
    knowledge = "\n\n".join(f"[Source: {chunk.source}]\n{chunk.text}" for chunk in chunks) or "No relevant documentation retrieved."
    return f'''SYSTEM PROMPT:
{SYSTEM_PROMPT}

CONVERSATION HISTORY:
{conversation}

CURRENT TOPIC:
{current_topic or 'Not established'}

RETRIEVED KNOWLEDGE:
{knowledge}

LIVE MODEL ARTIFACT CONTEXT:
{artifacts or 'No relevant artifact data.'}

CURRENT USER QUESTION:
{question}

INSTRUCTIONS:
Answer the current question using the retrieved knowledge and conversation history. For a follow-up, preserve the established topic and adapt the previous answer as requested. Do not introduce facts not supported by the retrieved knowledge.'''
