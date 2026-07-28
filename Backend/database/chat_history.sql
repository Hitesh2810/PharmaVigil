-- PharmaVigil AI persistent chatbot history for Supabase PostgreSQL.
create extension if not exists pgcrypto;

create table if not exists public.conversations (
    id uuid primary key default gen_random_uuid(),
    title text not null default '',
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    last_message text,
    message_count integer not null default 0 check (message_count >= 0)
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
create index if not exists messages_conversation_created_at_idx
    on public.messages (conversation_id, created_at asc);
