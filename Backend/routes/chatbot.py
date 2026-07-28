from uuid import UUID

from flask import Blueprint, request

from chatbot.rag_service import rag_service
from chatbot.topic_tracker import topic_tracker
from chatbot.openrouter_service import LLMServiceUnavailable
from services.supabase_service import (
    SupabaseServiceError,
    SupabaseUnavailableError,
    supabase_service,
)
from utils.helpers import error_response, success_response

chatbot_bp = Blueprint('chatbot', __name__)


def _valid_conversation_id(value: str) -> bool:
    try:
        UUID(str(value))
        return True
    except (TypeError, ValueError):
        return False


def _load_rag_history(conversation_id: str) -> None:
    """Restore persistent history before the existing RAG service builds a prompt."""
    messages = supabase_service.load_messages(conversation_id, limit=10)
    last_user = next(
        (message['content'] for message in reversed(messages) if message['role'] == 'user'),
        None,
    )
    topic = topic_tracker.identify(last_user or '')
    # Rebuild the previous turn's context after a Flask restart so a terse
    # follow-up (for example, "make it shorter") remains grounded.
    chunks = rag_service.knowledge.search(last_user) if last_user else []
    rag_service.conversations.hydrate(conversation_id, messages, topic, chunks)


@chatbot_bp.route('/chatbot', methods=['POST'])
def chat():
    try:
        payload = request.get_json(silent=True) or {}
        message = payload.get('message') or payload.get('question') or ''
        if not message:
            return error_response('A message or question is required.', 400)
        session_id = str(payload.get('session_id') or 'default')[:100]
        return success_response(rag_service.answer(message, session_id))
    except LLMServiceUnavailable:
        return {'success': False, 'message': 'LLM service unavailable.'}, 503
    except Exception:
        return error_response('Unable to process the chat request.', 500)


@chatbot_bp.route('/chat/new', methods=['POST'])
def create_chat_conversation():
    """Create a persistent chat conversation."""
    try:
        payload = request.get_json(silent=True) or {}
        title = payload.get('title')
        user_id = payload.get('user_id')
        conversation = supabase_service.create_conversation(title, user_id)
        return success_response({'conversation': conversation}, 201)
    except SupabaseUnavailableError:
        return error_response('Conversation service unavailable.', 503)
    except SupabaseServiceError as exc:
        return error_response(str(exc), 400)


@chatbot_bp.route('/chat/conversations', methods=['GET'])
def list_chat_conversations():
    """Return the persistent conversation list, newest first."""
    try:
        return success_response({
            'conversations': supabase_service.list_conversations(request.args.get('user_id'))
        })
    except SupabaseUnavailableError:
        return error_response('Conversation service unavailable.', 503)


@chatbot_bp.route('/chat/conversation/<conversation_id>', methods=['GET'])
def get_chat_conversation(conversation_id: str):
    """Return one conversation and its complete chronological message history."""
    if not _valid_conversation_id(conversation_id):
        return error_response('Invalid conversation ID.', 400)
    try:
        conversation = supabase_service.get_conversation(conversation_id)
        if conversation is None:
            return error_response('Conversation not found.', 404)
        messages = supabase_service.load_messages(conversation_id)
        return success_response({'conversation': conversation, 'messages': messages})
    except SupabaseUnavailableError:
        return error_response('Conversation service unavailable.', 503)


@chatbot_bp.route('/chat/message', methods=['POST'])
def send_chat_message():
    """Persist a user message, generate a reply, and persist the reply."""
    payload = request.get_json(silent=True) or {}
    conversation_id = str(payload.get('conversation_id') or '')
    message = str(payload.get('message') or payload.get('question') or '').strip()
    if not _valid_conversation_id(conversation_id):
        return error_response('Invalid conversation ID.', 400)
    if not message:
        return error_response('A message or question is required.', 400)

    try:
        if supabase_service.get_conversation(conversation_id) is None:
            return error_response('Conversation not found.', 404)
        # Hydrate before saving the new message: the RAG service receives the
        # previous 10 turns and adds this turn exactly once itself.
        _load_rag_history(conversation_id)
        supabase_service.save_message(conversation_id, 'user', message)
        answer = rag_service.answer(message, conversation_id)
        supabase_service.save_message(
            conversation_id,
            'assistant',
            str(answer['reply']),
            {'sources': answer.get('sources', [])},
        )
        return success_response({'conversation_id': conversation_id, **answer})
    except LLMServiceUnavailable:
        return error_response('LLM service unavailable.', 503)
    except SupabaseUnavailableError:
        return error_response('Conversation service unavailable.', 503)
    except SupabaseServiceError as exc:
        return error_response(str(exc), 400)
    except Exception:
        return error_response('Unable to process the chat request.', 500)


@chatbot_bp.route('/chat/conversation/<conversation_id>', methods=['DELETE'])
def delete_chat_conversation(conversation_id: str):
    """Delete a conversation and all its messages through the DB cascade."""
    if not _valid_conversation_id(conversation_id):
        return error_response('Invalid conversation ID.', 400)
    try:
        if not supabase_service.delete_conversation(conversation_id):
            return error_response('Conversation not found.', 404)
        return success_response({'conversation_id': conversation_id, 'deleted': True})
    except SupabaseUnavailableError:
        return error_response('Conversation service unavailable.', 503)


@chatbot_bp.route('/chat/conversation/<conversation_id>', methods=['PUT'])
def rename_chat_conversation(conversation_id: str):
    """Rename one persistent conversation."""
    if not _valid_conversation_id(conversation_id):
        return error_response('Invalid conversation ID.', 400)
    payload = request.get_json(silent=True) or {}
    title = str(payload.get('title') or '')
    try:
        conversation = supabase_service.rename_conversation(conversation_id, title)
        if conversation is None:
            return error_response('Conversation not found.', 404)
        return success_response({'conversation': conversation})
    except SupabaseUnavailableError:
        return error_response('Conversation service unavailable.', 503)
    except SupabaseServiceError as exc:
        return error_response(str(exc), 400)
