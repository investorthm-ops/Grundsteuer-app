-- 0008_differentiated_property_tax_b.sql
-- Schema for PROJ-10: differentiated Grundsteuer B rates.

alter table public.municipalities
  add column if not exists hebesatz_b_wohnen int check (hebesatz_b_wohnen is null or (hebesatz_b_wohnen between 0 and 3000)),
  add column if not exists hebesatz_b_nichtwohnen int check (hebesatz_b_nichtwohnen is null or (hebesatz_b_nichtwohnen between 0 and 3000));

create index if not exists municipalities_hebesatz_b_wohnen_idx
  on public.municipalities(hebesatz_b_wohnen);

create index if not exists municipalities_hebesatz_b_nichtwohnen_idx
  on public.municipalities(hebesatz_b_nichtwohnen);

update public.municipalities
set
  hebesatz_b_wohnen = 1010,
  hebesatz_b_nichtwohnen = 2020,
  datenstand = '2025-01-01',
  quellenstatus = 'bestaetigt',
  quellenname = 'Stadt Altena (Westf.) - Informationen zur neuen Grundsteuer ab 01.01.2025',
  quellen_url = 'https://www.altena-notbetrieb.de/wp-content/uploads/go-x/u/0166675f-5e86-4c6a-baaf-f1674494bfc8/Grundsteuer.pdf'
where name = 'Altena'
  and bundesland = 'Nordrhein-Westfalen';
