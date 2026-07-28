"""Backward-compatible imports for prompt construction."""
from .response_builder import SYSTEM_PROMPT, build_response_prompt


def build_prompt(question, chunks, artifacts, history):
    return build_response_prompt(question, chunks, artifacts, history)
