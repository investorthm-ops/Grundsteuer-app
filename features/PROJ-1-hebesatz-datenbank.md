# PROJ-1: Bundesweite Hebesatz-Datenbank

## Status: Planned
**Created:** 2026-05-04
**Last Updated:** 2026-05-04

## Dependencies
- None (Grundlage für alle weiteren Features)

---

## Übersicht
Eingeloggte Nutzer aller Pläne können kommunale Hebesätze (Grundsteuer A, Grundsteuer B, Gewerbesteuer) für ganz Deutschland in einer durchsuchbaren und filterbaren Tabelle einsehen. Vorjahreswerte werden gespeichert, um Veränderungen sichtbar zu machen. Die Datenpflege erfolgt durch den Admin manuell über ein Formular.

---

## User Stories

- Als **eingeloggter Nutzer** möchte ich Kommunen nach Bundesland filtern und per Freitextsuche finden, damit ich schnell die Hebesätze einer bestimmten Gemeinde abrufen kann.
- Als **eingeloggter Nutzer** möchte ich Grundsteuer A, Grundsteuer B, Gewerbesteuer und den jeweiligen Vorjahreswert in einer Zeile sehen, damit ich auf einen Blick erkenne, wie hoch die Steuerlast ist und ob sie sich verändert hat.
- Als **eingeloggter Nutzer** möchte ich die Tabelle nach Bundesland und dann nach Kommunenname sortiert sehen, damit ich Einträge systematisch durchblättern kann.
- Als **eingeloggter Nutzer** möchte ich 50 Einträge pro Seite sehen und zwischen Seiten navigieren, damit die Ansicht auch bei einer großen Datenbasis performant bleibt.
- Als **eingeloggter Nutzer** möchte ich bei einer Suche ohne Treffer den Hinweis „Noch nicht verfügbar" sehen, damit ich weiß, dass die Daten fehlen und nicht ein Fehler vorliegt.
- Als **Admin** möchte ich über ein geschütztes Formular neue Datensätze anlegen und bestehende bearbeiten, damit ich die Datenbank ohne Datenbankzugriff pflegen kann.

---

## Acceptance Criteria

### Zugang
- [ ] Nur eingeloggte Nutzer können die Datenbank-Ansicht aufrufen — nicht eingeloggte Nutzer werden auf die Login-Seite weitergeleitet.

### Datenbankinhalt
- [ ] Jeder Datensatz enthält: Bundesland, Kreis (optional), Gemeindename, Grundsteuer A (%), Grundsteuer B (%), Gewerbesteuer (%), Vorjahr-Hebesatz B, Datenstand (Datum/Jahr), Quellenstatus (bestätigt / offen).
- [ ] Vorjahreswert Grundsteuer B wird als Zahl gespeichert und neben dem aktuellen Wert angezeigt.
- [ ] Eine Änderungsanzeige (+/−) errechnet sich aus aktuellem Wert minus Vorjahr.

