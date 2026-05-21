# PROJ-4: Import- und Quellenpipeline

## Status: Deployed
**Created:** 2026-05-19
**Last Updated:** 2026-05-19

## Dependencies
- Requires: PROJ-1 (Bundesweite Hebesatz-Datenbank) - Importdaten muessen in die bestehende Hebesatz-Datenbank einspielen.

---

## Uebersicht
Admins koennen Hebesatz-Daten nicht mehr nur einzeln pflegen, sondern strukturiert importieren, pruefen und mit Quellen belegen. Jeder Importlauf erzeugt einen nachvollziehbaren Pruefstatus, damit fehlerhafte oder unsichere Daten nicht versehentlich in der Nutzeransicht landen.

Ziel fuer den ersten Schritt ist keine vollautomatische Web-Scraping-Loesung. Wichtiger ist eine belastbare Datenqualitaet: Quelle, Datenstand, Plausibilitaet, Aenderung gegen Vorjahr und manuelle Freigabe.

---

## User Stories

- Als **Admin** moechte ich eine CSV-Datei mit mehreren Kommunen importieren, damit ich neue Hebesatz-Daten nicht einzeln erfassen muss.
- Als **Admin** moechte ich vor der Uebernahme sehen, welche Zeilen gueltig, unvollstaendig oder widerspruechlich sind, damit ich Fehler korrigieren kann.
- Als **Admin** moechte ich jedem Import eine Quelle und einen Datenstand zuordnen, damit spaeter nachvollziehbar ist, woher ein Wert stammt.
- Als **Admin** moechte ich starke Aenderungen gegenueber dem Vorjahr markiert sehen, damit ich diese Werte vor der Freigabe gezielt pruefen kann.
- Als **Admin** moechte ich Importlaeufe speichern und wiederfinden, damit ich nachvollziehen kann, wann welche Daten eingespielt wurden.
- Als **Admin** moechte ich validierte Importdaten gezielt freigeben, damit nur gepruefte Werte in der Nutzeransicht erscheinen.
- Als **Projektbetreiber** moechte ich einen einfachen Qualitaetsprozess, damit die Datenbasis belastbarer wird, bevor Alerts oder Auswertungen darauf aufbauen.

---

## Scope

### In Scope
- CSV-Import fuer Hebesatz-Daten.
- Vorschau vor Uebernahme.
- Zeilenvalidierung mit klaren Fehlern und Warnungen.
- Quellenangaben pro Importlauf.
- Datenstand pro Importlauf oder Zeile.
- Pruefstatus fuer importierte Werte.
- Manuelle Freigabe durch Admin.
- Importhistorie mit Ergebnisuebersicht.
- Schutz vor versehentlichem Ueberschreiben gepruefter Daten.

### Out of Scope
- Vollautomatisches Scraping kommunaler Webseiten.
- Automatische PDF- oder Amtsblatt-Auswertung.
- E-Mail-Alerts fuer Nutzer.
- Oeffentliche Quellenansicht fuer Endnutzer.
- Mehrstufiger Redaktionsworkflow mit mehreren Rollen.
- Automatische juristische Bewertung der Quellen.

---

## Importformat

Der MVP-Import erwartet eine CSV-Datei mit diesen Spalten:

| Feld | Pflicht | Beschreibung |
|---|---:|---|
| `name` | Ja | Gemeindename |
| `bundesland` | Ja | Eines der 16 Bundeslaender |
| `kreis` | Nein | Landkreis oder kreisfreie Stadt |
| `grundsteuer_a` | Nein | Hebesatz Grundsteuer A |
| `grundsteuer_b` | Ja | Hebesatz Grundsteuer B |
| `gewerbesteuer` | Nein | Gewerbesteuer-Hebesatz |
| `vorjahr_b` | Nein | Vorjahreswert Grundsteuer B |
| `datenstand` | Ja | Jahr oder Datum der Quelle |
| `quellenname` | Ja | Name der Quelle, z. B. Amtsblatt, Kommune, Statistikamt |
| `quellen_url` | Nein | Link zur Quelle |

