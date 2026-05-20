# PROJ-7: Vergleich und Benchmarking

## Status: In Progress
**Created:** 2026-05-20
**Last Updated:** 2026-05-20

## Uebersicht
Die Vergleichs- und Benchmarking-Ansicht macht Hebesaetze zwischen mehreren Kommunen direkt vergleichbar. Nutzer koennen Gemeinden auswaehlen, relevante Steuerarten nebeneinander sehen und erkennen, welche Kommune im Vergleich hoeher, niedriger oder auffaellig veraendert ist.

## Zielgruppe
- Steuerberater und Kanzleien, die Mandanten mehrere Standorte erklaeren wollen.
- Immobilieninvestoren und Bestandshalter, die Standortkosten vergleichen.
- Kommunen und Verwaltung, die sich mit Nachbarkommunen oder Kreisen benchmarken.
- Gewerbetreibende, die Standortentscheidungen vorbereiten.

## MVP-Scope
- Neue geschuetzte Seite `/vergleich`.
- Auswahl von mindestens 2 und maximal 5 Kommunen aus der bestehenden Hebesatz-Datenbank.
- Vergleichstabelle fuer Grundsteuer A, Grundsteuer B und Gewerbesteuer.
- Anzeige von Bundesland, Kreis, Einwohnerzahl, aktuellem Jahr und Quellenstatus je Kommune, sofern vorhanden.
- Kennzeichnung des niedrigsten und hoechsten Werts je Steuerart.
- Einfache Benchmark-Kennzahlen: Durchschnitt, Differenz zum Durchschnitt und Rang innerhalb der ausgewaehlten Kommunen.
- Filterbarer Ranglisten-Modus fuer eine Steuerart, ein Bundesland und optional einen Kreis.
- Export-Hinweis oder Verknuepfung zum bestehenden CSV/Excel-Export, ohne neuen Export-Mechanismus.

## Non-Goals
- Keine interaktive Deutschlandkarte im ersten Schritt.
- Keine automatische Auswahl von Nachbarkommunen.
- Keine gespeicherten Vergleichs-Sets.
- Keine Mandanten- oder Teamfunktionen.
- Keine komplexe statistische Analyse ueber Zeitreihen hinaus.

## Dependencies
- Requires: PROJ-1 (Bundesweite Hebesatz-Datenbank) - Datenbasis fuer Kommunen und Hebesaetze.
- Uses: PROJ-5 (CSV/Excel-Export) - Export bleibt bestehende Funktion und wird nur verlinkt.
- Can complement: PROJ-6 (Renditeauswirkungs-Rechner) - einzelne Vergleichsergebnisse koennen spaeter in Berechnungen uebernommen werden.

## User Stories
- Als Steuerberater moechte ich mehrere Kommunen nebeneinander vergleichen, um Mandanten Standortunterschiede schnell erklaeren zu koennen.
- Als Immobilieninvestor moechte ich sehen, welche Kommune im Vergleich die hoechste Grundsteuer B hat, um Risiken fuer meine Rendite zu erkennen.
- Als Kommune moechte ich meine Hebesaetze mit anderen Kommunen im gleichen Bundesland oder Kreis vergleichen, um politische Entscheidungen einzuordnen.
- Als Gewerbetreibender moechte ich Gewerbesteuer-Hebesaetze sortieren, um guenstigere Standorte zu finden.
- Als Nutzer moechte ich die wichtigsten Unterschiede ohne Tabellenarbeit erkennen, damit ich die Ansicht in einer Demo oder Beratung direkt nutzen kann.

## Acceptance Criteria
- [ ] `/vergleich` ist als geschuetzte Seite vorhanden.
- [ ] Die Hauptnavigation enthaelt einen Link zur Vergleichsansicht.
- [ ] Nutzer koennen mindestens 2 und maximal 5 Kommunen fuer einen Direktvergleich auswaehlen.
- [ ] Die Vergleichstabelle zeigt je Kommune Grundsteuer A, Grundsteuer B und Gewerbesteuer.
- [ ] Die Tabelle zeigt je Kommune Bundesland, Kreis und aktuelles Datenjahr, sofern die Daten vorhanden sind.
- [ ] Je Steuerart werden niedrigster und hoechster Wert visuell markiert.
- [ ] Die Ansicht zeigt den Durchschnitt der ausgewaehlten Kommunen je Steuerart.
- [ ] Die Ansicht zeigt je Kommune die Differenz zum Durchschnitt je Steuerart.
- [ ] Der Ranglisten-Modus kann nach Steuerart und Bundesland gefiltert werden.
- [ ] Der Ranglisten-Modus sortiert Kommunen auf- und absteigend.
- [ ] Leere oder unvollstaendige Daten werden sichtbar gekennzeichnet und brechen die Ansicht nicht.
- [ ] Nutzer erhalten einen klaren Hinweis, wenn weniger als zwei Kommunen ausgewaehlt sind.
- [ ] Die Seite funktioniert auf Desktop und Mobile ohne ueberlappende Inhalte.

## Edge Cases
- Was passiert, wenn eine ausgewaehlte Kommune fuer eine Steuerart keinen Wert hat?
- Was passiert, wenn weniger als zwei Kommunen ausgewaehlt sind?
- Was passiert, wenn der Nutzer mehr als fuenf Kommunen auswaehlen will?
- Wie wird verglichen, wenn Kommunen unterschiedliche Datenjahre haben?
- Wie reagiert die Rangliste, wenn ein Bundesland oder Kreis keine passenden Daten liefert?
- Wie werden gleiche Hebesaetze behandelt, wenn mehrere Kommunen denselben Rang haben?
- Wie bleibt die Seite nutzbar, wenn sehr lange Kommunennamen angezeigt werden?

