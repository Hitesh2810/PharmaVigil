# PharmaVigil AI: Supabase chat history

## 1. Project overview

Supabase PostgreSQL stores persistent chat conversations and messages. The React chat sidebar calls Flask APIs; Flask alone connects to Supabase and then invokes the unchanged chatbot. This preserves history across refreshes and lets a user reopen and continue a conversation.

## 2–4. Create a project and obtain credentials

Create a project at [Supabase](https://supabase.com/dashboard). In **Project Settings → API**, copy the Project URL and the **anon public** key. Add them to `Backend/.env`; never put them in React source code or commit the file.

## 5. Environment variables

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
OPENROUTER_API_KEY=your-existing-key
OPENROUTER_MODEL=openrouter/auto
```

## 6. SQL setup

Run [database/chat_history.sql](database/chat_history.sql) in the Supabase SQL Editor. It creates `conversations`, `messages`, indexes, UUID defaults, role validation, and the cascading foreign key.

## 7. Tables

`conversations` stores the UUID, title, timestamps, last-message preview, and message count. `messages` stores every turn in chronological order; its `metadata` JSON can retain RAG sources. Deleting a parent conversation automatically deletes its messages.

## 8. API documentation

| Method and path | Body | Result |
| --- | --- | --- |
| `POST /api/chat/new` | Optional `{ "title": "..." }` | Creates and returns `conversation` with a UUID. |
| `GET /api/chat/conversations` | None | Lists newest conversations. |
| `GET /api/chat/conversation/<id>` | None | Returns a conversation and all messages. |
| `POST /api/chat/message` | `{ "conversation_id": "UUID", "message": "..." }` | Persists both turns and returns `reply`/`sources`. |
| `PUT /api/chat/conversation/<id>` | `{ "title": "..." }` | Renames the conversation. |
| `DELETE /api/chat/conversation/<id>` | None | Deletes the conversation and cascaded messages. |

Invalid IDs/messages return `400`, absent conversations return `404`, and unavailable database/LLM services return `503`.

## 9–10. Backend architecture and flow

`services/supabase_service.py` creates one lazy reusable client from environment variables. `routes/chatbot.py` loads the last 10 messages before each persistent request, restores the existing chatbot context, saves the user message, obtains the existing RAG/OpenRouter reply, and saves that reply. This keeps old conversations stored while limiting prompt history.

## 11. CRUD operations

The service provides `create_conversation`, `get_conversation`, `list_conversations`, `save_message`, `load_messages`, `rename_conversation`, `delete_conversation`, `update_last_message`, and `update_message_count`. The first user message becomes the automatic title, truncated to 50 characters.

## 12. Testing

1. Install backend dependencies: `pip install -r requirements.txt`.
2. Apply the SQL and start Flask.
3. Create a conversation, send a domain question, refresh the chat page, then reopen it.
4. Send “make it shorter” to verify stored recent history is restored.
5. Rename and delete the conversation; verify the list and database rows update.

The backend test suite includes a mocked persistence-route test for creation, title generation, message save/load, and deletion. Existing RAG, domain-guard, and document-loader tests remain separate.

## 13. Troubleshooting

- **Not configured/503:** verify both `.env` values and restart Flask.
- **Permission denied:** run the SQL and review Supabase RLS policies; restrictive policies block the anon key.
- **Timeout:** check project status, network connectivity, and URL spelling.
- **404:** ensure the sidebar is using a returned UUID rather than a local temporary conversation ID.

## 14. Future improvements

Add authenticated users with RLS, conversation search/export/pinning, pagination, retry queues, and database-side atomic counters for high-concurrency deployments.