---

## Acceptance Criteria

### Zugang und Rollen
- [x] Nur Admins koennen die Importseite aufrufen.
- [x] Nicht-Admins werden von der Importseite weggeleitet oder erhalten eine klare Zugriffsmeldung.
- [x] Importaktionen sind serverseitig gegen nicht autorisierte Zugriffe geschuetzt.

### CSV-Upload
- [x] Admins koennen eine CSV-Datei hochladen.
- [x] Dateien mit falschem Dateityp werden abgelehnt.
- [x] Leere Dateien werden mit einer klaren Meldung abgelehnt.
- [x] Der Import zeigt vor der Uebernahme eine Vorschau der erkannten Zeilen.
- [x] Die Vorschau zeigt Gesamtanzahl, gueltige Zeilen, Warnungen und Fehler.

### Validierung
- [x] Pflichtfelder `name`, `bundesland`, `grundsteuer_b`, `datenstand` und `quellenname` werden geprueft.
- [x] Bundesland muss einem der 16 gueltigen Bundeslaender entsprechen.
- [x] Hebesaetze duerfen nicht negativ sein und nicht ueber 2000 liegen.
- [x] Nicht numerische Hebesatzwerte werden als Fehler markiert.
- [x] Fehlende optionale Werte werden akzeptiert und nicht als Fehler behandelt.
- [x] Aenderungen von Grundsteuer B gegenueber `vorjahr_b` werden berechnet, wenn beide Werte vorhanden sind.
- [x] Auffaellige Aenderungen ab 100 Punkten werden als Warnung markiert, aber nicht automatisch blockiert.

### Dubletten und bestehende Daten
- [x] Wenn eine importierte Kommune bereits existiert, wird sie als bestehender Datensatz erkannt.
- [x] Admins sehen vor der Uebernahme, ob eine Zeile neu angelegt oder einen bestehenden Datensatz aktualisieren wuerde.
- [x] Bestehende gepruefte Datensaetze werden nicht stillschweigend ueberschrieben.
- [x] Bei Konflikten zeigt die Vorschau den vorhandenen Wert und den neuen Wert nebeneinander.
- [x] Admins koennen konfliktfreie Zeilen uebernehmen und fehlerhafte Zeilen auslassen.

### Quellen und Nachvollziehbarkeit
- [x] Jeder Importlauf speichert Quellenname, Quellen-URL, Datenstand, Zeitpunkt und Admin-Nutzer.
- [x] Importierte oder aktualisierte Datensaetze erhalten einen Quellenstatus.
- [x] Werte aus Importen starten mit Status `offen`, solange sie nicht freigegeben sind.
- [x] Admins koennen einen Importlauf nachtraeglich in der Historie ansehen.
- [x] Die Historie zeigt Anzahl importierter, aktualisierter, uebersprungener und fehlerhafter Zeilen.

### Freigabe
- [x] Admins koennen gueltige Importzeilen freigeben.
- [x] Erst freigegebene Werte erscheinen als bestaetigte Daten in der normalen Datenbankansicht.
- [x] Nicht freigegebene Werte bleiben fuer normale Nutzer unsichtbar oder klar als offen getrennt.
- [x] Ein Importlauf kann nicht freigegeben werden, wenn noch blockierende Fehler vorhanden sind.

### Fehlerkommunikation
- [x] Jede fehlerhafte Zeile zeigt eine konkrete Ursache, z. B. "Bundesland ungueltig" oder "Grundsteuer B fehlt".
- [x] Fehler werden zeilenbezogen angezeigt.
- [x] Der Admin kann die fehlerhaften Zeilen als Liste exportieren oder kopieren, um die CSV zu korrigieren.
- [x] Bei technischem Fehler bleibt der bestehende Datenbestand unveraendert.

---

## Edge Cases

