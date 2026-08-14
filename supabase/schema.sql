-- Planner sync schema. Run this once in the Supabase SQL editor
-- (Dashboard → SQL Editor → New query → paste → Run).

create table if not exists public.entries (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null,               -- e.g. daily-2026-08-14, weekly-2026-W33, quarterly-2026-Q3
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.entries enable row level security;

-- Each signed-in user can only touch their own rows.
create policy "own entries" on public.entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
