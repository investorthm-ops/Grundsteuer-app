-- 0006_organizations_access.sql
-- Schema for PROJ-8: Mandantenfaehige Nutzerverwaltung

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'trial' check (status in ('trial', 'active', 'expired', 'blocked')),
  access_until date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists organizations_status_idx
  on public.organizations(status);

create index if not exists organization_memberships_user_id_idx
  on public.organization_memberships(user_id);

create index if not exists organization_memberships_organization_id_idx
  on public.organization_memberships(organization_id);

alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;

create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  );
$$;

create or replace function public.current_user_has_active_organization()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships om
    join public.organizations o on o.id = om.organization_id
    where om.user_id = auth.uid()
      and o.status in ('trial', 'active')
      and (o.access_until is null or o.access_until >= current_date)
  );
$$;

drop policy if exists "organizations_select_admin" on public.organizations;
create policy "organizations_select_admin"
  on public.organizations
  for select
  to authenticated
  using (public.is_current_user_admin());

drop policy if exists "organizations_write_admin" on public.organizations;
create policy "organizations_write_admin"
  on public.organizations
  for all
  to authenticated
  using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

drop policy if exists "memberships_select_admin_or_own" on public.organization_memberships;
create policy "memberships_select_admin_or_own"
  on public.organization_memberships
  for select
  to authenticated
  using (public.is_current_user_admin() or user_id = auth.uid());

drop policy if exists "memberships_write_admin" on public.organization_memberships;
create policy "memberships_write_admin"
  on public.organization_memberships
  for all
  to authenticated
  using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

drop trigger if exists organization_memberships_set_updated_at on public.organization_memberships;
create trigger organization_memberships_set_updated_at
  before update on public.organization_memberships
  for each row execute function public.set_updated_at();
