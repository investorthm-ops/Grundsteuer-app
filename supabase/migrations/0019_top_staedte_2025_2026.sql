-- 0019_top_staedte_2025_2026.sql
-- Phase A der Datenfrische-Strategie: die groessten/relevantesten Staedte auf den
-- neuesten verfuegbaren Stand (2025/2026) bringen. Werte und Quellen aus
-- docs/data-sources.md (gegen offizielle kommunale Veroeffentlichungen geprueft).
--
-- Konvention:
-- - hebesatz_b = angezeigter Standardwert; bei differenzierter Grundsteuer B
--   entspricht er dem Wohngrundstueck, zusaetzlich hebesatz_b_wohnen/_nichtwohnen.
-- - vorjahr_b nur gesetzt, wenn ein sinnvoller Vergleich im selben Regime moeglich
--   ist (2025->2026). Ueber die Reformgrenze 2024->2025 bleibt vorjahr_b NULL,
--   da Hebesaetze vor/nach der Reform nicht direkt vergleichbar sind.
-- - Bei Wechsel von differenziert (2025) auf einheitlich (2026) werden
--   hebesatz_b_wohnen/_nichtwohnen auf NULL gesetzt.

-- ===== Nordrhein-Westfalen =====

-- Koeln 2026 (2025 B 475 -> 2026 B 550)
update public.municipalities set
  hebesatz_a=165, hebesatz_b=550, hebesatz_gewerbe=475,
  hebesatz_b_wohnen=null, hebesatz_b_nichtwohnen=null,
  vorjahr_b=475, datenstand=date '2026-01-01', quellenstatus='bestaetigt',
  quellenname='Stadt Koeln - Grundsteuer/Hebesaetze 2026',
  quellen_url='https://www.stadt-koeln.de/artikel/06286/index.html', updated_at=now()
where bundesland='Nordrhein-Westfalen' and name='Köln';

-- Aachen ab 01.01.2025 (differenziert? nein, einheitlich B 637)
update public.municipalities set
  hebesatz_a=368, hebesatz_b=637, hebesatz_gewerbe=475,
  hebesatz_b_wohnen=null, hebesatz_b_nichtwohnen=null,
  vorjahr_b=null, datenstand=date '2025-01-01', quellenstatus='bestaetigt',
  quellenname='Stadt Aachen - Hebesatzsatzung ab 01.01.2025',
  quellen_url='https://www.aachen.de/in-aachen-leben/politik-und-verwaltung/stadtrecht/finanzen/satzung-ueber-die-festsetzung-der-hebesaetze.pdf?cid=bfv', updated_at=now()
where bundesland='Nordrhein-Westfalen' and name='Aachen';

-- Wuppertal ab 01.01.2025
update public.municipalities set
  hebesatz_a=309, hebesatz_b=947, hebesatz_gewerbe=490,
  hebesatz_b_wohnen=null, hebesatz_b_nichtwohnen=null,
  vorjahr_b=null, datenstand=date '2025-01-01', quellenstatus='bestaetigt',
  quellenname='Stadt Wuppertal - Hebesatzsatzung ab 01.01.2025',
  quellen_url='https://www.wuppertal.de/rathaus-buergerservice/verwaltung/politik/stadtrecht-dokumente/2-01.pdf', updated_at=now()
where bundesland='Nordrhein-Westfalen' and name='Wuppertal';

-- Bochum 2025 (differenziert Wohnen/Nichtwohnen)
update public.municipalities set
  hebesatz_a=374, hebesatz_b=715, hebesatz_gewerbe=495,
  hebesatz_b_wohnen=715, hebesatz_b_nichtwohnen=1190,
  vorjahr_b=null, datenstand=date '2025-01-01', quellenstatus='bestaetigt',
  quellenname='Stadt Bochum - Steuerhebesaetze 2025',
  quellen_url='https://www.bochum.de/Amt-fuer-Finanzsteuerung/Steuerhebesaetze-und-Gebuehren', updated_at=now()
where bundesland='Nordrhein-Westfalen' and name='Bochum';

-- Bonn 2025 (differenziert Wohnen/Nichtwohnen)
update public.municipalities set
  hebesatz_a=543, hebesatz_b=657, hebesatz_gewerbe=537,
  hebesatz_b_wohnen=657, hebesatz_b_nichtwohnen=900,
  vorjahr_b=null, datenstand=date '2025-01-01', quellenstatus='bestaetigt',
  quellenname='Stadt Bonn - Amtsblatt 21/2025 (Hebesaetze ab 01.01.2025)',
  quellen_url='https://www.bonn.de/medien-global/amt-13/amtsblatt/21_2025_Amtsblatt.pdf', updated_at=now()
where bundesland='Nordrhein-Westfalen' and name='Bonn';

