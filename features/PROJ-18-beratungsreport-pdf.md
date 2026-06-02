# PROJ-18: Beratungsreport als PDF (Kanzlei-Mehrwert)

## Status: Planned
**Created:** 2026-06-02
**Last Updated:** 2026-06-02

## Übersicht
Eingeloggte Nutzer wählen in der Vergleichsansicht (`/vergleich`) bis zu fünf Kommunen aus und erzeugen daraus einen druckfertigen, gebrandeten PDF-Beratungsreport für das Mandantengespräch. Der Report bündelt die bestehende Vergleichstabelle in einem präsentablen Dokument, das ein Steuerberater oder Berater direkt an Mandanten weitergeben kann.

In dieser ersten Ausbaustufe wird ausschließlich PDF erzeugt. Eine Excel-kompatible CSV liefert bereits PROJ-5; die hier geschlossene Lücke ist das präsentable, formatierte PDF. Native `.xlsx` ist als spätere Stufe vorgesehen, aber nicht Teil dieses Features.

**Tarif-Einordnung (Abo-Neuordnung 2026-06-02):** Der PDF-Report ist im Zielbild ein klares **Kanzlei**-Merkmal (neben Renditerechner und unbegrenzter Watchlist). Technisch ist er in dieser Stufe für alle eingeloggten Nutzer mit gültigem Zugang verfügbar; die Beschränkung auf den Kanzlei-Tarif folgt mit PROJ-15 (Stripe). Siehe Memory `project_tarif_gating` und PROJ-16.

## Dependencies
- Requires: PROJ-1 (Bundesweite Hebesatz-Datenbank) — liefert die Kommunendaten für den Report.
- Requires: PROJ-7 (Vergleich und Benchmarking) — der Report wird aus der dortigen Kommunen-Auswahl erzeugt und nutzt dieselbe Vergleichslogik (Durchschnitt, Min/Max).
- Requires: PROJ-8 (Mandantenfähige Nutzerverwaltung) — Report ist nur für eingeloggte Nutzer.
- Builds on: PROJ-5 (CSV/Excel-Export) — übernimmt das Auth-/Validierungs-Muster der Export-API und den Haftungshinweis (`DATA_NOTICE`).
- Related: PROJ-16 (Preisseite) — macht den „Kanzlei"-Tarif funktional konkret.

## User Stories
- Als Steuerberater möchte ich einen ausgewählten Kommunen-Vergleich als PDF herunterladen, damit ich ihn ohne Nachbearbeitung in ein Mandantengespräch mitnehmen kann.
- Als Berater möchte ich dem Report einen eigenen Titel oder Mandantenbezug geben, damit das Dokument zum jeweiligen Gespräch passt.
- Als Kanzlei-Nutzer möchte ich im PDF Datenstand und Quellenstatus je Kommune sehen, damit die Werte gegenüber dem Mandanten nachvollziehbar bleiben.
- Als Berater möchte ich im PDF einen klaren Haftungshinweis sehen, damit erkennbar ist, dass es sich um Recherchedaten und keine amtliche Auskunft handelt.
- Als Immobilieninvestor möchte ich denselben PDF-Report für eigene Standortvergleiche nutzen, damit ich Entscheidungsunterlagen erzeuge.
- Als Projektbetreiber möchte ich den Report auf eingeloggte Nutzer begrenzen, damit die Datenbasis nicht unkontrolliert offen heruntergeladen wird.

## Acceptance Criteria

### Zugang
- [ ] Nur eingeloggte Nutzer können einen PDF-Report erzeugen.
- [ ] Nicht eingeloggte Anfragen an die Report-API erhalten `401`.
- [ ] In dieser Stufe ist der Report für alle eingeloggten Nutzer verfügbar (kein Tarif-Gating).

### Erzeugung und Inhalt
- [ ] Der Report wird aus der aktuell ausgewählten Kommunen-Liste der Vergleichsansicht erzeugt (2 bis 5 Kommunen).
- [ ] Das PDF enthält eine Vergleichstabelle mit Grundsteuer A, Grundsteuer B, B Wohnen, B Nichtwohnen und Gewerbesteuer je Kommune.
- [ ] Das PDF enthält eine Durchschnittszeile über die ausgewählten Kommunen je Steuerart.
- [ ] Pro Steuerart wird der niedrigste Wert grün und der höchste Wert rot hervorgehoben (gleiche Semantik wie in der Vergleichsansicht).
- [ ] Pro Kommune werden Datenstand sowie Quellenname und Quellenstatus (bestätigt/offen) ausgegeben.
- [ ] Das PDF enthält das Erstelldatum.
- [ ] Ein optionaler frei eingegebener Titel-/Mandantentext wird im Kopf des Reports angezeigt, wenn gesetzt.
- [ ] Die Fußzeile enthält den Haftungshinweis (Recherchedaten, keine amtliche Auskunft) deckungsgleich mit CSV-Export und Site-Disclaimer.
- [ ] Zahlen werden im deutschen Format (Dezimalkomma) dargestellt, Umlaute (ä/ö/ü) werden korrekt gerendert.

