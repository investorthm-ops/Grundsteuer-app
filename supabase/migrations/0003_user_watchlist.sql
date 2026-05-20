-- 0003_user_watchlist.sql
-- Schema for PROJ-2: Watchlist und Aenderungsalerts

create table if not exists public.user_watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, municipality_id)
);

create index if not exists user_watchlist_user_id_idx
  on public.user_watchlist(user_id);

create index if not exists user_watchlist_municipality_id_idx
  on public.user_watchlist(municipality_id);

alter table public.user_watchlist enable row level security;

drop policy if exists "user_watchlist_select_own" on public.user_watchlist;
create policy "user_watchlist_select_own"
  on public.user_watchlist
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "user_watchlist_insert_own" on public.user_watchlist;
create policy "user_watchlist_insert_own"
  on public.user_watchlist
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "user_watchlist_delete_own" on public.user_watchlist;
create policy "user_watchlist_delete_own"
  on public.user_watchlist
  for delete
  to authenticated
  using (user_id = auth.uid());
