"""One-time, in-memory loader for the project's text knowledge base."""
from __future__ import annotations
import re
from dataclasses import dataclass
from pathlib import Path
from config import DOCS_DIR, KNOWLEDGE_DIR

@dataclass(frozen=True)
class KnowledgeChunk:
    source: str
    text: str
    terms: frozenset[str]
    category: str
    filename: str

    @property
    def metadata(self) -> dict[str, str]:
        """Portable provenance for callers, prompts, and returned sources."""
        return {
            'source': self.source,
            'category': self.category,
            'filename': self.filename,
        }

def _tokens(text: str) -> set[str]:
    stop_words = {
        'about', 'again', 'also', 'and', 'are', 'can', 'could', 'does', 'explain',
        'for', 'from', 'give', 'how', 'in', 'is', 'it', 'me', 'more', 'of', 'please',
        'the', 'this', 'to', 'what', 'with', 'work', 'works', 'would', 'you', 'your',
    }
    return {
        token for token in re.findall(r"[a-z0-9]{2,}", text.lower())
        if token not in stop_words
    }

class KnowledgeBase:
    """Startup-cached recursive loader for project knowledge and supplemental docs."""

    _supported_extensions = {'.txt', '.md'}

    def __init__(
        self,
        directory: Path = KNOWLEDGE_DIR,
        docs_directory: Path | None = DOCS_DIR,
    ) -> None:
        self.directory = directory
        self.docs_directory = docs_directory
        self.chunks = self._load()

    def _load(self) -> list[KnowledgeChunk]:
        chunks: list[KnowledgeChunk] = []
        roots = ((self.directory, 'Knowledge'),)
        if self.docs_directory is not None:
            roots += ((self.docs_directory, 'docs'),)

        for root, category in roots:
            if not root.exists():
                continue
            for path in sorted(root.rglob('*')):
                if not path.is_file() or path.suffix.lower() not in self._supported_extensions:
                    continue
                chunks.extend(self._load_document(path, root, category))
        return chunks

    def _load_document(self, path: Path, root: Path, category: str) -> list[KnowledgeChunk]:
        try:
            text = path.read_text(encoding='utf-8', errors='replace').strip()
        except OSError:
            return []
        if not text:
            return []

        source = f'{category}/{path.relative_to(root).as_posix()}'
        paragraphs = [p.strip() for p in re.split(r'\n\s*\n', text) if p.strip()]
        document_chunks: list[KnowledgeChunk] = []
        buffer = ''
        for paragraph in paragraphs:
            if buffer and len(buffer) + len(paragraph) > 1400:
                document_chunks.append(self._make_chunk(source, category, path.name, buffer))
                buffer = ''
            buffer = f'{buffer}\n\n{paragraph}'.strip()
        if buffer:
            document_chunks.append(self._make_chunk(source, category, path.name, buffer))
        return document_chunks

    @staticmethod
    def _make_chunk(source: str, category: str, filename: str, text: str) -> KnowledgeChunk:
        return KnowledgeChunk(source, text, frozenset(_tokens(text)), category, filename)

    def search(self, query: str, limit: int = 5) -> list[KnowledgeChunk]:
        terms = _tokens(query)
        if not terms:
            return []

        candidates = [
            chunk for chunk in self.chunks
            if terms.intersection(chunk.terms)
        ]
        def relevance(chunk: KnowledgeChunk) -> int:
            # Filename matches identify a document's primary subject; weight them
            # above incidental mentions inside another document.
            return (
                len(terms.intersection(chunk.terms))
                + 3 * len(terms.intersection(_tokens(chunk.filename)))
            )

        ranked = sorted(candidates, key=lambda chunk: (relevance(chunk), chunk.source), reverse=True)

        # Select the strongest chunk from each root first. This prevents a long
        # Knowledge document from crowding out an equally relevant docs document.
        merged: list[KnowledgeChunk] = []
        used_categories: set[str] = set()
        strongest_score = relevance(ranked[0])
        for chunk in ranked:
            # Only diversify with comparably relevant sources. For example, a
            # Classification document that merely mentions SHAP should not crowd
            # out the dedicated SHAP knowledge document.
            if relevance(chunk) * 2 < strongest_score:
                continue
            if chunk.category not in used_categories:
                merged.append(chunk)
                used_categories.add(chunk.category)
                if len(merged) == limit:
                    return merged
        for chunk in ranked:
            if chunk not in merged:
                merged.append(chunk)
                if len(merged) == limit:
                    break
        return merged

    @staticmethod
    def sources(chunks: list[KnowledgeChunk]) -> list[str]:
        return list(dict.fromkeys(chunk.source for chunk in chunks))
