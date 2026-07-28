from collections import defaultdict, deque

class ChatMemory:
    def __init__(self, max_messages: int = 8) -> None:
        self._sessions = defaultdict(lambda: deque(maxlen=max_messages))
    def history(self, session_id: str) -> list[dict[str, str]]:
        return list(self._sessions[session_id])
    def add(self, session_id: str, role: str, content: str) -> None:
        self._sessions[session_id].append({'role': role, 'content': content})