### Nutzerführung
- [ ] Der Button „Als PDF-Report" ist in der Vergleichsansicht erreichbar und erscheint erst, wenn mindestens zwei Kommunen ausgewählt sind.
- [ ] Während der Erzeugung erhält der Nutzer einen Lade-/Fortschrittshinweis.
- [ ] Bei einem Fehler erhält der Nutzer eine klar verständliche Meldung.
- [ ] Der Dateiname des PDF enthält ein Datum.

## Edge Cases
- **Weniger als 2 Kommunen:** Button ist nicht auslösbar; API antwortet bei <2 IDs mit `400`.
- **Mehr als 5 Kommunen:** API antwortet mit `400` (entspricht der Auswahlgrenze der Vergleichsansicht).
- **Unbekannte/ungültige Kommunen-ID:** unbekannte IDs werden ignoriert; bleibt dadurch nur 1 gültige Kommune übrig, gilt die <2-Regel (`400`).
- **Leere optionale Werte:** fehlende Hebesätze erscheinen als leere Zelle (kein „null", kein „0").
- **Fehlender Datenstand/Quelle:** wird als „offen" bzw. leer dargestellt, nie als erfundener Wert.
- **Nicht eingeloggt:** API blockiert mit `401`.
- **Manipulierter Request-Body:** Server validiert IDs und Titel mit Zod; ungültige Eingaben führen zu `400`.
- **Sehr langer Titeltext:** wird serverseitig auf eine Maximallänge begrenzt.

## Technical Requirements
- **Auth:** Login erforderlich, gleiche Zugriffsebene wie `/datenbank` und der CSV-Export.
- **Format:** `application/pdf` als Attachment, Dateiname mit Datum.
- **Erzeugung:** serverseitig ohne Hintergrundjob (max. 5 Kommunen, klein und schnell).
- **Validierung:** Zod-Schema für `municipalityIds` (2–5 UUIDs) und optionalen Titel.
- **Browser Support:** Chrome, Firefox, Safari, Edge in aktueller Version (Download im echten Browser; In-App-Browser unterstützen Downloads ggf. nicht — siehe PROJ-5).

## Out of Scope (bewusst spätere Stufen)
- Native `.xlsx`-Datei als zusätzliches Format.
- Report-Erzeugung von der einzelnen Stadt-/Hebesatzseite aus.
- Tarif-/Kontingent-Gating „nur Kanzlei" (gekoppelt an PROJ-15 Stripe-Billing).
- Eigenes Kanzlei-Logo / individueller Briefkopf im PDF.

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick

PROJ-18 erweitert die bestehende Vergleichsansicht (`/vergleich`) um einen
PDF-Download-Button. Der Nutzer wählt Kommunen wie bisher — neu ist nur der
eine Button am Ende. Der eigentliche Report wird vollständig **auf dem Server**
erzeugt und als fertige PDF-Datei an den Browser geliefert.

Es wird **keine neue Seite**, **keine neue Datenbanktabelle** und **kein
Hintergrundjob** benötigt.

---

### Bausteine (was entsteht neu, was wird angepasst)

```
/vergleich  (Seite — bleibt weitgehend unverändert)
└── MunicipalityCompare  (Komponente — wird leicht erweitert)
    └── Vergleichstabelle  (sichtbar ab 2 Kommunen — bleibt)
        └── [NEU] Button „Als PDF-Report"
            ├── [NEU] Optionales Eingabefeld: Mandant / Titel
            └── Lade-Anzeige + Fehlermeldung

[NEU] Server-Schnittstelle  POST /api/reports/municipalities
    ├── Prüft Login (gleich wie CSV-Export)
    ├── Prüft Eingaben (2–5 gültige Kommunen-IDs, optionaler Titel)
    ├── Holt Kommunendaten aus der Datenbank
    └── Erzeugt PDF → liefert Datei zurück

[NEU] PDF-Dokument-Vorlage  src/lib/reports/municipality-report.tsx
    ├── Kopfbereich: Titel, optionaler Mandantentext, Erstelldatum
    ├── Vergleichstabelle: alle Steuerarten, grün/rot, Durchschnitt
    ├── Quellen-Block: Datenstand + Quellenstatus je Kommune
    └── Fußzeile: Haftungshinweis, Seitenzahl

[NEU] Gemeinsame Hilfsbausteine  src/lib/reports/
    ├── format.ts   — Zahlen- und Datumsformatierung (de-DE)
    └── aggregate.ts — Durchschnitt, Minimum, Maximum
```

**Wo werden Hilfsbausteine wiederverwendet?**
Die Logik für Zahlenformatierung und Min/Max existiert bereits — einmal im
CSV-Export (`src/app/api/exports/municipalities/route.ts`) und einmal in der
Vergleichskomponente (`src/components/compare/municipality-compare.tsx`). Sie
wird in die neuen gemeinsamen Dateien verschoben, sodass CSV-Export, Vergleich
und PDF-Report alle denselben Code nutzen. Werte und Haftungshinweis bleiben
dadurch über alle Ausgaben identisch.

---

### Datenfluss (Schritt für Schritt)

