-- 0024_drop_toter_active_org_helper.sql
-- Entfernt die ungenutzte Hilfsfunktion current_user_has_active_organization()
-- aus 0006. Die App-Zugriffskontrolle laeuft komplett ueber
-- src/lib/supabase/access.ts (getAccessState) bzw. die Middleware src/proxy.ts —
-- diese SQL-Funktion wurde nie verwendet.
--
-- Live-Verifikation 2026-06-16 (Prod-DB): 0 Policies, 0 Views, 0 weitere
-- Funktionen referenzieren sie. Gefahrloser Drop.
--
-- WICHTIG: is_current_user_admin() bleibt unangetastet — die wird von den
-- RLS-Policies in 0006, 0009 und 0010 aktiv genutzt.

drop function if exists public.current_user_has_active_organization();
