-- 0004_public_municipality_seo_select.sql
-- Allows public SEO city pages to read municipality data.
-- Municipality tax rates are public information; user-specific data stays protected.

drop policy if exists "municipalities_select_public" on public.municipalities;
create policy "municipalities_select_public"
  on public.municipalities
  for select
  to anon
  using (true);

