# PROJ-9: Datenvertrauen und Demo-Daten

## Status: In Progress
**Created:** 2026-05-22
**Last Updated:** 2026-05-22

## Übersicht
Dieses Feature macht die Datenbasis verkaufsfähiger. Nutzer sollen direkt erkennen, woher ein Hebesatz stammt, welchen Datenstand er hat, wann der Datensatz in der App aktualisiert wurde und ob die Quelle bestätigt ist.

## Zielgruppe
- Steuerberater und Kanzleien, die belastbare Werte für Mandantengespräche brauchen.
- Immobilienbestandshalter und Investoren, die Standortdaten vergleichen.
- Projektbetreiber/Admin, der Demo-Daten pflegt und gegenüber Pilotkunden erklären muss.

## MVP-Scope
- Quellenname und Quellen-URL sind in Admin-Pflege, Datenbankansicht, Vergleich, SEO-Stadtseiten und Export sichtbar.
- Datenstand und letztes App-Update werden pro Kommune angezeigt.
- CSV-Export enthält Quellenhinweis und Aktualisierungsdatum.
- Datenquellen-Dokumentation enthält Status, Grenzen und konkrete Qualitätsregeln für Pilotdaten.
- Demo-Datensatz wird als Pilotdatenbasis klar eingeordnet.

## Non-Goals
- Keine automatische Live-Prüfung amtlicher Quellen.
- Keine flächendeckende Garantie für 2025er Reformdaten.
- Keine rechtliche oder steuerliche Beratung.
- Keine vollständige Data-Governance-Plattform.

## User Stories
- Als Steuerberater möchte ich die Quelle eines Hebesatzes sehen, damit ich den Wert im Mandantengespräch einordnen kann.
- Als Investor möchte ich den Datenstand je Kommune sehen, damit ich alte und neue Werte nicht verwechsle.
- Als Admin möchte ich Quellenangaben manuell pflegen, damit Demo-Daten sauber erklärbar sind.
- Als Nutzer möchte ich beim Export die Quellenangaben behalten, damit ich die Auswertung weitergeben kann.
- Als Betreiber möchte ich die Grenzen der Datenbasis dokumentieren, damit Pilotkunden realistische Erwartungen haben.

## Acceptance Criteria
- [x] Admin kann Quellenname und Quellen-URL pro Kommune pflegen.
- [x] Datenbankansicht zeigt Datenstand, App-Aktualisierung und Quelle.
- [x] Vergleichsansicht zeigt Datenstand und Quelle.
- [x] Stadtseiten zeigen Datenstand, App-Aktualisierung und Quelle.
- [x] CSV-Export enthält Datenstand, App-Aktualisierung, Quellenstatus, Quellenname, Quellen-URL und Hinweis.
- [x] Datenquellen-Dokumentation beschreibt Pilotdaten, Qualitätsstatus und nächste Prüfschritte.
- [ ] NRW/Hessen-Demo-Datensatz ist stichprobenartig gegen Originalquelle geprüft.
- [ ] Mindestens 20 verkaufsrelevante Kommunen sind als geprüft markiert.

## Edge Cases
- Quelle ist bekannt, aber keine URL vorhanden.
- Datenstand ist vorhanden, aber Quelle fehlt.
- Quelle ist offen und darf nicht als bestätigt erscheinen.
- Export wird außerhalb der App weitergegeben.
- Datensatz wurde in der App aktualisiert, aber stammt fachlich aus einem älteren Berichtsjahr.

## Implementation Notes
**Date:** 2026-05-22

**Was wurde gebaut**
- Quellenfelder in der manuellen Admin-Pflege ergänzt.
- Datenbanktabelle zeigt jetzt Datenstand, App-Aktualisierung und Quelle.
- Vergleich und Rangliste zeigen Quellenkontext.
- Stadtseiten zeigen Quelle und Hinweis auf amtliche Veröffentlichungen.
- CSV-Export enthält zusätzliche Vertrauensspalten und einen kurzen Nutzungshinweis.
- Datenquellen-Dokumentation wurde auf Verkaufsreife und Pilotdatenqualität erweitert.

**Offen für Datenpolitur**
- Stichproben gegen Original-Excel dokumentieren.
- Top-Kommunen für NRW/Hessen prüfen und markieren.
- Bei nächsten Importen Quellenstatus nur nach Prüfung auf `bestaetigt` setzen.
