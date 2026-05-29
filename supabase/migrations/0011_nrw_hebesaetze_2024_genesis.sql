-- 0011_nrw_hebesaetze_2024_genesis.sql
-- Import/Update von 15 NRW-Gemeinden mit Hebesaetzen 2024.
-- Quelle: Regionalstatistik GENESIS, Tabelle 71231-01-03-5 (Berichtsjahr 2024).
-- Upsert ueber den Unique-Index (bundesland, name) aus Migration 0007.
-- Bei vorhandenen Gemeinden wird der bisherige hebesatz_b als vorjahr_b gesichert.

insert into public.municipalities
  (name, bundesland, hebesatz_a, hebesatz_b, hebesatz_gewerbe, datenstand, quellenstatus, quellenname, quellen_url)
values
  ('Bedburg-Hau',              'Nordrhein-Westfalen', 259,  501, 418, date '2024-12-31', 'bestaetigt', 'Regionalstatistik GENESIS, Tabelle 71231-01-03-5', 'https://www.regionalstatistik.de'),
  ('Emmerich am Rhein, Stadt', 'Nordrhein-Westfalen', 259,  501, 425, date '2024-12-31', 'bestaetigt', 'Regionalstatistik GENESIS, Tabelle 71231-01-03-5', 'https://www.regionalstatistik.de'),
  ('Geldern, Stadt',           'Nordrhein-Westfalen', 267,  518, 429, date '2024-12-31', 'bestaetigt', 'Regionalstatistik GENESIS, Tabelle 71231-01-03-5', 'https://www.regionalstatistik.de'),
  ('Goch, Stadt',              'Nordrhein-Westfalen', 285,  550, 420, date '2024-12-31', 'bestaetigt', 'Regionalstatistik GENESIS, Tabelle 71231-01-03-5', 'https://www.regionalstatistik.de'),
  ('Issum',                    'Nordrhein-Westfalen', 259,  501, 423, date '2024-12-31', 'bestaetigt', 'Regionalstatistik GENESIS, Tabelle 71231-01-03-5', 'https://www.regionalstatistik.de'),
  ('Much',                     'Nordrhein-Westfalen', 500,  750, 515, date '2024-12-31', 'bestaetigt', 'Regionalstatistik GENESIS, Tabelle 71231-01-03-5', 'https://www.regionalstatistik.de'),
  ('Neunkirchen-Seelscheid',   'Nordrhein-Westfalen', 599,  793, 515, date '2024-12-31', 'bestaetigt', 'Regionalstatistik GENESIS, Tabelle 71231-01-03-5', 'https://www.regionalstatistik.de'),
  ('Niederkassel, Stadt',      'Nordrhein-Westfalen', 350, 1100, 510, date '2024-12-31', 'bestaetigt', 'Regionalstatistik GENESIS, Tabelle 71231-01-03-5', 'https://www.regionalstatistik.de'),
  ('Rheinbach, Stadt',         'Nordrhein-Westfalen', 452,  753, 531, date '2024-12-31', 'bestaetigt', 'Regionalstatistik GENESIS, Tabelle 71231-01-03-5', 'https://www.regionalstatistik.de'),
  ('Ruppichteroth',            'Nordrhein-Westfalen', 300,  745, 500, date '2024-12-31', 'bestaetigt', 'Regionalstatistik GENESIS, Tabelle 71231-01-03-5', 'https://www.regionalstatistik.de'),
  ('Hövelhof',                 'Nordrhein-Westfalen', 247,  479, 414, date '2024-12-31', 'bestaetigt', 'Regionalstatistik GENESIS, Tabelle 71231-01-03-5', 'https://www.regionalstatistik.de'),
  ('Lichtenau, Stadt',         'Nordrhein-Westfalen', 320,  501, 431, date '2024-12-31', 'bestaetigt', 'Regionalstatistik GENESIS, Tabelle 71231-01-03-5', 'https://www.regionalstatistik.de'),
  ('Paderborn, Stadt',         'Nordrhein-Westfalen', 259,  501, 418, date '2024-12-31', 'bestaetigt', 'Regionalstatistik GENESIS, Tabelle 71231-01-03-5', 'https://www.regionalstatistik.de'),
  ('Salzkotten, Stadt',        'Nordrhein-Westfalen', 259,  501, 418, date '2024-12-31', 'bestaetigt', 'Regionalstatistik GENESIS, Tabelle 71231-01-03-5', 'https://www.regionalstatistik.de'),
  ('Bad Wünnenberg, Stadt',    'Nordrhein-Westfalen', 250,  429, 400, date '2024-12-31', 'bestaetigt', 'Regionalstatistik GENESIS, Tabelle 71231-01-03-5', 'https://www.regionalstatistik.de')
on conflict (bundesland, name) do update set
  vorjahr_b        = municipalities.hebesatz_b,
  hebesatz_a       = excluded.hebesatz_a,
  hebesatz_b       = excluded.hebesatz_b,
  hebesatz_gewerbe = excluded.hebesatz_gewerbe,
  datenstand       = excluded.datenstand,
  quellenstatus    = excluded.quellenstatus,
  quellenname      = excluded.quellenname,
  quellen_url      = excluded.quellen_url,
  updated_at       = now();
