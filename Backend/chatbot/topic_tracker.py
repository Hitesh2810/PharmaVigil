"""Small, explainable topic tracker for domain conversations."""
from __future__ import annotations


class TopicTracker:
    _topics = (
        ("SHAP", ("shap", "feature importance", "explainability")),
        ("Classification", ("classification", "classifier", "confusion matrix", "precision", "recall", "f1", "roc", "auc")),
        ("Regression", ("regression", "rmse", "mae", "mse", "r2")),
        ("Causality", ("causality", "causal")),
        ("Dataset", ("dataset", "data set", "rows", "columns", "preprocessing")),
        ("Dashboard", ("dashboard",)),
        ("Visualizations", ("visualization", "visualisation", "chart", "plot", "graph")),
        ("APIs", ("api", "endpoint")),
        ("Pharmacovigilance", ("pharmacovigilance", "drug safety", "adverse drug", "adverse event", "adverse reaction", "side effect")),
        ("PharmaVigil AI Project", ("pharmavigil", "project", "documentation", "knowledge base")),
    )

    def identify(self, message: str, current_topic: str | None = None) -> str | None:
        lowered = message.lower()
        for topic, terms in self._topics:
            if any(term in lowered for term in terms):
                return topic
        return current_topic


topic_tracker = TopicTracker()
