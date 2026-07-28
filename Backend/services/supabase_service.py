"""Supabase persistence service for chatbot conversations and messages."""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / '.env')

logger = logging.getLogger(__name__)


class SupabaseServiceError(Exception):
    """Base exception for a recoverable Supabase persistence failure."""


class SupabaseUnavailableError(SupabaseServiceError):
    """Raised when Supabase is not configured or cannot be reached."""


class SupabaseService:
    """Small, reusable CRUD wrapper around the Supabase Python client.

    The client is created lazily so an unavailable database never prevents Flask
    from starting or affects the application's non-chat APIs.
    """

    def __init__(self) -> None:
        self._url = os.getenv('SUPABASE_URL', '').strip()
        self._anon_key = os.getenv('SUPABASE_ANON_KEY', '').strip()
        self._client: Any | None = None

    @property
    def client(self) -> Any:
        if self._client is not None:
            return self._client
        if not self._url or not self._anon_key:
            raise SupabaseUnavailableError('Supabase is not configured.')
        try:
            from supabase import create_client

            self._client = create_client(self._url, self._anon_key)
            return self._client
        except Exception as exc:
            logger.warning('Unable to initialize Supabase client: %s', type(exc).__name__)
            raise SupabaseUnavailableError('Supabase service is unavailable.') from exc

    @staticmethod
    def _data(response: Any) -> list[dict[str, Any]]:
        return list(getattr(response, 'data', None) or [])

    def _execute(self, operation: Any) -> list[dict[str, Any]]:
        try:
            return self._data(operation.execute())
        except SupabaseServiceError:
            raise
        except Exception as exc:
            logger.warning('Supabase operation failed: %s', type(exc).__name__)
            raise SupabaseUnavailableError('Supabase service is unavailable.') from exc

    def create_conversation(
        self, title: str | None = None, user_id: str | None = None
    ) -> dict[str, Any]:
        """Create and return one conversation, with DB-generated UUID/timestamps."""
        payload = {'title': (title or '').strip()[:50], 'user_id': user_id or None}
        rows = self._execute(self.client.table('conversations').insert(payload))
        if not rows:
            raise SupabaseServiceError('Conversation could not be created.')
        logger.info('Conversation created id=%s', rows[0].get('id'))
        return rows[0]

    def update_conversation(
        self, conversation_id: str, values: dict[str, Any]
    ) -> dict[str, Any] | None:
        """Update a conversation and return it, or ``None`` when it does not exist."""
        payload = {**values, 'updated_at': datetime.now(timezone.utc).isoformat()}
        rows = self._execute(
            self.client.table('conversations').update(payload).eq('id', conversation_id)
        )
        return rows[0] if rows else None

    def delete_conversation(self, conversation_id: str) -> bool:
        """Delete a conversation; the database foreign key cascades its messages."""
        rows = self._execute(
            self.client.table('conversations').delete().eq('id', conversation_id)
        )
        deleted = bool(rows)
        if deleted:
            logger.info('Conversation deleted id=%s', conversation_id)
        return deleted

    def get_conversation(self, conversation_id: str) -> dict[str, Any] | None:
        """Return a conversation by UUID, if it exists."""
        rows = self._execute(
            self.client.table('conversations').select('*').eq('id', conversation_id).limit(1)
        )
        return rows[0] if rows else None

    def list_conversations(self, user_id: str | None = None) -> list[dict[str, Any]]:
        """List conversations with newest activity first."""
        query = self.client.table('conversations').select('*').order('updated_at', desc=True)
        if user_id:
            query = query.eq('user_id', user_id)
        return self._execute(query)

    def save_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Persist one message and update its parent conversation summary."""
        if role not in {'user', 'assistant', 'system'}:
            raise SupabaseServiceError('Invalid message role.')
        conversation = self.get_conversation(conversation_id)
        if conversation is None:
            raise SupabaseServiceError('Conversation not found.')

        rows = self._execute(self.client.table('messages').insert({
            'conversation_id': conversation_id,
            'role': role,
            'content': content,
            'metadata': metadata or {},
        }))
        if not rows:
            raise SupabaseServiceError('Message could not be saved.')

        updates: dict[str, Any] = {
            'last_message': content,
            'message_count': int(conversation.get('message_count') or 0) + 1,
        }
        if role == 'user' and not (conversation.get('title') or '').strip():
            updates['title'] = self._title_from_message(content)
        self.update_conversation(conversation_id, updates)
        logger.info('Message saved conversation_id=%s role=%s', conversation_id, role)
        return rows[0]

    def load_messages(
        self, conversation_id: str, limit: int | None = None
    ) -> list[dict[str, Any]]:
        """Load messages in chronological order, optionally retaining recent turns."""
        query = self.client.table('messages').select('*').eq('conversation_id', conversation_id)
        query = query.order('created_at', desc=bool(limit))
        if limit:
            query = query.limit(limit)
        messages = self._execute(query)
        ordered_messages = list(reversed(messages)) if limit else messages
        logger.info('Messages loaded conversation_id=%s count=%d', conversation_id, len(ordered_messages))
        return ordered_messages

    def update_last_message(
        self, conversation_id: str, last_message: str
    ) -> dict[str, Any] | None:
        """Update the conversation preview text and activity timestamp."""
        return self.update_conversation(conversation_id, {'last_message': last_message})

    def update_message_count(
        self, conversation_id: str, message_count: int
    ) -> dict[str, Any] | None:
        """Set the stored message count and activity timestamp."""
        if message_count < 0:
            raise SupabaseServiceError('Message count cannot be negative.')
        return self.update_conversation(conversation_id, {'message_count': message_count})

    def rename_conversation(
        self, conversation_id: str, title: str
    ) -> dict[str, Any] | None:
        """Rename a conversation after validating a non-empty title."""
        cleaned_title = title.strip()[:50]
        if not cleaned_title:
            raise SupabaseServiceError('Conversation title is required.')
        return self.update_conversation(conversation_id, {'title': cleaned_title})

    @staticmethod
    def _title_from_message(message: str) -> str:
        return ' '.join(message.split())[:50]


supabase_service = SupabaseService()
