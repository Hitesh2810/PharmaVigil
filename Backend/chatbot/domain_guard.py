"""Responses used by the deterministic domain boundary."""
from .intent_detector import DOMAIN, FOLLOW_UP, NEW_QUERY, OUT_OF_SCOPE, IntentDetector, intent_detector

OUT_OF_SCOPE_RESPONSE = """Sorry, I am PharmaVigil AI.

I only answer questions related to

• Pharmacovigilance
• Drug Safety
• the PharmaVigil AI Project
• Machine Learning models
• Dataset
• Classification
• Causality
• Regression
• SHAP
• Dashboard
• Visualizations
• APIs
• Project Documentation

Please ask a question related to PharmaVigil AI."""


class DomainGuard:
    def __init__(self, detector: IntentDetector = intent_detector) -> None:
        self.detector = detector

    def classify(self, message: str) -> str:
        intent = self.detector.classify(message)
        if intent == NEW_QUERY:
            return DOMAIN
        # Note: FOLLOW_UP is never returned by domain_guard.classify()
        # It's handled context-aware in RAGService.answer() with has_prior_context check
        return intent

    @staticmethod
    def refusal() -> str:
        return OUT_OF_SCOPE_RESPONSE


domain_guard = DomainGuard()

__all__ = ["DOMAIN", "NEW_QUERY", "FOLLOW_UP", "OUT_OF_SCOPE", "DomainGuard", "domain_guard"]