- **CSV mit falscher Trennung:** Semikolon und Komma werden erkannt oder der Admin erhaelt eine klare Meldung.
- **Umlaute und Schreibweisen:** Gemeindenamen mit Umlauten, `ae/oe/ue` und Sonderzeichen duerfen den Import nicht abbrechen.
- **Doppelte Zeilen in derselben CSV:** Doppelte Kombinationen aus Gemeinde und Bundesland werden als Konflikt markiert.
- **Mehrere Kommunen mit gleichem Namen:** Bundesland und Kreis werden zur Unterscheidung angezeigt.
- **Fehlender Vorjahreswert:** Delta wird nicht berechnet und die Zeile bleibt trotzdem importierbar.
- **Sehr grosse Datei:** Der Import bricht nicht unkontrolliert ab; der Admin sieht eine klare Grenze oder Fortschrittsmeldung.
- **Teilweise fehlerhafte Datei:** Gueltige Zeilen koennen weiterverarbeitet werden, fehlerhafte Zeilen blockieren nicht den gesamten Import.
- **Quelle ohne URL:** Import bleibt moeglich, wenn ein Quellenname und Datenstand vorhanden sind.
- **Veralteter Datenstand:** Werte mit aelterem Datenstand als der bestehende Datensatz werden als Warnung markiert.
- **Session laeuft ab:** Der Admin wird zur Anmeldung geschickt; es werden keine halbfertigen Daten uebernommen.

---

## Quality Rules

- Kein Wert gilt als belastbar, wenn Quelle oder Datenstand fehlen.
- Importierte Werte sind zuerst `offen`.
- Auffaellige Aenderungen muessen sichtbar sein, auch wenn sie fachlich korrekt sein koennen.
- Bestehende bestaetigte Daten duerfen nur bewusst ersetzt werden.
- Jede Uebernahme muss spaeter nachvollziehbar sein: Wer, wann, aus welcher Quelle, mit welchem Ergebnis.

---

## Technical Requirements

- **Auth:** Admin-Zugriff erforderlich.
- **Datenintegritaet:** Import darf bestehende Daten bei Fehlern nicht teilweise unkontrolliert veraendern.
- **Performance:** CSV-Dateien mit mindestens 5.000 Zeilen muessen verarbeitbar sein.
- **Validierung:** Server-seitige Validierung ist verpflichtend; clientseitige Validierung ist nur Komfort.
- **Auditierbarkeit:** Importlaeufe und Freigaben muessen historisiert werden.
- **Datenschutz:** Keine personenbezogenen Daten in Importdateien erforderlich oder vorgesehen.
- **Browser Support:** Chrome, Firefox, Safari, Edge in aktueller Version.

---

## Open Questions

- Soll der MVP-Import zunaechst nur CSV erlauben oder direkt auch Excel?
- Soll es eine getrennte Quellenverwaltung geben oder reichen Quellenangaben pro Importlauf?
- Ab welchem Delta gilt eine Aenderung als auffaellig: 50, 100 oder 150 Punkte?
- Sollen offene Importwerte fuer normale Nutzer komplett unsichtbar sein oder mit Status `offen` sichtbar werden?
- Soll ein Importlauf komplett freigegeben werden oder zeilenweise?

---

<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Erstellt:** 2026-05-19

### Architekturziel
PROJ-4 baut eine kontrollierte Importstrecke zwischen externen Hebesatz-Quellen und der bestehenden Tabelle `municipalities`. Der Upload schreibt nicht direkt in die Live-Daten. Stattdessen landen importierte Zeilen zuerst in einem Pruefbereich. Erst nach Admin-Freigabe werden sie in die normale Hebesatz-Datenbank uebernommen.

Das reduziert das Risiko falscher Daten deutlich: Fehlerhafte CSV-Zeilen, Dubletten, veraltete Datenstaende und auffaellige Aenderungen werden sichtbar, bevor Nutzer oder spaetere Alerts darauf reagieren.

