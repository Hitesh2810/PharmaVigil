"""Deterministic intent classification for the PharmaVigil chat boundary."""
from __future__ import annotations

import re

FOLLOW_UP = "FOLLOW_UP"
NEW_QUERY = "NEW_QUERY"
DOMAIN = "DOMAIN"
OUT_OF_SCOPE = "OUT_OF_SCOPE"


class IntentDetector:
    """Classify without an LLM so out-of-scope requests never reach OpenRouter."""

    _follow_up_patterns = (
        r"^(make( (it|this))? )?(shorter|longer|concise|simple|simpler|small|easier|brief)$",
        r"^(please )?(summari[sz]e|continue|rewrite|simplify|elaborate|clarify)$",
        r"^(explain( (it|this))? (again|better|more|further))$",
        r"^(give|show) (an? |more )?(example|examples|details|information)$",
        r"^(tell|give) (me )?(more|more details|more information)$",
        r"^(why|how|what about|and then|next)(\s|$)",
        r"^(expand|tell me more|make it easier|in one line|bullet points|in simple words)$",
        r"^(example|examples)$",
    )

    _domain_terms = (
        "pharmavigil", "pharmacovigilance", "drug safety", "adverse drug",
        "adverse event", "adverse reaction", "side effect", "dataset", "data set",
        "classification", "classifier", "regression", "causality", "causal",
        "shap", "feature importance", "confusion matrix", "machine learning",
        "model", "dashboard", "visualization", "visualisation", "api", "endpoint",
        "documentation", "knowledge base", "precision", "recall", "f1", "accuracy",
        "roc", "auc", "rmse", "mae", "mse", "r2", "prediction",
    )

    _out_of_scope_terms = (
        "python", "java", "c++", "c programming", "program", "code", "coding",
        "factorial", "bubble sort", "binary search", "leetcode", "algorithm", "dsa",
        "operating system", "compiler", "cricket", "virat kohli", "weather", "movie",
        "movies", "music", "politics", "joke", "story", "math", "mathematics",
    )

    def is_follow_up(self, message: str, has_prior_context: bool = False) -> bool:
        """Check if message is a follow-up. Can only be a follow-up if has_prior_context."""
        if not has_prior_context:
            return False
        normalized = re.sub(r"\s+", " ", message.strip().lower()).strip(" .!?")
        # Match against follow-up patterns
        if any(re.fullmatch(pattern, normalized) for pattern in self._follow_up_patterns):
            return True
        # Additional heuristic: short messages (< 4 words) with common follow-up starters
        words = normalized.split()
        if len(words) <= 3:
            follow_up_starters = ("make", "shorter", "longer", "simplify", "summarize", "example", "more", "explain", "why", "how")
            if any(word in follow_up_starters for word in words):
                return True
        return False

    def classify(self, message: str) -> str:
        """Classify message as NEW_QUERY, OUT_OF_SCOPE, or DOMAIN (for compatibility).
        Note: FOLLOW_UP detection requires context and is handled separately.
        """
        normalized = re.sub(r"\s+", " ", message.strip().lower()).strip(" .!?")
        # A coding/general topic must never be allowed through because it also happens
        # to include a word such as "model" or "API".
        if any(term in normalized for term in self._out_of_scope_terms):
            return OUT_OF_SCOPE
        if any(term in normalized for term in self._domain_terms):
            return NEW_QUERY
        return OUT_OF_SCOPE


intent_detector = IntentDetector()
