-- 0021_bdst_quelle_klarstellen.sql
-- Ehrliche Kennzeichnung der Datenherkunft fuer die per BdSt-Automation
-- importierten NRW-Zeilen.
--
-- Hintergrund: Die Quelle "BdSt NRW, Grundsteuer B-Hebesaetze 2025" enthaelt
-- ausschliesslich die Grundsteuer B. Die Automation hat B korrekt auf 2025
-- aktualisiert, Grundsteuer A und Gewerbesteuer blieben aber auf dem 2024er
-- GENESIS-Stand. Stichproben (Neuss A 205 statt 303; Guetersloh A 360 statt 364)
-- bestaetigen das. Der Quellenname wird daher transparent gemacht.
-- Es werden KEINE Hebesatz-Werte geaendert, nur das Quellen-Label.

update public.municipalities
set
  quellenname = 'BdSt NRW - Grundsteuer B 2025; Grundsteuer A und Gewerbesteuer Stand 2024 (nicht reformbestaetigt)',
  updated_at = now()
where bundesland = 'Nordrhein-Westfalen'
  and quellenname = 'BdSt NRW, Grundsteuer B-Hebesätze 2025';
