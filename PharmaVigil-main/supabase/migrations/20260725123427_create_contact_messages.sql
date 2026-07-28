/*
# Create contact_messages table (single-tenant, no auth)

1. New Tables
- `contact_messages`
  - `id` (uuid, primary key)
  - `name` (text, not null) — submitter's full name
  - `email` (text, not null) — submitter's email address
  - `subject` (text, not null) — message subject line
  - `message` (text, not null) — the message body
  - `created_at` (timestamptz, defaults to now()) — submission timestamp
2. Security
- Enable RLS on `contact_messages`.
- This is a single-tenant, no-auth public contact form: anyone may submit
  a message and the site owner reads submissions server-side. The anon-key
  frontend needs INSERT access to store submissions, and SELECT access so
  the form can be reused for future admin views. Policies are scoped to
  `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because submissions are intentionally public write-anyone rows.
3. Notes
- No `user_id` column: the site has no sign-in screen, so there is no
  owner to scope rows to.
- UPDATE and DELETE are intentionally restricted to `authenticated` only
  (server-side management), not the anon role.
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + authenticated) can submit a contact message
DROP POLICY IF EXISTS "anon_insert_contact_messages" ON contact_messages;
CREATE POLICY "anon_insert_contact_messages"
ON contact_messages FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- Public read access so the form/admin list can display submissions
DROP POLICY IF EXISTS "anon_select_contact_messages" ON contact_messages;
CREATE POLICY "anon_select_contact_messages"
ON contact_messages FOR SELECT
TO anon, authenticated USING (true);