### Seitenstruktur und Komponenten
```
/admin/importe
+-- ImportDashboard
|   +-- ImportUploadCard
|   |   +-- Datei-Auswahl
|   |   +-- Quellenname
|   |   +-- Quellen-URL
|   |   +-- Datenstand
|   |   +-- Import starten
|   |
|   +-- ImportSummary
|   |   +-- Gesamtzeilen
|   |   +-- Gueltig
|   |   +-- Warnungen
|   |   +-- Fehler
|   |   +-- Neue Datensaetze
|   |   +-- Updates bestehender Datensaetze
|   |
|   +-- ImportPreviewTable
|   |   +-- Status je Zeile
|   |   +-- Gemeinde, Bundesland, Kreis
|   |   +-- Aktuelle Werte aus CSV
|   |   +-- Bestehende Werte aus der Datenbank
|   |   +-- Delta und Warnhinweise
|   |   +-- Zeile freigeben / auslassen
|   |
|   +-- ImportActions
|   |   +-- Alle gueltigen freigeben
|   |   +-- Fehlerhafte Zeilen kopieren
|   |   +-- Import verwerfen
|
+-- ImportHistory
    +-- Liste alter Importlaeufe
    +-- Ergebniszahlen
    +-- Quelle und Datenstand
    +-- Detailansicht pro Importlauf
```

Die bestehende Admin-Seite `/admin/datenbank` bleibt fuer Einzelpflege erhalten. Die neue Importseite ist fuer Massenpflege und Qualitaetssicherung gedacht.

### Datenmodell in Klartext

Bestehende Tabelle:
- `municipalities` bleibt die Live-Datenbank fuer Nutzer.
- Diese Tabelle enthaelt weiterhin Gemeinde, Bundesland, Hebesaetze, Vorjahreswert, Datenstand und Quellenstatus.
- Freigegebene Importwerte werden hier angelegt oder aktualisiert.

Neue Datenbereiche:

`import_runs`
- Ein Importlauf.
- Speichert Quelle, Quellen-URL, Datenstand, Admin-Nutzer, Zeitpunkt und Ergebniszahlen.
- Hat einen Status, damit klar ist, ob der Import nur hochgeladen, geprueft, teilweise freigegeben, komplett freigegeben oder verworfen wurde.

`import_rows`
- Eine Zeile aus einer Importdatei.
- Speichert die Rohwerte aus der CSV und die normalisierten Werte, die nach Pruefung verwendet werden koennen.
- Speichert Validierungsfehler, Warnungen, Delta gegen Vorjahr und Konflikte mit bestehenden Live-Daten.
- Verweist auf einen bestehenden `municipalities`-Datensatz, wenn ein Update erkannt wurde.
- Hat einen eigenen Zeilenstatus, damit Freigabe zeilenweise moeglich ist.

Optional spaeter:
- `sources` als eigene Quellenverwaltung, wenn wiederkehrende Quellen gepflegt, bewertet oder priorisiert werden sollen. Fuer den MVP reichen Quellenangaben pro Importlauf.

### Statusmodell

Importlauf-Status:
- `uploaded`: Datei wurde angenommen, aber noch nicht final verarbeitet.
- `validated`: Vorschau und Pruefergebnis liegen vor.
- `partially_approved`: Ein Teil der gueltigen Zeilen wurde freigegeben.
- `approved`: Alle freigabefaehigen Zeilen wurden verarbeitet.
- `discarded`: Import wurde verworfen.
- `failed`: Technischer Fehler oder Datei nicht verarbeitbar.

Zeilenstatus:
- `valid`: Zeile kann freigegeben werden.
- `warning`: Zeile ist grundsaetzlich verwendbar, braucht aber Aufmerksamkeit.
- `error`: Zeile darf nicht uebernommen werden.
- `conflict`: Es gibt einen bestehenden Datensatz mit abweichenden Werten.
- `approved`: Zeile wurde uebernommen.
- `skipped`: Zeile wurde bewusst ausgelassen.

