-- 0014_dedupe_genesis_namenssuffix.sql
-- Fix: Der GENESIS-2024-Import (Migrationen 0011-0013) legte Dubletten an, weil die
-- amtlichen Namen einen Suffix tragen (", Stadt" / ", kreisfreie Stadt") und damit
-- nicht auf die kanonischen 2022-Namen (ohne Suffix) im ON-CONFLICT-Upsert matchten.
-- Folge: SEO- und Datenbankseiten zeigten weiter den alten 2022-Stand (z. B. Luedenscheid).
--
-- Diese Migration fuehrt die 2024-Werte in die kanonischen Zeilen zusammen (der bisherige
-- hebesatz_b wird als vorjahr_b gesichert) und entfernt anschliessend die Suffix-Dubletten.
-- Wichtig: Es wird NUR zusammengefuehrt, wenn die kanonische Zeile AELTER ist als die
-- 2024-Dublette. Neuere, manuell gepflegte Zeilen (z. B. Altena mit Stand 2025 und
-- differenzierten Wohnen/Nichtwohnen-Werten) bleiben unveraendert; ihre Dublette wird nur geloescht.
-- Erwartung: 248 Zusammenfuehrungen + 1 unveraenderte Zeile (Altena 2025) + 1 reine Umbenennung.

begin;

-- 1) 2024-Werte aus der Suffix-Dublette in die kanonische Zeile uebernehmen,
--    aber nur wenn die kanonische Zeile aelter ist (sonst wuerden neuere Daten verloren gehen).
update public.municipalities canonical
set
  vorjahr_b        = canonical.hebesatz_b,
  hebesatz_a       = dup.hebesatz_a,
  hebesatz_b       = dup.hebesatz_b,
  hebesatz_gewerbe = dup.hebesatz_gewerbe,
  datenstand       = dup.datenstand,
  quellenstatus    = dup.quellenstatus,
  quellenname      = dup.quellenname,
  quellen_url      = dup.quellen_url,
  updated_at       = now()
from public.municipalities dup
where dup.name ~ ',\s*(kreisfreie Stadt|Stadt)$'
  and dup.bundesland = canonical.bundesland
  and canonical.name = regexp_replace(dup.name, ',\s*(kreisfreie Stadt|Stadt)$', '')
  and canonical.id <> dup.id
  and canonical.datenstand < dup.datenstand;

-- 2) Suffix-Dubletten loeschen, deren kanonische Zeile jetzt den 2024-Stand traegt.
delete from public.municipalities dup
where dup.name ~ ',\s*(kreisfreie Stadt|Stadt)$'
  and exists (
    select 1 from public.municipalities canonical
    where canonical.bundesland = dup.bundesland
      and canonical.name = regexp_replace(dup.name, ',\s*(kreisfreie Stadt|Stadt)$', '')
      and canonical.id <> dup.id
  );

-- 3) Verbleibende Suffix-Zeilen ohne kanonischen Zwilling: nur Suffix entfernen.
update public.municipalities
set name = regexp_replace(name, ',\s*(kreisfreie Stadt|Stadt)$', ''),
    updated_at = now()
where name ~ ',\s*(kreisfreie Stadt|Stadt)$';

commit;
