"""Per-conversation state for contextual, in-memory chatbot sessions."""
from __future__ import annotations

from collections import defaultdict, deque
from datetime import datetime, timezone
from threading import RLock
from typing import Any


class ConversationManager:
    """Stores messages plus the state needed to resolve natural follow-ups."""

    def __init__(self, max_messages: int = 12) -> None:
        self._sessions: dict[str, dict[str, Any]] = defaultdict(self._new_session)
        self._max_messages = max_messages
        self._lock = RLock()

    def _new_session(self) -> dict[str, Any]:
        return {
            "messages": deque(maxlen=self._max_messages),
            "current_topic": None,
            "last_retrieved_documents": [],
            "last_intent": None,
        }

    def history(self, conversation_id: str) -> list[dict[str, str]]:
        with self._lock:
            return [
                {"role": item["role"], "content": item["content"]}
                for item in self._sessions[conversation_id]["messages"]
            ]

    def last_user_message(self, conversation_id: str) -> str | None:
        return self._last_message(conversation_id, "user")

    def last_assistant_message(self, conversation_id: str) -> str | None:
        return self._last_message(conversation_id, "assistant")

    def _last_message(self, conversation_id: str, role: str) -> str | None:
        with self._lock:
            for item in reversed(self._sessions[conversation_id]["messages"]):
                if item["role"] == role:
                    return item["content"]
        return None

    def context(self, conversation_id: str) -> dict[str, Any]:
        with self._lock:
            session = self._sessions[conversation_id]
            return {
                "history": self.history(conversation_id),
                "last_user_message": self.last_user_message(conversation_id),
                "last_assistant_message": self.last_assistant_message(conversation_id),
                "current_topic": session["current_topic"],
                "last_retrieved_documents": list(session["last_retrieved_documents"]),
                "last_intent": session["last_intent"],
            }

    def hydrate(
        self,
        conversation_id: str,
        messages: list[dict[str, Any]],
        current_topic: str | None = None,
        retrieved_documents: list[Any] | None = None,
    ) -> None:
        """Restore recent persisted history into the existing in-memory context."""
        with self._lock:
            session = self._sessions[conversation_id]
            session['messages'].clear()
            for message in messages[-self._max_messages:]:
                session['messages'].append({
                    'role': message['role'],
                    'content': message['content'],
                    'timestamp': message.get('created_at'),
                    'conversation_id': conversation_id,
                })
            session['current_topic'] = current_topic
            session['last_retrieved_documents'] = list(retrieved_documents or [])

    def record_exchange(
        self,
        conversation_id: str,
        user_message: str,
        assistant_message: str,
        intent: str,
        topic: str | None,
        retrieved_documents: list[Any] | None = None,
    ) -> None:
        timestamp = datetime.now(timezone.utc).isoformat()
        with self._lock:
            session = self._sessions[conversation_id]
            session["messages"].append({"role": "user", "content": user_message, "timestamp": timestamp, "conversation_id": conversation_id})
            session["messages"].append({"role": "assistant", "content": assistant_message, "timestamp": timestamp, "conversation_id": conversation_id})
            session["last_intent"] = intent
            if topic:
                session["current_topic"] = topic
            if retrieved_documents is not None:
                session["last_retrieved_documents"] = list(retrieved_documents)