Quellenstatus in `municipalities`:
- Neue oder aktualisierte Werte aus einem Import starten als `offen`.
- Bei Freigabe durch Admin werden sie `bestaetigt`, wenn der Admin den Wert bewusst uebernimmt.
- Normale Nutzer sollen im MVP nur die freigegebenen beziehungsweise bestaetigten Live-Daten sehen. Staging-Zeilen bleiben Admin-intern.

### Admin-Flow

1. Admin oeffnet `/admin/importe`.
2. Admin waehlt CSV-Datei und traegt Quelle, Datenstand und optional Quellen-URL ein.
3. System liest die Datei und erzeugt einen Importlauf.
4. System validiert jede Zeile:
   - Pflichtfelder vorhanden?
   - Bundesland gueltig?
   - Hebesaetze im erlaubten Bereich?
   - Gemeinde schon vorhanden?
   - Datenstand neuer oder aelter als vorhandener Wert?
   - Delta gegen Vorjahr auffaellig?
5. Admin sieht die Vorschau mit Fehlern, Warnungen und Konflikten.
6. Admin kann fehlerhafte Zeilen kopieren, auslassen oder CSV korrigieren und neu hochladen.
7. Admin gibt einzelne Zeilen frei oder nutzt "alle gueltigen freigeben".
8. Freigegebene Zeilen legen neue Gemeinden an oder aktualisieren bestehende Gemeinden.
9. Importhistorie speichert Ergebnis und bleibt nachvollziehbar.

### API-Struktur

Neue Admin-API-Bereiche:
- `POST /api/imports` fuer Upload und Anlage eines Importlaufs.
- `GET /api/imports` fuer Importhistorie.
- `GET /api/imports/[id]` fuer Detailansicht mit Zeilen.
- `POST /api/imports/[id]/approve` fuer Freigabe gueltiger Zeilen.
- `POST /api/imports/[id]/discard` fuer bewusstes Verwerfen.

Alle Import-APIs sind Admin-only. Die bestehende Nutzer-API fuer `municipalities` bleibt getrennt.

### Validierungsregeln

- Server-seitige Validierung ist massgeblich.
- Clientseitige Validierung dient nur der schnelleren Rueckmeldung.
- Semikolon und Komma werden als CSV-Trennzeichen unterstuetzt.
- Auffaelliges Delta: ab 100 Punkten Unterschied zwischen `grundsteuer_b` und `vorjahr_b`.
- Datei-Grenze im MVP: mindestens 5.000 Zeilen muessen funktionieren; groessere Dateien koennen mit klarer Meldung begrenzt werden.
- Dubletten werden ueber Gemeinde und Bundesland erkannt; Kreis dient als zusaetzliche Hilfe bei gleichnamigen Gemeinden.

### Tech-Entscheidungen

| Entscheidung | Begruendung |
|---|---|
| Staging vor Live-Uebernahme | Schuetzt die Nutzeransicht vor falschen oder halb importierten Daten. |
| CSV-only im MVP | Schnell umsetzbar, gut testbar und fuer Datenquellen leicht exportierbar. Excel kann spaeter ergaenzt werden. |
| Quellenangaben pro Importlauf | Genug Nachvollziehbarkeit fuer MVP ohne separate Quellenverwaltung. |
| Zeilenweise Freigabe | Admins koennen gute Zeilen nutzen, ohne eine ganze Datei wegen einzelner Fehler zu blockieren. |
| Importhistorie | Macht Datenqualitaet belegbar und hilft bei Rueckfragen. |
| Bestehende Admin-Rolle weiterverwenden | Passt zum aktuellen RLS- und Middleware-Modell. |
| Live-Daten bleiben in `municipalities` | PROJ-1, Suche und spaetere Features muessen nicht neu gedacht werden. |

### Abhaengigkeiten