-- Dortmund 2026 (Wechsel von differenziert 2025 auf einheitlich B 800)
update public.municipalities set
  hebesatz_a=595, hebesatz_b=800, hebesatz_gewerbe=485,
  hebesatz_b_wohnen=null, hebesatz_b_nichtwohnen=null,
  vorjahr_b=null, datenstand=date '2026-01-01', quellenstatus='bestaetigt',
  quellenname='Stadt Dortmund - Hebesatzsatzung v. 19.12.2025 (ab 2026)',
  quellen_url='https://www.dortmund.de/dortmund/projekte/rathaus/verwaltung/stadtkasse-und-steueramt/downloads/linksunddownloads/satzung-ueber-die-festsetzung-der-hebesaetze-fuer-die-realsteuern-v.-19.12.2025.pdf', updated_at=now()
where bundesland='Nordrhein-Westfalen' and name='Dortmund';

-- ===== Hessen =====

-- Frankfurt am Main ab 01.01.2025 (Dezimal-Hebesaetze)
update public.municipalities set
  hebesatz_a=317.62, hebesatz_b=854.69, hebesatz_gewerbe=460,
  hebesatz_b_wohnen=null, hebesatz_b_nichtwohnen=null,
  vorjahr_b=null, datenstand=date '2025-01-01', quellenstatus='bestaetigt',
  quellenname='Stadt Frankfurt am Main - Hebesaetze ab 01.01.2025',
  quellen_url='https://frankfurt.de/themen/finanzen/steuern/grundsteuer', updated_at=now()
where bundesland='Hessen' and name='Frankfurt am Main';

-- Kassel 2025/2026 (B unveraendert 490, A gesenkt auf 345)
update public.municipalities set
  hebesatz_a=345, hebesatz_b=490, hebesatz_gewerbe=440,
  hebesatz_b_wohnen=null, hebesatz_b_nichtwohnen=null,
  vorjahr_b=null, datenstand=date '2026-01-01', quellenstatus='bestaetigt',
  quellenname='Stadt Kassel - Hebesatzsatzung 2025/2026',
  quellen_url='https://www.kassel.de', updated_at=now()
where bundesland='Hessen' and name='Kassel';

-- Darmstadt 2025/2026
update public.municipalities set
  hebesatz_a=693, hebesatz_b=1181, hebesatz_gewerbe=459,
  hebesatz_b_wohnen=null, hebesatz_b_nichtwohnen=null,
  vorjahr_b=null, datenstand=date '2025-01-01', quellenstatus='bestaetigt',
  quellenname='Stadt Darmstadt - Realsteuerhebesaetze 2025',
  quellen_url='https://www.darmstadt.de', updated_at=now()
where bundesland='Hessen' and name='Darmstadt';

-- Hanau 2026 (A/B ab 2025 unveraendert, GewSt 2026 auf 458)
update public.municipalities set
  hebesatz_a=175, hebesatz_b=645, hebesatz_gewerbe=458,
  hebesatz_b_wohnen=null, hebesatz_b_nichtwohnen=null,
  vorjahr_b=null, datenstand=date '2026-01-01', quellenstatus='bestaetigt',
  quellenname='Stadt Hanau - Beschluss 18.11.2024 (ab 2025), GewSt 458 ab 2026',
  quellen_url='https://www.hanau.de', updated_at=now()
where bundesland='Hessen' and name='Hanau';

-- Marburg 2025 (neuester vollstaendig belegter Stand; 2026 nur teilweise)
update public.municipalities set
  hebesatz_a=210, hebesatz_b=450, hebesatz_gewerbe=380,
  hebesatz_b_wohnen=null, hebesatz_b_nichtwohnen=null,
  vorjahr_b=null, datenstand=date '2025-01-01', quellenstatus='bestaetigt',
  quellenname='Universitaetsstadt Marburg - Grundsteuer ab 2025',
  quellen_url='https://www.marburg.de', updated_at=now()
where bundesland='Hessen' and name='Marburg';

-- Fulda 2025 (aufkommensneutral)
update public.municipalities set
  hebesatz_a=144, hebesatz_b=313, hebesatz_gewerbe=380,
  hebesatz_b_wohnen=null, hebesatz_b_nichtwohnen=null,
  vorjahr_b=null, datenstand=date '2025-01-01', quellenstatus='bestaetigt',
  quellenname='Stadt Fulda - Hebesatzsatzung 2025',
  quellen_url='https://www.fulda.de', updated_at=now()
where bundesland='Hessen' and name='Fulda';

-- Dreieich 2026 (2025 B 709 -> 2026 B 900)
update public.municipalities set
  hebesatz_a=900, hebesatz_b=900, hebesatz_gewerbe=380,
  hebesatz_b_wohnen=null, hebesatz_b_nichtwohnen=null,
  vorjahr_b=709, datenstand=date '2026-01-01', quellenstatus='bestaetigt',
  quellenname='Stadt Dreieich - Hebesatzsatzung ab 01.01.2026',
  quellen_url='https://www.dreieich.de', updated_at=now()
where bundesland='Hessen' and name='Dreieich';
