-- 0025_dedupe_hessen_namenssuffix.sql
-- Entfernt 26 veraltete Hessen-Dubletten (Datenstand 2024 oder aelter), die beim
-- 2025-Update nicht geloescht wurden, weil ihr Name einen Ehrentitel-Zusatz nach
-- Komma traegt ("Marburg, Universitaetsstadt") bzw. eine abweichende Schreibweise
-- hat ("Bad Homburg v.d.Hoehe" vs. "Bad Homburg v. d. Hoehe"). Fuer jede dieser
-- Zeilen existiert bereits eine saubere Klarnamen-Zeile mit korrektem 2025-Wert
-- (z. B. Marburg 390->450, Giessen 600->626, Hanau 595->645).
--
-- Verifiziert 2026-07-07 (Prod-DB): genau 26 betroffene Zeilen, 0 Watchlist- und
-- 0 Import-Referenzen darauf. Gleiches Muster wie 0014/0015 (NRW-Suffix-Dubletten).
--
-- Idempotent: loescht nur Zeilen, zu denen ein 2025-oder-neuer-Zwilling existiert;
-- ein zweiter Lauf trifft nichts mehr.
--
-- Bromskirchen (Datenstand 2022, KEIN Zwilling) bleibt bewusst unangetastet und
-- wird separat geprueft (aktueller Wert nicht belastbar verifizierbar).

delete from public.municipalities m
where m.bundesland = 'Hessen'
  and m.datenstand < '2025-01-01'
  and exists (
    select 1
    from public.municipalities t
    where t.bundesland = 'Hessen'
      and t.id <> m.id
      and t.datenstand >= '2025-01-01'
      and lower(replace(split_part(t.name, ',', 1), ' ', ''))
        = lower(replace(split_part(m.name, ',', 1), ' ', ''))
  );