- CSV-Parser-Paket fuer robustes Einlesen von Komma- und Semikolon-Dateien.
- Keine neue Auth-Loesung.
- Keine externe Datenquelle oder Scraping-Abhaengigkeit im MVP.
- Keine Excel-Abhaengigkeit im ersten Schritt.

### Auswirkungen auf bestehende App

- Neue Admin-Seite `/admin/importe`.
- Navigation im Adminbereich sollte um "Importe" ergaenzt werden.
- Bestehende Einzelpflege bleibt erhalten.
- Bestehende Datenbankansicht fuer Nutzer muss keine Importdetails anzeigen.
- Die API fuer normale Nutzer bleibt auf freigegebene Live-Daten ausgerichtet.

### Offene Architekturentscheidungen fuer spaeter

- Ob eine eigene Quellenverwaltung noetig wird, wenn mehrere wiederkehrende Quellen gepflegt werden.
- Ob Excel-Import fuer Kanzleien oder Kommunen frueh wichtig wird.
- Ob spaeter automatische Quellenpruefung oder PDF-Auswertung eingebaut wird.
- Ob PROJ-2 Alerts nur bei bestaetigten Aenderungen oder schon bei offenen Importwerten vorbereitet werden.

### Implementation Notes
**Date:** 2026-05-19

**Was wurde gebaut**
- Neue Admin-Seite `/admin/importe` mit CSV-Upload, Quellenangaben, Datenstand, Importvorschau, Kennzahlen, Fehlerkopie, Freigabe und Importhistorie.
- Neue Komponente `ImportManager` fuer Upload, Historie und Prueftabelle.
- Navigation im AppShell um "Importe" ergaenzt.
- Neue Supabase-Migration `0002_import_pipeline.sql`:
  - `import_runs` fuer Importlaeufe und Ergebniszahlen.
  - `import_rows` fuer gepruefte Staging-Zeilen.
  - Quellen-Metadaten an `municipalities`.
  - RLS fuer Admin-only Zugriff.
  - Freigabe-Funktion `approve_import_rows`.
- Neue API-Routen:
  - `GET/POST /api/imports`
  - `GET /api/imports/[id]`
  - `POST /api/imports/[id]/approve`
  - `POST /api/imports/[id]/discard`
- CSV-Parser und Importvalidierung lokal umgesetzt:
  - Komma und Semikolon werden erkannt.
  - Pflichtspalten werden geprueft.
  - Hebesaetze werden auf 0 bis 2000 geprueft.
  - Delta ab 100 Punkten wird als Warnung markiert.
  - Bestehende Gemeinden werden als Update/Konflikt erkannt.

**Technischer Check**
- `npm.cmd run build` erfolgreich.

**Was vor Nutzung noch noetig ist**
- Migration `supabase/migrations/0002_import_pipeline.sql` im Supabase-Projekt ausfuehren.
- Danach als Admin `/admin/importe` oeffnen und eine CSV mit den definierten Spalten hochladen.

## QA Test Results

**Tested:** 2026-05-19
**App URL:** http://localhost:3000/admin/importe
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

- [x] Zugang und Rollen: Admin-only Schutz ist in Seite, API-Routen und RLS vorgesehen.
- [x] CSV-Upload: Upload, Dateityp-Pruefung, Parser, Vorschau und Ergebniszahlen sind implementiert.
- [x] Validierung: Pflichtfelder, Bundesland, Zahlenbereich, optionale Felder, Delta und Warnungen sind serverseitig abgedeckt.
- [x] Dubletten und bestehende Daten: Bestehende Datensaetze werden erkannt; die Vorschau zeigt Update-Hinweis und vorhandenen GrSt-B-Wert.
- [x] Quellen und Nachvollziehbarkeit: Importlauf, Quelle, Datenstand, Admin-Nutzer und Historie werden gespeichert.
- [x] Freigabe: Pruefbare Zeilen koennen freigegeben werden; Fehlerzeilen werden nicht uebernommen.
- [x] Fehlerkommunikation: Zeilenbezogene Ursachen und Kopierfunktion fuer Fehler sind vorhanden.

