-- 0005_harden_security_definer_functions.sql
-- Security hardening from the 2026-05-20 advisor review.
-- 1. approve_import_rows is a SECURITY DEFINER function and was executable by
--    the anon role via /rest/v1/rpc. It already self-guards (internal admin
--    check on user_roles), but unauthenticated callers should not reach it.
--    The admin API route calls it with the authenticated role, which is kept.
-- 2. set_updated_at had a mutable search_path; pin it for predictability.

revoke execute on function public.approve_import_rows(uuid, uuid[]) from anon;
revoke execute on function public.approve_import_rows(uuid, uuid[]) from public;

alter function public.set_updated_at() set search_path = '';