### Suche & Filter
- [ ] Freitextsuche über Gemeindename (Substring-Suche, case-insensitive).
- [ ] Dropdown-Filter für Bundesland (16 Optionen + „Alle").
- [ ] Filter und Suche können kombiniert werden.
- [ ] Bei leerem Ergebnis erscheint der Text „Für diese Auswahl sind noch keine Daten verfügbar." (kein Fehler-State, kein Spinner).

### Tabelle & Paginierung
- [ ] Standard-Sortierung: Bundesland aufsteigend, dann Gemeindename aufsteigend.
- [ ] 50 Einträge pro Seite; Seitennavigation (Zurück/Weiter + aktuelle Seite) sichtbar.
- [ ] Tabellenspalten: Gemeinde | Bundesland | GrSt A | GrSt B | Vorjahr B | Δ | GewSt | Stand | Status.
- [ ] Tabelle ist responsive; auf kleinen Bildschirmen horizontal scrollbar.

### Admin-Datenpflege
- [ ] Ein Admin-Formular (nur für User mit Admin-Rolle zugänglich) ermöglicht: Neuen Datensatz anlegen, bestehenden Datensatz bearbeiten.
- [ ] Pflichtfelder: Gemeindename, Bundesland, Grundsteuer B.
- [ ] Optionale Felder: Grundsteuer A, Gewerbesteuer, Vorjahr B, Kreis, Quellenstatus, Datenstand.
- [ ] Ungültige Werte (negativ, > 2000 %) werden clientseitig abgefangen.

### Performance
- [ ] Tabelle lädt in unter 1 Sekunde bei bis zu 5.000 Datensätzen (serverseitige Paginierung via Supabase).

---

## Edge Cases

- **Keine Daten in der DB:** Tabelle leer, Hinweis „Noch keine Daten vorhanden. Als Admin kannst du Einträge über das Verwaltungsformular anlegen."
- **Suche ohne Treffer:** Klarer Text „Für diese Auswahl sind noch keine Daten verfügbar." — kein Fehler, kein leerer Bildschirm ohne Erklärung.
- **Fehlende optionale Felder:** Grundsteuer A oder Gewerbesteuer nicht erfasst → Zelle zeigt „—" (kein leeres Feld).
- **Vorjahr fehlt, Δ nicht berechenbar:** Änderungsspalte zeigt „—" statt Rechenfehler.
- **Sehr lange Gemeindenamen:** Tabellenzellen umbrechen oder kürzen mit Tooltip (kein Layout-Bruch).
- **Gleichzeitiger Admin-Edit:** Optimistic UI, bei Konflikt Fehlermeldung mit Reload-Aufforderung.
- **Session abgelaufen während Nutzung:** Nächster API-Call löst Redirect zur Login-Seite aus, kein stiller Fehler.
- **Filter zurücksetzen:** „Filter zurücksetzen"-Button stellt Standardansicht wieder her.

---

## Technical Requirements

- **Auth:** Supabase Auth — Session-Check server-side, kein Zugriff ohne gültige Session.
- **Datenhaltung:** Supabase PostgreSQL, Tabelle `municipalities` mit Row Level Security (RLS); SELECT für alle authentifizierten User, INSERT/UPDATE nur für Admin-Rolle.
- **Paginierung:** Serverseitig via Supabase `.range()` — kein Full-Table-Fetch im Client.
- **Suche:** Supabase `.ilike()` auf `name`-Spalte; Filter via `.eq('bundesland', value)`.
- **Performance:** Index auf `bundesland` und `name`.
- **Browser-Support:** Chrome, Firefox, Safari, Edge (aktuelle Versionen).
- **Responsive:** Mindestbreite 375px (Mobile), Tabelle horizontal scrollbar.

---

## Tech Design (Solution Architect)
**Erstellt:** 2026-05-04

### Seitenstruktur & Komponenten
```
App (Next.js)
│
├── /login                          ← Login-Seite
│
├── /datenbank                      ← Geschützte Hauptseite (nur eingeloggt)
│   ├── FilterLeiste
│   │   ├── BundeslandAuswahl       ← Dropdown (16 Länder + "Alle")
│   │   └── Suchfeld                ← Freitextsuche (Gemeindename)
│   ├── HebesatzTabelle
│   │   ├── Tabellenkopf            ← Gemeinde | Land | GrSt A | GrSt B | Vorjahr | Δ | GewSt | Stand | Status
│   │   ├── Tabellenzeilen          ← 50/Seite, sortiert Bundesland → Gemeinde
│   │   └── Leerzustand             ← "Noch nicht verfügbar" wenn keine Treffer
│   ├── SeitenNavigation            ← Zurück / Weiter / Seitennummer
│   └── AdminButton                 ← Nur für Admin-Nutzer sichtbar
│       └── AdminFormular (Dialog)
│           ├── Pflicht: Gemeindename, Bundesland, Grundsteuer B
│           └── Optional: GrSt A, GewSt, Vorjahr B, Kreis, Quellenstatus, Datenstand
│
└── Middleware                      ← Prüft Session bei jedem Aufruf → /login wenn nicht eingeloggt
```

### Datenspeicherung
**Wo:** Supabase PostgreSQL (zentral, kein localStorage)

| Feld | Beschreibung | Pflicht |
|---|---|---|
| ID | Automatisch generiert | — |
| Gemeindename | z.B. "Münster" | Ja |
| Bundesland | z.B. "Nordrhein-Westfalen" | Ja |
| Kreis | z.B. "Kreis Steinfurt" | Nein |
| Grundsteuer A (%) | Hebesatz landwirtschaftliche Grundstücke | Nein |
| Grundsteuer B (%) | Haupthebesatz Wohn-/Gewerbeimmobilien | Ja |
| Gewerbesteuer (%) | Hebesatz Gewerbe | Nein |
| Vorjahr Grundsteuer B | Vorjahreswert für Δ-Berechnung | Nein |
| Datenstand | Jahr/Datum der Quelle | Nein |
| Quellenstatus | "bestätigt" oder "offen" | Nein |
| Zeitstempel | Erstellt / Geändert (automatisch) | — |

**Sicherheit:** RLS direkt in der Datenbank — eingeloggte Nutzer dürfen lesen, nur Admins dürfen schreiben.

### Tech-Entscheidungen
| Entscheidung | Begründung |
|---|---|
| Supabase PostgreSQL | Bereits eingerichtet, bringt Auth + RLS |
| Serverseitige Paginierung | 11.000+ Gemeinden bundesweit — alles laden wäre zu langsam |
| Next.js Middleware für Auth | Schützt Routen server-seitig, bevor Seite geladen wird |
| Admin-Dialog statt eigener Seite | Kontextnah, kein Extra-Pfad nötig |
| Δ-Berechnung im Frontend | Einfache Subtraktion, kein Datenbankjob nötig |
| shadcn/ui Komponenten | Table, Select, Input, Dialog, Pagination bereits installiert |

### Neues Paket
- `@supabase/ssr` — Supabase-Auth für Next.js App Router (Server Components + Middleware)

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
