"""Retrieval-first orchestration with OpenRouter as the generation provider."""
from __future__ import annotations

import json
import logging
from uuid import UUID

from config import MODELS_DIR
from services.supabase_service import supabase_service
from .conversation_manager import ConversationManager
from .domain_guard import DOMAIN, FOLLOW_UP, OUT_OF_SCOPE, domain_guard
from .intent_detector import intent_detector
from .knowledge_loader import KnowledgeBase
from .openrouter_service import LLMServiceUnavailable, OpenRouterService
from .response_builder import build_response_prompt
from .topic_tracker import topic_tracker

logger = logging.getLogger(__name__)


class RAGService:
    """Strict domain orchestration: guard -> retrieval/context -> generation."""

    def __init__(self) -> None:
        self.knowledge = KnowledgeBase()
        self.conversations = ConversationManager()
        self.openrouter = OpenRouterService()

    def _artifact_context(self, question: str) -> str:
        lowered = question.lower()
        triggers = ('accuracy', 'metric', 'score', 'precision', 'recall', 'f1', 'rmse', 'mae', 'mse', 'r2', 'performance', 'prediction')
        if not any(term in lowered for term in triggers):
            return ''
        requested = [kind for kind in ('classification', 'causality', 'regression') if kind in lowered]
        content: list[str] = []
        for kind in requested or ('classification', 'causality', 'regression'):
            try:
                metrics = json.loads((MODELS_DIR / kind / 'metrics' / 'metrics.json').read_text(encoding='utf-8'))
                content.append(f'{kind.title()} saved metrics: {metrics}')
            except (OSError, json.JSONDecodeError):
                continue
        return '\n'.join(content)

    @staticmethod
    def _is_conversation_id(value: str) -> bool:
        if not value:
            return False
        try:
            UUID(str(value))
            return True
        except (TypeError, ValueError):
            return False

    def _hydrate_conversation_history(self, conversation_id: str) -> None:
        if not self._is_conversation_id(conversation_id):
            return
        try:
            messages = supabase_service.load_messages(conversation_id, limit=10)
        except Exception as exc:  # pragma: no cover - defensive for runtime service issues
            logger.warning('Conversation history load failed session=%s error=%s', conversation_id, exc)
            return
        if not messages:
            return
        last_user = next(
            (message['content'] for message in reversed(messages) if message.get('role') == 'user'),
            None,
        )
        topic = topic_tracker.identify(last_user or '')
        chunks = self.knowledge.search(last_user) if last_user else []
        self.conversations.hydrate(conversation_id, messages, topic, chunks)
        logger.info('Loaded conversation history session=%s count=%d', conversation_id, len(messages))

    def answer(self, question: str, session_id: str = 'default') -> dict[str, object]:
        """Answer only domain requests; this is the sole OpenRouter call path."""
        question = question.strip()
        context = self.conversations.context(session_id)

        if self._is_conversation_id(session_id):
            self._hydrate_conversation_history(session_id)
            context = self.conversations.context(session_id)

        # Check if this could be a follow-up (only if we have prior context)
        has_prior_context = bool(context['last_assistant_message'])
        is_follow_up = intent_detector.is_follow_up(question, has_prior_context)
        
        if is_follow_up:
            logger.info('Detected FOLLOW_UP session=%s', session_id)
            context = self.conversations.context(session_id)
            chunks = context['last_retrieved_documents']
            last_topic = context['current_topic']
            last_response = context['last_assistant_message']
            
            # If we have prior context, use it; otherwise try to infer from topic or provide guidance
            if last_response and chunks:
                topic = last_topic
                artifacts = ''
                logger.info('Previous topic: %s', topic or 'Not established')
                logger.info('Sending history to OpenRouter session=%s', session_id)
                intent = FOLLOW_UP
            else:
                # Fallback: even without prior chunks, if we have a topic, try to search again
                if last_topic:
                    logger.info('Prior topic found, searching for: %s', last_topic)
                    chunks = self.knowledge.search(last_topic)
                    topic = last_topic
                    artifacts = self._artifact_context(question)
                    if chunks:
                        intent = FOLLOW_UP
                    else:
                        reply = "I couldn't find relevant information in the PharmaVigil AI knowledge base."
                        self.conversations.record_exchange(
                            session_id, question, reply, FOLLOW_UP, last_topic
                        )
                        return {'reply': reply, 'sources': []}
                else:
                    reply = "Please provide more context about what you'd like me to help with."
                    self.conversations.record_exchange(
                        session_id, question, reply, FOLLOW_UP, None
                    )
                    return {'reply': reply, 'sources': []}
        else:
            intent = domain_guard.classify(question)
            context = self.conversations.context(session_id)

            if intent == OUT_OF_SCOPE:
                reply = domain_guard.refusal()
                self.conversations.record_exchange(
                    session_id, question, reply, intent, context['current_topic']
                )
                logger.info('Chat request refused session=%s intent=%s', session_id, intent)
                return {'reply': reply, 'sources': []}

            if intent == DOMAIN:
                chunks = self.knowledge.search(question)
                topic = topic_tracker.identify(question, context['current_topic'])
                artifacts = self._artifact_context(question)
                if not chunks:
                    reply = "I couldn't find relevant information in the PharmaVigil AI knowledge base."
                    self.conversations.record_exchange(
                        session_id, question, reply, intent, topic, []
                    )
                    logger.info('Chat request lacked knowledge session=%s', session_id)
                    return {'reply': reply, 'sources': []}
            else:
                chunks = context['last_retrieved_documents']
                topic = context['current_topic']
                artifacts = ''

        logger.info('RAG request session=%s intent=%s retrieved_chunks=%d', session_id, intent, len(chunks))
        prompt = build_response_prompt(
            question, chunks, artifacts, context['history'], topic
        )
        reply = self.openrouter.generate_response(prompt)
        self.conversations.record_exchange(
            session_id, question, reply, intent, topic,
            chunks if intent == DOMAIN else None,
        )
        return {'reply': reply, 'sources': self.knowledge.sources(chunks)}


rag_service = RAGService()
