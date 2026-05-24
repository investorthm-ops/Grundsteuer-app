# PROJ-10: Differenzierte Grundsteuer-B-Hebesaetze

## Status: Deployed
**Created:** 2026-05-22
**Last Updated:** 2026-05-24

## Uebersicht
Ab 2025 nutzen mehrere Kommunen differenzierte Grundsteuer-B-Hebesaetze fuer Wohngrundstuecke und Nichtwohngrundstuecke. Der Grundsteuer-Monitor muss diese Werte getrennt speichern, anzeigen, vergleichen und exportieren koennen. Ein einzelnes Feld `Grundsteuer B` reicht fuer diese Kommunen fachlich nicht mehr aus.

## Zielgruppe
- Steuerberater und Kanzleien, die Mandanten mit Wohn- und Gewerbeimmobilien beraten.
- Immobilienbestandshalter und Investoren, die Wohn- und Nichtwohnobjekte getrennt bewerten.
- Gewerbetreibende und Unternehmen, die Nichtwohngrundstuecke pruefen.
- Projektbetreiber/Admin, der kommunale Reformdaten korrekt pflegen will.

## MVP-Scope
- Datenmodell erhaelt optionale Felder fuer:
  - `Grundsteuer B Wohnen`
  - `Grundsteuer B Nichtwohnen`
- Bestehendes Feld `Grundsteuer B` bleibt fuer Kommunen ohne Differenzierung erhalten.
- Admin-Pflege erlaubt Eintrag und Bearbeitung der differenzierten Werte.
- Datenbankansicht zeigt differenzierte Werte sichtbar, wenn vorhanden.
- Vergleichsansicht und Rangliste koennen differenzierte B-Werte anzeigen.
- CSV/Excel-Export enthaelt beide neuen Felder.
- SEO-Stadtseiten zeigen differenzierte B-Werte mit Hinweis, wenn vorhanden.
- Renditeauswirkungs-Rechner erlaubt Auswahl zwischen Standard, Wohnen und Nichtwohnen, wenn differenzierte Werte vorliegen.
- Altena wird als erster Referenzfall mit korrekten aktuellen Werten gepflegt.

## Non-Goals
- Keine automatische Recherche aller differenzierten Kommunen in diesem Schritt.
- Keine steuerliche Bewertung, welches Grundstueck in welche Kategorie faellt.
- Keine vollstaendige historische Zeitreihe fuer beide B-Kategorien.
- Keine automatische Umrechnung alter Standardwerte in Wohn-/Nichtwohnwerte.
- Keine Rechtsberatung zur Verfassungsmaessigkeit differenzierter Hebesaetze.

## Dependencies
- Builds on: PROJ-1 (Hebesatz-Datenbank).
- Builds on: PROJ-5 (CSV/Excel-Export).
- Builds on: PROJ-6 (Renditeauswirkungs-Rechner).
- Builds on: PROJ-7 (Vergleich und Benchmarking).
- Related to: PROJ-9 (Datenvertrauen und Demo-Daten), weil Quellen und Datenstand fuer differenzierte Werte besonders wichtig sind.

## User Stories
- Als Steuerberater moechte ich bei einer Kommune erkennen, ob Grundsteuer B differenziert ist, damit ich Mandanten nicht mit einem falschen Einheitswert berate.
- Als Investor moechte ich Wohn- und Nichtwohngrundstuecke getrennt vergleichen, damit Renditeauswirkungen realistischer werden.
- Als Admin moechte ich differenzierte Grundsteuer-B-Werte pflegen, damit Kommunen wie Altena korrekt abgebildet werden.
- Als Nutzer moechte ich im Export beide B-Werte sehen, damit ich eigene Auswertungen sauber weiterfuehren kann.
- Als Nutzer des Rechners moechte ich die passende Objektart auswaehlen, damit die Berechnung nicht den falschen Hebesatz nutzt.

## Acceptance Criteria

