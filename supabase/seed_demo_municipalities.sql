-- Demo data for local MVP testing.
-- These values are illustrative and not an official data source.

insert into public.municipalities (
  name,
  bundesland,
  kreis,
  hebesatz_a,
  hebesatz_b,
  hebesatz_gewerbe,
  vorjahr_b,
  datenstand,
  quellenstatus
)
select *
from (
  values
    ('Düsseldorf', 'Nordrhein-Westfalen', 'kreisfreie Stadt', 156, 440, 440, 440, date '2026-01-01', 'bestaetigt'),
    ('Koeln', 'Nordrhein-Westfalen', 'kreisfreie Stadt', 165, 515, 475, 475, date '2026-01-01', 'bestaetigt'),
    ('Dortmund', 'Nordrhein-Westfalen', 'kreisfreie Stadt', 325, 610, 485, 610, date '2026-01-01', 'bestaetigt'),
    ('Essen', 'Nordrhein-Westfalen', 'kreisfreie Stadt', 265, 670, 480, 670, date '2026-01-01', 'bestaetigt'),
    ('Muenster', 'Nordrhein-Westfalen', 'kreisfreie Stadt', 310, 510, 460, 510, date '2026-01-01', 'bestaetigt'),
    ('Bonn', 'Nordrhein-Westfalen', 'kreisfreie Stadt', 340, 680, 490, 680, date '2026-01-01', 'bestaetigt'),
    ('Aachen', 'Nordrhein-Westfalen', 'Staedteregion Aachen', 305, 695, 475, 695, date '2026-01-01', 'bestaetigt'),
    ('Bielefeld', 'Nordrhein-Westfalen', 'kreisfreie Stadt', 230, 660, 480, 650, date '2026-01-01', 'bestaetigt'),
    ('Wuppertal', 'Nordrhein-Westfalen', 'kreisfreie Stadt', 240, 620, 490, 620, date '2026-01-01', 'bestaetigt'),
    ('Duisburg', 'Nordrhein-Westfalen', 'kreisfreie Stadt', 255, 855, 520, 855, date '2026-01-01', 'bestaetigt')
) as demo(
  name,
  bundesland,
  kreis,
  hebesatz_a,
  hebesatz_b,
  hebesatz_gewerbe,
  vorjahr_b,
  datenstand,
  quellenstatus
)
where not exists (
  select 1
  from public.municipalities m
  where m.name = demo.name
    and m.bundesland = demo.bundesland
);
