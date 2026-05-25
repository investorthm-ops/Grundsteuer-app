-- 0009_admin_audit_log.sql
-- Schema for PROJ-12: Admin Audit Log
-- Tracks who did what to organizations, memberships and invitations.
-- Writes happen exclusively via the service-role client from server-side
-- API routes, so we do not grant INSERT/UPDATE/DELETE policies to
-- authenticated users. SELECT is admin-only.

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,
  entity_type text not null check (entity_type in ('organization', 'membership', 'invitation')),
  entity_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

create index if not exists admin_audit_log_entity_idx
  on public.admin_audit_log (entity_type, entity_id);

create index if not exists admin_audit_log_action_idx
  on public.admin_audit_log (action);

alter table public.admin_audit_log enable row level security;

drop policy if exists "audit_log_select_admin" on public.admin_audit_log;
create policy "audit_log_select_admin"
  on public.admin_audit_log
  for select
  to authenticated
  using (public.is_current_user_admin());

-- No insert/update/delete policies: service-role bypasses RLS,
-- regular users (including admins) cannot tamper with the log.
