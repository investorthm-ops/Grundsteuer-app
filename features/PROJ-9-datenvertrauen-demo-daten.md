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
- [x] NRW/Hessen-Demo-Datensatz ist stichprobenartig gegen Originalquelle geprüft.
- [ ] Mindestens 20 verkaufsrelevante Kommunen sind als geprüft markiert. Stand: 10/20.

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
- Die Status-Spalte der Datenbankansicht hat einen Tooltip, der `bestätigt` und `offen` erklärt.

**Offen für Datenpolitur**
- Stichproben gegen Original-Excel und aktuelle kommunale Quellen dokumentieren.
- Top-Kommunen für NRW/Hessen prüfen und markieren.
- Bei nächsten Importen Quellenstatus nur nach Prüfung auf `bestaetigt` setzen.

## Pilotkommunen-Prüfung
**Stand:** 2026-05-22

| Kommune | Ergebnis |
|---------|----------|
| Dreieich | 2022-Werte historisch korrekt, aber für aktuellen Stand veraltet. 2026: A 900 / B 900 / GewSt 380 laut Hebesatzsatzung. |
| Frankfurt am Main | 2022-Werte historisch korrekt, aber für aktuellen Stand veraltet. 2025/2026: A 317,62 / B 854,69 / GewSt 460. |
| Wiesbaden | 2022-Werte historisch korrekt, aber für aktuellen Stand veraltet. 2026 laut städtischer Haushaltssatzung: A 341,01 / B 690,06 / GewSt 460. Quellenkonflikt: IHK-Übersicht nennt GewSt 395. |
| Kassel | 2022-Werte historisch korrekt. 2025/2026: A 345 / B 490 / GewSt 440; damit ist nur Grundsteuer A gegenüber der App-Zeile veraltet. |
| Darmstadt | 2022-Werte historisch korrekt, aber für aktuellen Stand veraltet. 2025/2026: A 693 / B 1.181 / GewSt 459. |
| Offenbach am Main | 2022-Werte historisch korrekt. 2025: aufkommensneutrale Grundsteuer B 1.230 (vorher 895), GewSt 440 unverändert. Grundsteuer A 2025 nicht öffentlich beziffert. |
| Hanau | 2022-Werte historisch korrekt (Stand seit 2017). 2025-Reform: A 175 / B 645. GewSt 430, ab 2026 458. |
| Gießen | 2022-Werte historisch korrekt. 2025: A 259 / B 626. GewSt 2025 nicht separat bestätigt (2022: 420). |
| Marburg | 2022-Werte historisch korrekt. 2025: A 210 / B 450 / GewSt 380; 2026: B 490 / GewSt 420. |
| Fulda | 2022-Werte historisch korrekt. 2025: A 144 / B 313 (aufkommensneutral, leicht reduziert), GewSt 380 unverändert. |
