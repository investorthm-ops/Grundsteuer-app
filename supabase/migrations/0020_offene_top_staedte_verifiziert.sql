-- 0020_offene_top_staedte_verifiziert.sql
-- Phase A, zweiter Teil: die zuvor zurueckgestellten Top-Staedte nach
-- Quellen-Verifikation nachziehen. Drei sind nun eindeutig (bestaetigt),
-- drei bleiben wegen Quellenkonflikt/fehlender Bestaetigung als 'offen'
-- (Arbeitsstand) eingetragen.

-- ===== bestaetigt =====

-- Bielefeld (offizielle Bekanntmachung 19.12.2024, gilt 2025/2026)
update public.municipalities set
  hebesatz_a=426, hebesatz_b=765, hebesatz_gewerbe=480,
  hebesatz_b_wohnen=null, hebesatz_b_nichtwohnen=null,
  vorjahr_b=null, datenstand=date '2025-01-01', quellenstatus='bestaetigt',
  quellenname='Stadt Bielefeld - Bekanntmachung Grundsteuer-Hebesaetze (Rat 19.12.2024)',
  quellen_url='https://www.bielefeld.de/sites/default/files/datei/2024/Grundsteuer-Hebesaetze_271224.pdf', updated_at=now()
where bundesland='Nordrhein-Westfalen' and name='Bielefeld';

-- Offenbach am Main (Beschluss 20.03.2025, aufkommensneutral, gilt 2025/2026)
update public.municipalities set
  hebesatz_a=370, hebesatz_b=1230, hebesatz_gewerbe=440,
  hebesatz_b_wohnen=null, hebesatz_b_nichtwohnen=null,
  vorjahr_b=null, datenstand=date '2025-01-01', quellenstatus='bestaetigt',
  quellenname='Stadt Offenbach am Main - aufkommensneutraler Hebesatz (Beschluss 20.03.2025)',
  quellen_url='https://www.offenbach.de/buerger_innen/rathaus-politik/haushalt-und-finanzen/grundsteuer-reform.php', updated_at=now()
where bundesland='Hessen' and name='Offenbach am Main';

-- Duisburg 2026 (einheitlicher Hebesatz B, Beschluss 24.02.2026; GewSt 495 ab 2026)
update public.municipalities set
  hebesatz_a=329, hebesatz_b=1169, hebesatz_gewerbe=495,
  hebesatz_b_wohnen=null, hebesatz_b_nichtwohnen=null,
  vorjahr_b=886, datenstand=date '2026-01-01', quellenstatus='bestaetigt',
  quellenname='Stadt Duisburg - einheitlicher Hebesatz Grundsteuer B ab 2026 (Beschluss 24.02.2026)',
  quellen_url='https://www.duisburg.de/pressemitteilungen/pm/2026/februar/stadtverwaltung-empfiehlt-einheitlichen-hebesatz-fuer-grundsteuer-b.php', updated_at=now()
where bundesland='Nordrhein-Westfalen' and name='Duisburg';

-- ===== offen (Arbeitsstand, noch nicht abschliessend bestaetigt) =====

-- Duesseldorf 2026 (offizielle Steueramt-Seite war nicht abrufbar; Werte aus Sekundaerquelle)
update public.municipalities set
  hebesatz_a=295, hebesatz_b=374, hebesatz_gewerbe=440,
  hebesatz_b_wohnen=null, hebesatz_b_nichtwohnen=null,
  vorjahr_b=null, datenstand=date '2026-01-01', quellenstatus='offen',
  quellenname='Landeshauptstadt Duesseldorf - Steueramt/Grundsteuer (noch zu bestaetigen)',
  quellen_url='https://www.duesseldorf.de/steueramt/grundsteuer', updated_at=now()
where bundesland='Nordrhein-Westfalen' and name='Düsseldorf';

-- Wiesbaden (A/B aus staedtischer Hebesatzsatzung; Gewerbesteuer-Wert konfligierend 454/460/395)
update public.municipalities set
  hebesatz_a=341.01, hebesatz_b=690.06,
  hebesatz_b_wohnen=null, hebesatz_b_nichtwohnen=null,
  vorjahr_b=null, datenstand=date '2025-01-01', quellenstatus='offen',
  quellenname='Landeshauptstadt Wiesbaden - Hebesatzsatzung ab 01.01.2025 (Gewerbesteuer noch zu bestaetigen)',
  quellen_url='https://www.wiesbaden.de', updated_at=now()
where bundesland='Hessen' and name='Wiesbaden';

-- Giessen (A/B aus Stadt/IHK; Gewerbesteuer noch nicht bestaetigt)
update public.municipalities set
  hebesatz_a=259, hebesatz_b=626,
  hebesatz_b_wohnen=null, hebesatz_b_nichtwohnen=null,
  vorjahr_b=null, datenstand=date '2025-01-01', quellenstatus='offen',
  quellenname='Stadt Giessen - Grundsteuer ab 2025 (Gewerbesteuer noch zu bestaetigen)',
  quellen_url='https://www.giessen.de', updated_at=now()
where bundesland='Hessen' and name='Gießen';
