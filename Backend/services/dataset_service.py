import pandas as pd

from models_loader.loader import registry


class DatasetService:
    def __init__(self) -> None:
        self.registry = registry

    def summary(self) -> dict:
        df = self.registry.get_dataset()
        return {
            'rows': int(df.shape[0]),
            'columns': int(df.shape[1]),
            'column_names': df.columns.tolist(),
        }

    def features(self) -> list[str]:
        return self.registry.get_dataset().columns.tolist()

    def statistics(self) -> dict:
        df = self.registry.get_dataset()
        return df.describe(include='all').to_dict()

    def search(self, query: str) -> list[dict]:
        df = self.registry.get_dataset()
        if not query:
            return []
        mask = df.astype(str).apply(lambda col: col.str.contains(query, case=False, na=False)).any(axis=1)
        return df.loc[mask].head(20).to_dict(orient='records')


dataset_service = DatasetService()