1. **Nutzer** wählt 2–5 Kommunen in `/vergleich` aus (wie bisher).
2. **Nutzer** klickt „Als PDF-Report" — optional trägt er vorher einen
   Mandanten-/Titeltext ein.
3. **Browser** schickt die IDs der ausgewählten Kommunen und den optionalen
   Titel an die neue Server-Schnittstelle.
4. **Server** prüft: Ist der Nutzer eingeloggt? Sind die Daten gültig (2–5
   IDs, Titel nicht zu lang)?
5. **Server** liest die Kommunendaten aus der Datenbank (dieselbe Tabelle wie
   die Vergleichsansicht und der CSV-Export).
6. **Server** erzeugt das PDF im Arbeitsspeicher — kein temporäres File, kein
   Hintergrundjob.
7. **Browser** empfängt das fertige PDF und startet den Download automatisch.

---

### Technische Entscheidungen (mit Begründung)

| Entscheidung | Gewählte Lösung | Warum |
|---|---|---|
| PDF-Bibliothek | `@react-pdf/renderer` | Läuft auf Vercel ohne schwere Zusatz-Software (kein Headless-Browser nötig). Umlaute (ä/ö/ü) werden korrekt dargestellt, wenn eine passende Schrift eingebettet wird. Bekanntes React-Komponenten-Modell. |
| PDF wird auf dem Server erzeugt | Ja, vollständig serverseitig | Sensitive Daten verlassen den Server nicht; der Nutzer bekommt nur das fertige Dokument. Auch auf langsamen Geräten zuverlässig. |
| Datenbank-Abfrage | Bestehende `municipalities`-Tabelle | Keine neue Tabelle, keine Migration. Die Daten liegen schon da. |
| Zahlen- & Datumsformat | Gemeinsame Hilfsbausteine | Verhindert, dass CSV-Export und PDF unterschiedliche Werte zeigen. Einmal richtig, überall konsistent. |
| Zugang | Alle eingeloggten Nutzer mit gültigem Zugang | Tarif-Unterschiede (Solo vs. Kanzlei) werden erst mit PROJ-15 (Stripe) umgesetzt. Jetzt schon sperren wäre verfrüht und aufwändiger als nötig. **Von Markus am 2026-06-02 bestätigt.** |

> **Hinweis Tarif-Gating (bewusst aufgeschoben, mit Markus abgestimmt 2026-06-02):**
> Das System kennt heute keinen Unterschied zwischen Solo und Kanzlei — eine
> Organisation hat nur Status (`trial`/`active`/`blocked`/`expired`) und eine
> Zugriffslaufzeit (`access_until`), aber **kein Tarif-Feld**. Der PDF-Report ist
> deshalb für jeden Nutzer mit gültigem Zugang verfügbar, genau wie der CSV-Export.
> Im Pilot wird der Zugang ohnehin manuell pro Freischaltung durch den Admin
> gesteuert.
>
> **Wenn PROJ-15 (Stripe) kommt:** Dann erhält die Organisation einen Tarif-/
> Plan-Wert (z. B. `plan = 'solo' | 'kanzlei'`). Erst ab dann lässt sich der
> PDF-Report in `src/app/api/reports/municipalities/route.ts` zusätzlich auf den
> Kanzlei-Tarif einschränken (Server-Check nach dem bestehenden Auth-Check).
> Bis dahin ist diese Schranke nicht vorhanden.
| POST statt GET | POST-Anfrage mit Body | Die Kommunen-IDs und der optionale Titel passen sauberer in einen Anfrage-Body als in die URL-Zeile. Entspricht dem bestehenden Muster der Admin-APIs. |

---

### Neue und geänderte Dateien

**Neu:**
- `src/app/api/reports/municipalities/route.ts` — Server-Schnittstelle für den PDF-Report
- `src/lib/validation/report.ts` — Eingabeprüfung (IDs, Titel)
- `src/lib/reports/municipality-report.tsx` — PDF-Dokumentvorlage
- `src/lib/reports/format.ts` — Zahlen- und Datumsformatierung (de-DE)
- `src/lib/reports/aggregate.ts` — Durchschnitt, Min, Max

**Angepasst:**
- `src/components/compare/municipality-compare.tsx` — PDF-Button + Lade-/Fehlerzustand hinzufügen; Hilfsbausteine aus `src/lib/reports/` importieren statt lokaler Kopien
- `src/app/api/exports/municipalities/route.ts` — Hilfsbausteine aus `src/lib/reports/` importieren (gleiche Logik, kein neues Verhalten)
- `package.json` — neue Abhängigkeit `@react-pdf/renderer`

**Keine Änderung nötig:**
- Datenbank und Supabase-Tabellen (kein neues Schema)
- Bestehende Authentifizierung (wird 1:1 wiederverwendet)
- Alle anderen Seiten und Komponenten

---

### Neue Abhängigkeit

| Paket | Zweck |
|---|---|
| `@react-pdf/renderer` | Erzeugt PDF-Dokumente direkt auf dem Server, ohne Browser-Unterbau. Einzige neue Laufzeit-Abhängigkeit. |

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
