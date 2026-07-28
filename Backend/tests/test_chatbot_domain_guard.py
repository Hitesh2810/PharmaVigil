import sys
import unittest
from pathlib import Path
from unittest.mock import patch
from uuid import uuid4

sys.path.append(str(Path(__file__).resolve().parents[1]))

from chatbot.domain_guard import DOMAIN, FOLLOW_UP, OUT_OF_SCOPE, domain_guard
from chatbot.intent_detector import intent_detector
from chatbot.knowledge_loader import KnowledgeBase
from chatbot.rag_service import RAGService


class IntentDetectorTests(unittest.TestCase):
    def test_domain_questions_are_allowed(self):
        for message in (
            'Explain SHAP', 'Explain regression', 'Explain classification',
            'Explain the dataset', 'How does the API work?',
        ):
            self.assertEqual(domain_guard.classify(message), DOMAIN)

    def test_follow_up_phrases_are_detected(self):
        # Follow-ups must be detected via is_follow_up with context, not via classify
        for message in (
            'Make it shorter', 'Explain more', 'Continue', 'Give examples',
            'Summarize', 'Make concise', 'What about this',
        ):
            # When there's prior context, these should be detected as follow-ups
            self.assertTrue(intent_detector.is_follow_up(message, has_prior_context=True))
        # Without context, they should not be detected as follow-ups
        for message in (
            'Make it shorter', 'Explain more', 'Continue',
        ):
            self.assertFalse(intent_detector.is_follow_up(message, has_prior_context=False))

    def test_unrelated_and_coding_requests_are_refused(self):
        for message in (
            'Write factorial', 'Write a Python program', 'Who is Virat Kohli?',
            'Tell a joke', 'Operating system', 'Compiler', 'Java', 'Cricket', 'Movies',
        ):
            self.assertEqual(domain_guard.classify(message), OUT_OF_SCOPE)


class RAGDomainBoundaryTests(unittest.TestCase):
    def setUp(self):
        self.service = RAGService()
        self.calls = []
        self.service.openrouter.generate_response = self._fake_generate

    def _fake_generate(self, prompt):
        self.calls.append(prompt)
        return 'Grounded response.'

    def test_out_of_scope_does_not_retrieve_or_call_llm(self):
        self.service.knowledge.search = lambda _question: self.fail('retrieval must not run')
        result = self.service.answer('Write a factorial program', 'guard-test')
        self.assertIn('I only answer questions related to', result['reply'])
        self.assertEqual(result['sources'], [])
        self.assertEqual(self.calls, [])

    def test_follow_up_reuses_prior_topic_and_documents(self):
        first = self.service.answer('Explain SHAP', 'memory-test')
        self.assertEqual(first['reply'], 'Grounded response.')
        self.assertEqual(self.service.conversations.context('memory-test')['current_topic'], 'SHAP')
        self.service.knowledge.search = lambda _question: self.fail('follow-up must use saved documents')
        second = self.service.answer('Make it shorter', 'memory-test')
        self.assertEqual(second['reply'], 'Grounded response.')
        self.assertEqual(len(self.calls), 2)
        self.assertIn('CURRENT TOPIC:\nSHAP', self.calls[-1])

    def test_follow_up_for_conversation_id_loads_history_before_classify(self):
        conversation_id = str(uuid4())
        history = [
            {'role': 'user', 'content': 'Explain SHAP in 3 points'},
            {'role': 'assistant', 'content': 'SHAP explains how each feature affects a prediction.'},
        ]
        with patch('chatbot.rag_service.supabase_service.load_messages', return_value=history):
            result = self.service.answer('make it shorter', conversation_id)

        self.assertEqual(result['reply'], 'Grounded response.')
        history = self.service.conversations.context(conversation_id)['history']
        self.assertTrue(any(item['role'] == 'assistant' and item['content'] == 'SHAP explains how each feature affects a prediction.' for item in history))
        self.assertEqual(self.service.conversations.context(conversation_id)['current_topic'], 'SHAP')
        self.assertEqual(len(self.calls), 1)

    def test_domain_question_without_knowledge_does_not_call_llm(self):
        self.service.knowledge.search = lambda _question: []
        result = self.service.answer('Explain SHAP', 'empty-knowledge-test')
        self.assertEqual(result['reply'], "I couldn't find relevant information in the PharmaVigil AI knowledge base.")
        self.assertEqual(self.calls, [])


class KnowledgeLoaderTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.knowledge = KnowledgeBase()

    def test_classification_merges_docs_and_knowledge_sources(self):
        chunks = self.knowledge.search('Explain Classification in detail')
        sources = {chunk.source for chunk in chunks}
        self.assertIn('docs/Classification.txt', sources)
        self.assertIn('Knowledge/05_Classification_Model.txt', sources)
        document = next(chunk for chunk in chunks if chunk.source == 'docs/Classification.txt')
        self.assertEqual(document.metadata, {
            'source': 'docs/Classification.txt',
            'category': 'docs',
            'filename': 'Classification.txt',
        })

    def test_shap_retrieves_the_dedicated_knowledge_document(self):
        sources = {chunk.source for chunk in self.knowledge.search('Explain SHAP')}
        self.assertIn('Knowledge/08_SHAP_Explainability.txt', sources)

if __name__ == '__main__':
    unittest.main()