### Datenmodell
- [ ] Es gibt optionale Felder fuer Grundsteuer B Wohnen und Grundsteuer B Nichtwohnen.
- [ ] Bestehende Datensaetze ohne Differenzierung funktionieren weiter.
- [ ] Werte werden als Prozentpunkte validiert und duerfen nicht negativ sein.
- [ ] Datenstand und Quelle bleiben je Kommune sichtbar.

### Admin-Pflege
- [ ] Admin kann B Wohnen und B Nichtwohnen pro Kommune erfassen.
- [ ] Admin kann differenzierte Werte wieder entfernen.
- [ ] Admin sieht klar, ob eine Kommune differenzierte B-Werte hat.
- [ ] Altena kann mit aktuellen differenzierten Werten gepflegt werden.

### Datenbank und Stadtseiten
- [ ] Datenbankansicht zeigt B Standard, B Wohnen und B Nichtwohnen sinnvoll an.
- [ ] Stadtseite zeigt differenzierte Werte mit Hinweistext.
- [ ] Wenn keine Differenzierung vorhanden ist, bleibt die Anzeige kompakt.
- [ ] Alte Standard-B-Werte werden nicht mit differenzierten Werten verwechselt.

### Vergleich und Rangliste
- [ ] Direktvergleich zeigt differenzierte B-Werte, wenn vorhanden.
- [ ] Rangliste kann nach B Standard, B Wohnen oder B Nichtwohnen sortieren.
- [ ] Fehlende differenzierte Werte werden als fehlend markiert und brechen die Ansicht nicht.

### Export
- [ ] CSV/Excel-Export enthaelt Spalten fuer B Standard, B Wohnen und B Nichtwohnen.
- [ ] Export enthaelt weiterhin Datenstand, Quellenstatus, Quellenname und Quellen-URL.

### Rechner
- [ ] Rechner erlaubt Auswahl der relevanten Grundsteuer-B-Art.
- [ ] Bei Kommunen ohne Differenzierung nutzt der Rechner den Standard-B-Wert.
- [ ] Bei Kommunen mit Differenzierung zeigt der Rechner einen klaren Hinweis zur Auswahl.

## Edge Cases
- Kommune hat nur B Wohnen, aber keinen B Nichtwohnen-Wert.
- Kommune hat differenzierte Werte, aber keinen Standard-B-Wert fuer 2025.
- Kommune hat alte Standardwerte bis 2024 und differenzierte Werte ab 2025.
- Nutzer vergleicht Kommunen mit und ohne Differenzierung.
- Export wird an Mandanten weitergegeben und muss ohne App-Kontext verstaendlich bleiben.
- Admin traegt versehentlich denselben Wert in alle B-Felder ein.
- Quelle nennt differenzierte Werte, aber der Datenstand ist unklar.

## Technical Requirements (optional)
- Migration fuer neue optionale Spalten in `municipalities`.
- Validierung in Zod-Schemas.
- Anpassung aller UI-Komponenten, die Grundsteuer B anzeigen.
- Anpassung Export-Route.
- Anpassung Import-/Admin-Pflege.
- Build muss ohne Datenverlust fuer bestehende Datensaetze laufen.

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
### MVP-Entscheidung

PROJ-10 erweitert die bestehende `municipalities`-Tabelle um zwei optionale Felder:

- `hebesatz_b_wohnen`
- `hebesatz_b_nichtwohnen`

Das bestehende Feld `hebesatz_b` bleibt erhalten. Es dient weiter als Standardwert fuer historische Daten, Kommunen ohne Differenzierung und Rueckwaertskompatibilitaet. Dadurch bleiben bestehende API-Routen, Suchlogik, Watchlist und Stadtseiten stabil.

### Umsetzungsschritte

- Migration `0008_differentiated_property_tax_b.sql` legt die neuen Spalten und Indizes an.
- Altena wird als Referenzfall mit B Wohnen `1010` und B Nichtwohnen `2020` gepflegt.
- Zod-Validierung und TypeScript-Typen kennen die neuen optionalen Felder.
- Admin-Pflege, Datenbankansicht, Vergleich, Rangliste, Export, Stadtseite und Rechner zeigen oder nutzen die neuen Werte.

