-- 0017_essen_grundsteuer_2025_satzung.sql
-- Muster-Eintrag: Manuell gepflegter 2025er-Hebesatz aus kommunaler Satzung.
-- Grund: GENESIS/Regionalstatistik (IT.NRW) liefert fuer 2025 noch keine Werte.
--
-- Quelle: Stadt Essen, Ratsbeschluss vom 27.11.2024, differenzierte Grundsteuer B
--         ab 01.01.2025 (FAQ Grundsteuerreform + Pressemeldung).
--         https://www.essen.de/rathaus/haushalt_und_finanzen/grundbesitzabgaben/gba_faqs_1.de.html
-- Werte 2025: Grundsteuer A 390, Grundsteuer B Wohnen 655, Nichtwohnen 1290, Gewerbe 480.
-- Vorjahr (2024) Grundsteuer B: 670.

update public.municipalities
set
    hebesatz_a            = 390,
    hebesatz_b            = 655,   -- angezeigter B-Wert = Wohngrundstuecke
    hebesatz_b_wohnen     = 655,
    hebesatz_b_nichtwohnen = 1290,
    hebesatz_gewerbe      = 480,
    vorjahr_b             = 670,
    datenstand            = date '2025-01-01',
    quellenstatus         = 'bestaetigt',
    quellenname           = 'Stadt Essen - FAQ Grundsteuerreform, Ratsbeschluss 27.11.2024 (gueltig ab 01.01.2025)',
    quellen_url           = 'https://www.essen.de/rathaus/haushalt_und_finanzen/grundbesitzabgaben/gba_faqs_1.de.html',
    updated_at            = now()
where bundesland = 'Nordrhein-Westfalen'
  and name = 'Essen';
