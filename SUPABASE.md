# Supabase conversation persistence

## 1. Overview

Supabase provides PostgreSQL-backed persistence for PharmaVigil AI chat conversations. The Flask chat API stores conversations and messages separately, so a refreshed client can list old chats, load every message in chronological order, and continue a selected conversation. The existing RAG, OpenRouter, model, and prediction flows are unchanged.

Architecture: React client → Flask `/api/chat/*` → Supabase PostgreSQL. On a message request, Flask loads the most recent 10 stored messages into the existing conversation context, saves the user message, calls the chatbot, and saves the assistant message.

## 2. Prerequisites

1. Create a project at [Supabase](https://supabase.com/dashboard).
2. Open **Project Settings → API**.
3. Copy the project URL and the **anon public** key.
4. Run the SQL below in **SQL Editor**.

## 3. Environment variables

Copy `Backend/.env.example` to `Backend/.env` if needed, then configure:

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=openrouter/auto
```

`SUPABASE_URL` identifies the database project. `SUPABASE_ANON_KEY` authenticates this backend connection. The OpenRouter variables keep their existing purpose. Never commit `Backend/.env` or expose either key in the frontend.

## 4. Installation

The backend requirements now include `supabase>=2.0.0`.

```bash
cd Backend
pip install -r requirements.txt
```

Restart Flask after adding the package or environment variables.

## 5. Database setup

Run this complete SQL in the Supabase SQL Editor:

```sql
create extension if not exists pgcrypto;

create table if not exists public.conversations (
    id uuid primary key default gen_random_uuid(),
    title text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    user_id text null,
    last_message text,
    message_count integer not null default 0
);

create table if not exists public.messages (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid not null references public.conversations(id)
        on delete cascade,
    role text not null check (role in ('user', 'assistant', 'system')),
    content text not null,
    created_at timestamp with time zone not null default now(),
    metadata jsonb not null default '{}'::jsonb
);

create index if not exists conversations_updated_at_idx
    on public.conversations (updated_at desc);
create index if not exists conversations_user_id_updated_at_idx
    on public.conversations (user_id, updated_at desc);
create index if not exists messages_conversation_created_at_idx
    on public.messages (conversation_id, created_at asc);
```

`conversations` holds one chat’s summary. `messages` holds individual turns and references its parent conversation. `on delete cascade` removes messages automatically when a conversation is deleted. `metadata` stores message-specific data such as RAG sources.

For the current unauthenticated application, do not enable restrictive RLS policies until an authentication design is added; otherwise the anon key will receive permission-denied errors. When authentication is introduced, enable RLS and scope both tables to the authenticated user.

## 6. Backend integration

`Backend/services/supabase_service.py` initializes the client lazily from `.env`, logs recoverable failures, and exposes reusable typed CRUD methods. Missing configuration, package errors, and network failures produce controlled API errors instead of crashing Flask.

To test connectivity after SQL and environment setup, start Flask and call `POST /api/chat/new`. A `201` response with a UUID confirms inserts work.

## 7. CRUD operations

- `create_conversation(title, user_id)` creates a conversation with database-generated UUID/timestamps.
- `update_conversation(id, values)` updates summary fields and `updated_at`.
- `get_conversation(id)` and `list_conversations(user_id)` read chats.
- `save_message(id, role, content, metadata)` inserts a turn, updates `last_message`, increments `message_count`, and uses the first user message as a 50-character title when no title exists.
- `load_messages(id, limit)` returns chronological messages; the chat flow requests the last 10 for memory.
- `rename_conversation(id, title)` updates a validated title.
- `delete_conversation(id)` removes the conversation; PostgreSQL cascades message deletion.

## 8. API endpoints

All responses use the existing `{ "success": ... }` envelope.

| Endpoint | Request | Success response |
| --- | --- | --- |
| `POST /api/chat/new` | `{ "title": "Optional", "user_id": "optional" }` | `201`, `conversation` |
| `GET /api/chat/conversations` | Optional `?user_id=` | `conversations` newest first |
| `GET /api/chat/conversation/<id>` | None | `conversation`, all chronological `messages` |
| `POST /api/chat/message` | `{ "conversation_id": "UUID", "message": "..." }` | `conversation_id`, `reply`, `sources` |
| `PUT /api/chat/conversation/<id>` | `{ "title": "New title" }` | updated `conversation` |
| `DELETE /api/chat/conversation/<id>` | None | `deleted: true` |

Invalid UUIDs and empty messages return `400`; unknown conversations return `404`; unavailable or incorrectly configured Supabase returns `503`; an unavailable LLM returns `503` after the user message has been safely stored.

## 9. Testing

1. Call `POST /api/chat/new`; save the returned `conversation.id`.
2. Call `POST /api/chat/message` with that ID and a PharmaVigil question.
3. Verify `GET /api/chat/conversation/<id>` returns user and assistant messages in order.
4. Restart Flask, send a follow-up with the same ID, and verify context remains available.
5. Verify the chat appears in `GET /api/chat/conversations` and has an automatic title.
6. Call `DELETE /api/chat/conversation/<id>` and confirm the conversation and its `messages` rows are gone.

## 10. Troubleshooting

- **Missing URL/key:** set both variables in `Backend/.env`, then restart Flask.
- **Invalid key:** copy the anon public key from Project Settings → API and check it belongs to the configured URL.
- **Connection timeout:** verify network access, Supabase project status, and URL spelling.
- **Permission denied:** verify the SQL was run and inspect RLS policies. A policy that blocks the anon role prevents this unauthenticated backend design from reading/writing.

## 11. Security

Keep `.env` local and in `.gitignore`. Do not put Supabase or OpenRouter keys in React code, API responses, logs, screenshots, or commits. Use RLS plus authenticated user IDs when user accounts are implemented.

## 12. Future improvements

Add Supabase authentication and user-scoped RLS, full-text conversation search, exports, pinned chats, server-side pagination, and atomic message-count updates for high-concurrency usage.
