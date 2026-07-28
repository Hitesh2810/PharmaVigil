from __future__ import annotations

from models_loader.loader import registry


class DashboardService:
    def __init__(self) -> None:
        self.registry = registry

    def dashboard_payload(self) -> dict:
        df = self.registry.get_dataset()
        serious_count = int((df['event_seriousness'] == 'Serious').sum())
        non_serious_count = int((df['event_seriousness'] == 'Non-Serious').sum())
        return {
            'model_accuracy': {
                'classification': self.registry.classification_metrics.get('accuracy'),
                'causality': self.registry.causality_metrics.get('accuracy'),
                'regression': self.registry.regression_metrics.get('r2_score'),
            },
            'precision': {
                'classification': self.registry.classification_metrics.get('precision'),
                'causality': self.registry.causality_metrics.get('precision'),
            },
            'recall': {
                'classification': self.registry.classification_metrics.get('recall'),
                'causality': self.registry.causality_metrics.get('recall'),
            },
            'f1_score': {
                'classification': self.registry.classification_metrics.get('f1_score'),
                'causality': self.registry.causality_metrics.get('f1_score'),
            },
            'roc': {
                'classification': self.registry.classification_metrics.get('roc_auc'),
            },
            'dataset_statistics': {
                'rows': int(df.shape[0]),
                'columns': int(df.shape[1]),
                'serious_count': serious_count,
                'non_serious_count': non_serious_count,
            },
            'prediction_counts': {
                'serious': serious_count,
                'non_serious': non_serious_count,
            },
            'model_summaries': {
                'classification': self.registry.classification_report[:400],
                'causality': self.registry.causality_report[:400],
                'regression': self.registry.regression_report[:400],
            },
        }


dashboard_service = DashboardService()
