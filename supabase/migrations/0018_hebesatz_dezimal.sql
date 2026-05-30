-- 0018_hebesatz_dezimal.sql
-- Hebesatz-Spalten von integer auf Dezimal umstellen.
-- Grund: Hessische Kommunen (z. B. Frankfurt 854,69; Wiesbaden 690,06) setzen
-- Hebesaetze mit zwei Nachkommastellen fest. Die bisherigen integer-Spalten
-- koennen diese Werte nicht exakt speichern.
--
-- Typwahl: double precision (NICHT numeric). PostgREST/Supabase liefert numeric
-- als JSON-String, was den bestehenden number-Vertrag der App (typeof === 'number',
-- Delta-Rechnung) brechen wuerde. double precision kommt als JSON-Zahl zurueck und
-- ist fuer Hebesaetze (< 10000, max. 2 Nachkommastellen) ausreichend genau.
-- Anzeige rundet/zeigt zwei Nachkommastellen; JS gibt direkte Werte als kuerzeste
-- Darstellung aus (854.69 -> "854.69").

alter table public.municipalities
  alter column hebesatz_a            type double precision using hebesatz_a::double precision,
  alter column hebesatz_b            type double precision using hebesatz_b::double precision,
  alter column hebesatz_gewerbe      type double precision using hebesatz_gewerbe::double precision,
  alter column hebesatz_b_wohnen     type double precision using hebesatz_b_wohnen::double precision,
  alter column hebesatz_b_nichtwohnen type double precision using hebesatz_b_nichtwohnen::double precision,
  alter column vorjahr_b             type double precision using vorjahr_b::double precision;
