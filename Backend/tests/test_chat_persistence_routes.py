import sys
import unittest
from pathlib import Path
from uuid import uuid4

from flask import Flask

sys.path.append(str(Path(__file__).resolve().parents[1]))

import routes.chatbot as chat_routes


class FakeSupabaseService:
    """In-memory contract double for chat endpoint persistence tests."""

    def __init__(self):
        self.conversations = {}
        self.messages = {}

    def create_conversation(self, title=None, user_id=None):
        conversation_id = str(uuid4())
        conversation = {
            'id': conversation_id, 'title': title, 'user_id': user_id,
            'message_count': 0, 'last_message': None,
        }
        self.conversations[conversation_id] = conversation
        self.messages[conversation_id] = []
        return conversation

    def get_conversation(self, conversation_id):
        return self.conversations.get(conversation_id)

    def list_conversations(self, user_id=None):
        return list(self.conversations.values())

    def save_message(self, conversation_id, role, content, metadata=None):
        conversation = self.conversations[conversation_id]
        message = {'id': str(uuid4()), 'role': role, 'content': content, 'metadata': metadata or {}}
        self.messages[conversation_id].append(message)
        conversation['message_count'] += 1
        conversation['last_message'] = content
        if role == 'user' and not conversation['title']:
            conversation['title'] = content[:50]
        return message

    def load_messages(self, conversation_id, limit=None):
        messages = self.messages[conversation_id]
        return messages[-limit:] if limit else messages

    def delete_conversation(self, conversation_id):
        if conversation_id not in self.conversations:
            return False
        del self.conversations[conversation_id]
        del self.messages[conversation_id]
        return True

    def rename_conversation(self, conversation_id, title):
        conversation = self.get_conversation(conversation_id)
        if conversation:
            conversation['title'] = title
        return conversation


class FakeRagService:
    class Knowledge:
        @staticmethod
        def search(_question):
            return []

    class Conversations:
        @staticmethod
        def hydrate(*_args):
            return None

    knowledge = Knowledge()
    conversations = Conversations()

    @staticmethod
    def answer(message, conversation_id):
        return {'reply': f'Reply to: {message}', 'sources': ['Knowledge/test.txt']}


class ChatPersistenceRouteTests(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(chat_routes.chatbot_bp, url_prefix='/api')
        self.client = self.app.test_client()
        self.original_service = chat_routes.supabase_service
        self.original_rag = chat_routes.rag_service
        chat_routes.supabase_service = FakeSupabaseService()
        chat_routes.rag_service = FakeRagService()

    def tearDown(self):
        chat_routes.supabase_service = self.original_service
        chat_routes.rag_service = self.original_rag

    def test_persists_loads_and_deletes_a_conversation(self):
        created = self.client.post('/api/chat/new', json={})
        self.assertEqual(created.status_code, 201)
        conversation_id = created.get_json()['conversation']['id']

        sent = self.client.post('/api/chat/message', json={
            'conversation_id': conversation_id, 'message': 'Explain SHAP',
        })
        self.assertEqual(sent.status_code, 200)
        self.assertEqual(sent.get_json()['sources'], ['Knowledge/test.txt'])

        loaded = self.client.get(f'/api/chat/conversation/{conversation_id}')
        payload = loaded.get_json()
        self.assertEqual([message['role'] for message in payload['messages']], ['user', 'assistant'])
        self.assertEqual(payload['conversation']['title'], 'Explain SHAP')

        deleted = self.client.delete(f'/api/chat/conversation/{conversation_id}')
        self.assertEqual(deleted.status_code, 200)
        self.assertEqual(self.client.get(f'/api/chat/conversation/{conversation_id}').status_code, 404)


if __name__ == '__main__':
    unittest.main()
