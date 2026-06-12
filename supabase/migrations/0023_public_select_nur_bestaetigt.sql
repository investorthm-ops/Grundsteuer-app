-- 0023_public_select_nur_bestaetigt.sql
-- Anonyme Besucher (SEO-Stadtseiten, Sitemap) sehen nur noch Werte mit
-- quellenstatus = 'bestaetigt'. Offene, noch nicht final geprüfte Werte
-- bleiben eingeloggten Nutzern und Admins vorbehalten.
-- Ersetzt die offene anon-Policy aus 0004 (using (true)).
-- QA-Befund PROJ-1, Entscheidung Markus 2026-06-12.

drop policy if exists "municipalities_select_public" on public.municipalities;
create policy "municipalities_select_public"
  on public.municipalities
  for select
  to anon
  using (quellenstatus = 'bestaetigt');
