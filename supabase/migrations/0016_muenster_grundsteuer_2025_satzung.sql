-- 0016_muenster_grundsteuer_2025_satzung.sql
-- Muster-Eintrag: Manuell gepflegter 2025er-Hebesatz aus kommunaler Satzung.
-- Grund: GENESIS/Regionalstatistik (IT.NRW) liefert fuer 2025 noch keine Werte
-- (Abruf jahr=2025 -> 0 Treffer am 2026-05-30). Reformbedingte 2025er-Saetze
-- muessen daher aus den Stadt-Satzungen gepflegt werden.
--
-- Quelle: Stadt Muenster, Amt fuer Finanzen und Beteiligungen,
--         Steuerhebesaetze (Hebesatzsatzung gueltig ab 01.01.2025).
--         https://www.stadt-muenster.de/finanzen/steuern-und-gebuehren/steuerhebesaetze
-- Werte 2025: Grundsteuer A 255, Grundsteuer B Wohnen 410, Nichtwohnen 620, Gewerbe 460.
-- Vorjahr (2024) Grundsteuer B: 510.

update public.municipalities
set
    hebesatz_a            = 255,
    hebesatz_b            = 410,   -- angezeigter B-Wert = Wohngrundstuecke
    hebesatz_b_wohnen     = 410,
    hebesatz_b_nichtwohnen = 620,
    hebesatz_gewerbe      = 460,
    vorjahr_b             = 510,
    datenstand            = date '2025-01-01',
    quellenstatus         = 'bestaetigt',
    quellenname           = 'Stadt Muenster - Steuerhebesaetze (Hebesatzsatzung ab 01.01.2025)',
    quellen_url           = 'https://www.stadt-muenster.de/finanzen/steuern-und-gebuehren/steuerhebesaetze',
    updated_at            = now()
where bundesland = 'Nordrhein-Westfalen'
  and name = 'Münster';
