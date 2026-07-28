"""Reusable OpenRouter generation client for the PharmaVigil RAG service."""
from __future__ import annotations

import logging
import time

from openai import APIConnectionError, APIError, APITimeoutError, OpenAI, OpenAIError, RateLimitError

from config import OPENROUTER_API_KEY, OPENROUTER_MODEL
from .response_builder import SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class LLMServiceUnavailable(Exception):
    """Raised when OpenRouter cannot safely complete a generation request."""


class OpenRouterService:
    """Creates one OpenAI-compatible client and reuses it for all requests."""

    def __init__(self) -> None:
        self.model = OPENROUTER_MODEL
        self.client = OpenAI(
            api_key=OPENROUTER_API_KEY,
            base_url='https://openrouter.ai/api/v1',
            timeout=30.0,
        ) if OPENROUTER_API_KEY else None

    def generate_response(self, prompt: str, temperature: float = 0.2, max_tokens: int = 1000) -> str:
        """Return generated text or raise a provider-agnostic availability error."""
        if not self.client:
            raise LLMServiceUnavailable('OpenRouter is not configured.')
        started_at = time.monotonic()
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': prompt},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
            )
            text = (completion.choices[0].message.content or '').strip()
            if not text:
                raise LLMServiceUnavailable('OpenRouter returned an empty response.')
            logger.info('OpenRouter response model=%s elapsed_ms=%d chars=%d', self.model, (time.monotonic() - started_at) * 1000, len(text))
            return text
        except (APITimeoutError, APIConnectionError, RateLimitError, APIError, OpenAIError) as exc:
            logger.warning('OpenRouter generation failed model=%s error=%s elapsed_ms=%d', self.model, type(exc).__name__, (time.monotonic() - started_at) * 1000)
            raise LLMServiceUnavailable('LLM service unavailable.') from exc
