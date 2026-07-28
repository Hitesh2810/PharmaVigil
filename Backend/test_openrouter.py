"""Manual OpenRouter smoke test. Credentials are read only from Backend/.env."""
from chatbot.openrouter_service import LLMServiceUnavailable, OpenRouterService


if __name__ == '__main__':
    try:
        print(OpenRouterService().generate_response('Reply with: OpenRouter connection verified.', max_tokens=30))
    except LLMServiceUnavailable as exc:
        print(f'OpenRouter test failed: {exc}')