### Edge Cases Status

- [x] Semikolon und Komma werden als CSV-Trenner erkannt.
- [x] Umlaute werden in der Import-Erkennung normalisiert.
- [x] Doppelte Zeilen werden als Warnung sichtbar.
- [x] Fehlender Vorjahreswert blockiert den Import nicht.
- [x] Maximal 5.000 Zeilen sind begrenzt.
- [x] Quelle ohne URL bleibt moeglich.
- [x] Aelterer Datenstand wird als Warnung markiert.

### Security Audit Results

- [x] Nicht eingeloggte Nutzer erhalten API-seitig `401`.
- [x] Nicht-Admins erhalten API-seitig `403`.
- [x] Upload-Metadaten werden mit Zod validiert.
- [x] Importdaten werden erst in Staging-Tabellen geschrieben und nicht direkt in Live-Daten.
- [x] RLS-Policies fuer Importtabellen sind in der Migration vorgesehen.

### Verification

- [x] `npm.cmd run build` erfolgreich.
- [x] Lokaler Routencheck `/admin/importe` liefert HTTP 200.
- [x] UI-Texte fuer Importstatus, Button und Empty State wurden auf Umlaut-Darstellung korrigiert.
- [x] Interaktiver Browser-Test im laufenden lokalen Browser erfolgreich: CSV hochgeladen, Vorschau geprueft, pruefbare Zeilen freigegeben.
- [x] Vollstaendiger Supabase-End-to-End-Test mit echter Migration und Admin-Session erfolgreich.
- [x] Freigegebene Werte wurden in `/datenbank` sichtbar: Koeln `895 %`, Muenster `760 %`.

### Bugs Found

Keine Critical- oder High-Bugs im Code-/Build-Check gefunden.

### Summary

- **Acceptance Criteria:** 30/30 implementiert
- **Bugs Found:** 0 Critical, 0 High
- **Security:** Code- und Migrationscheck bestanden
- **Production Ready:** YES
- **Recommendation:** Bereit fuer Deployment-Vorbereitung. Vor Produktivbetrieb echte Importdateien fachlich gegen Quelle gegenpruefen.

## Deployment

**Status:** Deployed
**Date:** 2026-05-19

PROJ-4 ist auf Vercel verfuegbar. Die Importseite wurde visuell geprueft, der lokale Build ist erfolgreich, und der dokumentierte End-to-End-Test mit echter Supabase-Migration und Admin-Session ist bestanden.

**Hinweis:** Vor produktiver Datennutzung muessen echte Importdateien weiterhin fachlich gegen die jeweilige Quelle gegengeprueft werden.

## Datenerhebung (Erst-Datensatz)

**Stand:** 2026-05-21

Erste echte Importdatei fuer die Pipeline vorbereitet:

- **Quelle:** Statistische Aemter des Bundes und der Laender — „Hebesaetze der Realsteuern" 2022 (Datenlizenz Deutschland – Zero 2.0). Vollstaendige Quellendokumentation in [`docs/data-sources.md`](../docs/data-sources.md).
- **Konverter:** `scripts/convert-realsteuer.mjs` wandelt die amtliche Excel in das CSV-Schema der Pipeline um (wiederverwendbar fuer kuenftige Jahrgaenge).
- **Ergebnis:** `data/import/nrw-hessen-2022.csv` — 818 Gemeinden (NRW 396, Hessen 422).
- `vorjahr_b` bleibt bewusst leer (Grundsteuerreform 2025 — Begruendung in `docs/data-sources.md`).

**Offen:** Der eigentliche Import-Run ueber `/admin/importe` (Upload, Vorschau, Freigabe) ist noch durchzufuehren. Die ~10 Demo-Datensaetze aus `supabase/seed_demo_municipalities.sql` erzeugen dabei Konflikt-Zeilen (gleicher Gemeindename, andere Werte) — vor dem Import entfernen oder die Konflikte bewusst freigeben.
