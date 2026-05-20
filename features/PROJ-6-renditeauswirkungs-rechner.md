# PROJ-6: Renditeauswirkungs-Rechner

## Status: Deployed
**Created:** 2026-05-20
**Last Updated:** 2026-05-20

## Uebersicht
Der Renditeauswirkungs-Rechner uebersetzt Hebesatz-Aenderungen in eine einfache Euro-Auswirkung. Nutzer koennen eine Gemeinde auswaehlen, einen Grundsteuer-Messbetrag eingeben und sehen die neue Jahresgrundsteuer, den Vorjahresvergleich und den monatlichen Cashflow-Effekt.

## Zielgruppe
- Immobilieninvestoren
- Bestandshalter
- Steuerberater und Hausverwaltungen im ersten Beratungsgespraech

## MVP-Scope
- Geschuetzte Seite `/rechner`.
- Gemeindeauswahl aus der bestehenden Hebesatz-Datenbank.
- Eingabe fuer Messbetrag und Jahresnettomiete.
- Berechnung: Messbetrag x Hebesatz B / 100.
- Vergleich aktueller Hebesatz B gegen Vorjahr B.
- Anzeige von Jahresdifferenz, Monatsdifferenz und Anteil an Jahresnettomiete.

## Non-Goals
- Keine rechtliche oder steuerliche Beratung.
- Keine vollstaendige Grundsteuerbescheid-Pruefung.
- Keine Objektverwaltung.
- Keine Speicherung der Berechnung.

## Acceptance Criteria
- [x] `/rechner` ist als geschuetzte Seite vorhanden.
- [x] Nutzer koennen eine Gemeinde auswaehlen.
- [x] Nutzer koennen Messbetrag und Jahresnettomiete eingeben.
- [x] Die App berechnet aktuelle Grundsteuer, bisherige Grundsteuer und Differenz.
- [x] Die App zeigt Jahres- und Monatsauswirkung.
- [x] Navigation enthaelt einen Rechner-Link.
- [x] Live-Test im Browser bestanden.

## Implementation Notes
**Date:** 2026-05-20

**Was wurde gebaut**
- Neue Seite `/rechner`.
- Neue Client-Komponente `TaxImpactCalculator`.
- Rechner-Link in der Hauptnavigation.
- Schutz der Rechnerseite ueber `proxy.ts`.
- Startseite verweist auf den Rechner als naechsten Produktwert.

## QA Test Results
**Build Check:** 2026-05-20

- [x] `npm.cmd run build` erfolgreich.
- [x] Next.js erkennt `/rechner` als Seite.
- [x] Rechnerseite ist in Navigation und Proxy-Schutz verdrahtet.

**Offen vor Abschluss**
- [x] Live-Test im Browser mit Login.
- [x] Beispielrechnung mit einer vorhandenen Gemeinde pruefen.

## Deployment

**Live-Test:** 2026-05-20

Getesteter Ablauf:
1. `/rechner` nach Login geoeffnet.
2. Gemeinde Aachen geladen.
3. Messbetrag von 100 auf 200 geaendert.
4. Jahresnettomiete von 20.000 auf 24.000 geaendert.
5. Aktuelle Grundsteuer und Cashflow-Anteil haben sich sichtbar aktualisiert.

**Ergebnis:** Bestanden.