## Technical Requirements (optional)
- Performance: Die Vergleichsansicht soll fuer typische Nutzerabfragen ohne spuerbare Wartezeit laden.
- Security: Die Seite bleibt wie Rechner und Watchlist geschuetzt.
- Data Integrity: Es duerfen keine Hebesatzdaten veraendert werden.
- Browser Support: Aktuelle Versionen von Chrome, Edge, Firefox und Safari.

## Implementation Notes
**Date:** 2026-05-20

**Was wurde gebaut**
- Neue geschuetzte Seite `/vergleich`.
- Neue Client-Komponente `MunicipalityCompare`.
- Direktvergleich fuer bis zu 5 Kommunen.
- Vergleichstabelle mit Markierung fuer niedrigste und hoechste Werte.
- Durchschnitts- und Abweichungswerte je Steuerart.
- Ranglisten-Modus fuer Grundsteuer A, Grundsteuer B und Gewerbesteuer.
- Navigation enthaelt einen Vergleich-Link.
- Zugriffsschutz in `proxy.ts` erweitert.
- Kommunen-API um Sortierung und Kreisfilter erweitert.

**Build Check**
- [x] `npm.cmd run build` erfolgreich.
- [x] Next.js erkennt `/vergleich` als Seite.
- [x] Browserpruefung bestaetigt Login-Schutz und Redirect auf `/login?redirectTo=%2Fvergleich`.

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Entscheidung
PROJ-7 wird als geschuetzte Vergleichsseite gebaut, die auf der bestehenden Hebesatz-Datenbank aufsetzt. Es wird kein neues Kern-Datenmodell benoetigt, weil alle Vergleichswerte bereits an den Kommunen haengen. Der Schwerpunkt liegt auf einer guten Auswahl- und Tabellenansicht sowie einer einfachen Rangliste.

### Component Structure
```
Vergleich Page
+-- Page Header
|   +-- Titel und kurzer Nutzenhinweis
|   +-- Link zur Datenbank oder zum Export
+-- Direct Comparison
|   +-- Kommunen-Auswahl
|   |   +-- Suchfeld
|   |   +-- Ausgewaehlte Kommunen als Liste
|   |   +-- Entfernen-Aktion je Kommune
|   +-- Vergleichstabelle
|   |   +-- Stammdaten je Kommune
|   |   +-- Grundsteuer A
|   |   +-- Grundsteuer B
|   |   +-- Gewerbesteuer
|   |   +-- Datenstand und Quellenstatus
|   +-- Benchmark-Zeile
|       +-- Durchschnitt je Steuerart
|       +-- Hoechster Wert
|       +-- Niedrigster Wert
+-- Ranking Mode
|   +-- Steuerart-Auswahl
|   +-- Bundesland-Filter
|   +-- Kreis-Filter optional
|   +-- Sortierung aufsteigend/absteigend
|   +-- Ranglisten-Tabelle
+-- Empty and Error States
    +-- Hinweis bei zu wenigen Kommunen
    +-- Hinweis bei fehlenden Daten
    +-- Lade- und Fehleranzeige
```

### Data Model
Es werden keine neuen gespeicherten Objekte angelegt.

Die Ansicht nutzt bestehende Kommunen-Daten:
- Gemeinde-ID
- Name
- Bundesland
- Kreis
- Grundsteuer A
- Grundsteuer B
- Gewerbesteuer
- Vorjahreswert Grundsteuer B
- Datenstand
- Quellenstatus

Nur im Browser wird temporaer gespeichert:
- aktuell ausgewaehlte Kommunen fuer den Vergleich
- aktive Filter im Ranglisten-Modus
- Sortierrichtung

Diese Auswahl muss im MVP nicht dauerhaft gespeichert werden.

### Backend Need
Backend ist nur leicht betroffen.

Bestehende API:
- Die bestehende Kommunen-Liste kann fuer Suche und Auswahl weiterverwendet werden.

Erweiterung:
- Die Kommunen-API soll fuer den Ranglisten-Modus nach Steuerart, Bundesland, Kreis und Sortierung nutzbar sein.
- Die API soll fehlende Werte sauber zurueckgeben, damit die UI diese kennzeichnen kann.

Kein neues Backend:
- Keine neue Tabelle.
- Keine neue Auth-Logik.
- Keine Schreibfunktion.
- Keine neuen Rollen.

### Tech Decisions
- Bestehende Datenbasis verwenden, weil PROJ-1 bereits die zentrale Quelle ist und kein doppelter Datenbestand entstehen soll.
- Vergleich zuerst tabellarisch bauen, weil Steuerberater, Investoren und Kommunen Zahlen schnell pruefen und in Gespraechen erklaeren wollen.
- Ranglisten als eigener Modus, damit der direkte Vergleich nicht ueberladen wird.
- Maximal 5 Kommunen im Direktvergleich, damit die Ansicht auf Desktop und Mobile lesbar bleibt.
- Kartenansicht spaeter, weil sie fuer das MVP attraktiv, aber nicht notwendig fuer den Kernnutzen ist.

### Dependencies
- Keine neuen externen Pakete geplant.
- Bestehende shadcn/ui-Komponenten reichen fuer Tabellen, Eingaben, Auswahlfelder, Tabs und Buttons aus.
- Bestehende Icons aus `lucide-react` koennen fuer Suche, Sortierung, Entfernen und Export-Link genutzt werden.

### Open Product Questions
- Soll die Vergleichsseite in der Demo eher fuer Steuerberater oder Investoren formuliert werden?
- Soll die Rangliste standardmaessig Grundsteuer B zeigen, weil sie fuer Immobilien am wichtigsten ist?
- Soll der Rechner spaeter einen direkten Link aus einer Vergleichszeile erhalten?

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
