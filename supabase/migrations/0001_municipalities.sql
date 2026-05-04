-- 0001_municipalities.sql
-- Schema for PROJ-1: Bundesweite Hebesatz-Datenbank

create extension if not exists "pgcrypto";

-- =========================================================
-- user_roles
-- =========================================================
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index if not exists user_roles_user_id_idx on public.user_roles(user_id);

alter table public.user_roles enable row level security;

-- Users can read their own role rows. Writes are not exposed via the API
-- (admin records are inserted manually via SQL by the project owner).
drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own"
  on public.user_roles
  for select
  to authenticated
  using (user_id = auth.uid());

-- =========================================================
-- municipalities
-- =========================================================
create table if not exists public.municipalities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bundesland text not null,
  kreis text,
  hebesatz_a int check (hebesatz_a is null or (hebesatz_a between 0 and 2000)),
  hebesatz_b int not null check (hebesatz_b between 0 and 2000),
  hebesatz_gewerbe int check (hebesatz_gewerbe is null or (hebesatz_gewerbe between 0 and 2000)),
  vorjahr_b int check (vorjahr_b is null or (vorjahr_b between 0 and 2000)),
  datenstand date,
  quellenstatus text not null default 'offen' check (quellenstatus in ('bestaetigt','offen')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create index if not exists municipalities_bundesland_idx on public.municipalities(bundesland);
create index if not exists municipalities_name_idx on public.municipalities(name);
create index if not exists municipalities_bundesland_name_idx on public.municipalities(bundesland, name);

alter table public.municipalities enable row level security;

-- Any authenticated user can read.
drop policy if exists "municipalities_select_authenticated" on public.municipalities;
create policy "municipalities_select_authenticated"
  on public.municipalities
  for select
  to authenticated
  using (true);

-- Admin-only writes, gated by user_roles.
drop policy if exists "municipalities_insert_admin" on public.municipalities;
create policy "municipalities_insert_admin"
  on public.municipalities
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

drop policy if exists "municipalities_update_admin" on public.municipalities;
create policy "municipalities_update_admin"
  on public.municipalities
  for update
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

drop policy if exists "municipalities_delete_admin" on public.municipalities;
create policy "municipalities_delete_admin"
  on public.municipalities
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

-- =========================================================
-- updated_at trigger
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists municipalities_set_updated_at on public.municipalities;
create trigger municipalities_set_updated_at
  before update on public.municipalities
  for each row execute function public.set_updated_at();