### Offene Produktkante

Einige Kommunen haben ab 2025 keinen fachlich sinnvollen einheitlichen B-Wert mehr. Fuer diesen MVP bleibt `hebesatz_b` trotzdem Pflichtfeld, damit alte Daten und bestehende Vergleiche nicht brechen. Eine spaetere Version kann historische Werte und aktuelle differenzierte Werte zeitlich trennen.

## QA Test Results

### 2026-05-22 — Datenbank-Migration angewendet
Supabase-Migrationen auf Projekt `axibmcmysefexwostzsj` angewendet und in der
Migrationshistorie registriert:
- `0007_prevent_duplicate_municipalities` — Unique-Index auf `(bundesland, name)`.
  Vorab-Pruefung: keine doppelten Gemeinden vorhanden, Migration lief ohne Konflikt.
- `0008_differentiated_property_tax_b` — neue Spalten `hebesatz_b_wohnen` /
  `hebesatz_b_nichtwohnen` (Check 0-3000), zwei Indizes, Altena-Referenzdatensatz.

Datenstand-Pruefung: 818 Gemeinden gesamt, genau 1 mit differenzierten B-Werten
(Altena). Die uebrigen 817 bleiben `NULL` — rueckwaertskompatibel.

Altena (NRW) verifiziert: `hebesatz_b = 910`, `hebesatz_b_wohnen = 1010`,
`hebesatz_b_nichtwohnen = 2020`, `datenstand = 2025-01-01`, `quellenstatus = bestaetigt`,
Quelle gesetzt.

### Verifizierte Oberflaechen
- **Stadtseite** (`/grundsteuer-hebesatz/altena`) — LIVE geprueft: zeigt B Standard
  910 %, B Wohnen 1010 %, B Nichtwohnen 2020 %, Datenstand 1.1.2025 + Quelle.
- **Datenbank** — vom Nutzer geprueft: Altena zeigt B Wohnen 1010 % mit Hinweis
  "differenziert", B Nichtwohnen 2020 %; nicht-differenzierte Gemeinden zeigen "-".
- **Vergleich / Rangliste** — vom Nutzer geprueft: Direktvergleich und Rangliste
  zeigen die differenzierten Werte korrekt, fehlende Werte brechen die Ansicht nicht.
- **Export** — Code geprueft: CSV enthaelt Spalten B Wohnen / B Nichtwohnen.

### Bugfix Rechner (2026-05-22)
Beim Klick-Test fiel auf: der Renditeauswirkungs-Rechner lud nur 100 von 818
Gemeinden (`pageSize=100`, API-Limit) und bot ein reines Dropdown ohne Suche —
die meisten Gemeinden waren nicht auswaehlbar. Behoben: der Gemeinde-Selektor ist
jetzt eine durchsuchbare Combobox (shadcn `Popover` + `Command`) mit
serverseitiger Suche ueber `/api/municipalities?q=` (debounced), analog zum
Suchmuster der Vergleichsansicht. Damit sind alle Gemeinden auffindbar.

### Hinweise
- `hebesatz_b` von Altena bleibt 910 (Wert von 2022), `datenstand` wurde durch die
  Migration auf 2025-01-01 gesetzt. Standard-B-Wert und Datenstand sind damit aus
  unterschiedlichen Jahren — fachlich gewollt (910 ist der historische Standard,
  1010/2020 sind die aktuellen differenzierten Werte ab 2025).
- Supabase-Security-Advisor: 6 WARN-Befunde, alle pre-existing (SECURITY-DEFINER-
  Funktionen aus PROJ-6/8, deaktivierter Leaked-Password-Schutz). Migration 0007/0008
  hat keine neuen Befunde eingefuehrt.

## Deployment
_To be added by /deploy_
