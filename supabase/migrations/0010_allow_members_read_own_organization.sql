-- 0010_allow_members_read_own_organization.sql
-- Bugfix: Member-User konnten ihre eigene Organisation nicht lesen.
--
-- PROJ-8 hatte SELECT auf public.organizations nur für Admins freigeschaltet.
-- Das führt dazu, dass die access-Pruefung in src/lib/supabase/access.ts
-- den Join membership -> organization als NULL bekommt und den User auf
-- "no_organization" wirft, obwohl die Membership existiert.
--
-- Fix: User darf seine eigene Organisation lesen, wenn er Mitglied ist.

drop policy if exists "organizations_select_admin" on public.organizations;
drop policy if exists "organizations_select_admin_or_own_member" on public.organizations;

create policy "organizations_select_admin_or_own_member"
  on public.organizations
  for select
  to authenticated
  using (
    public.is_current_user_admin()
    or id in (
      select organization_id
      from public.organization_memberships
      where user_id = auth.uid()
    )
  );
