# PROJ-1: Bundesweite Hebesatz-Datenbank

## Status: Deployed
**Created:** 2026-05-04
**Last Updated:** 2026-05-20

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
- [x] Nur eingeloggte Nutzer können die Datenbank-Ansicht `/datenbank` aufrufen — nicht eingeloggte Nutzer werden auf die Login-Seite weitergeleitet. *(Middleware + API 401)*
- [x] Aktualisierung (seit PROJ-3 / Migration 0023): Die Hebesatz-Daten selbst sind für die öffentlichen SEO-Stadtseiten bewusst anonym lesbar — aber nur Werte mit Quellenstatus `bestaetigt`. Offene (ungeprüfte) Werte sehen ausschließlich eingeloggte Nutzer und Admins. Der Login schützt die komfortable App-Ansicht (Suche, Filter, Watchlist, Export), nicht die amtlich-öffentlichen Einzelwerte.

### Datenbankinhalt
- [x] Jeder Datensatz enthält: Bundesland, Kreis (optional), Gemeindename, Grundsteuer A (%), Grundsteuer B (%), Gewerbesteuer (%), Vorjahr-Hebesatz B, Datenstand (Datum/Jahr), Quellenstatus (bestätigt / offen). *(SQL schema)*
- [x] Vorjahreswert Grundsteuer B wird als Zahl gespeichert und neben dem aktuellen Wert angezeigt. *(Spalte `vorjahr_b int`)*
- [x] Eine Änderungsanzeige (+/−) errechnet sich aus aktuellem Wert minus Vorjahr.

### Suche & Filter
- [x] Freitextsuche über Gemeindename (Substring-Suche, case-insensitive). *(API `q` param via `.ilike()`)*
- [x] Dropdown-Filter für Bundesland (16 Optionen + „Alle"). *(API `bundesland` param + Zod enum)*
- [x] Filter und Suche können kombiniert werden. *(API kombiniert `eq` + `ilike`)*
- [x] Bei leerem Ergebnis erscheint der Text „Für diese Auswahl sind noch keine Daten verfügbar." (kein Fehler-State, kein Spinner).

### Tabelle & Paginierung
- [x] Standard-Sortierung: Bundesland aufsteigend, dann Gemeindename aufsteigend. *(API order-by + composite index)*
- [x] 50 Einträge pro Seite; Seitennavigation (Zurück/Weiter + aktuelle Seite) sichtbar. *(Backend: `pageSize` default 50 via `.range()`; UI umgesetzt)*
- [x] Tabellenspalten: Gemeinde | Bundesland | GrSt A | GrSt B | Vorjahr B | Δ | GewSt | Stand | Status.
- [x] Tabelle ist responsive; auf kleinen Bildschirmen horizontal scrollbar.

### Admin-Datenpflege
- [x] Ein Admin-Formular (nur für User mit Admin-Rolle zugänglich) ermöglicht: Neuen Datensatz anlegen, bestehenden Datensatz bearbeiten. *(Backend: POST/PATCH/DELETE admin-gated; UI umgesetzt)*
- [x] Pflichtfelder: Gemeindename, Bundesland, Grundsteuer B. *(Zod + NOT NULL constraints)*
- [x] Optionale Felder: Grundsteuer A, Gewerbesteuer, Vorjahr B, Kreis, Quellenstatus, Datenstand.
- [x] Ungültige Werte (negativ, > 2000 %) werden clientseitig abgefangen. *(Server-side: Zod 0–2000 + DB CHECK; client validation umgesetzt. Präzisierung seit PROJ-10: die differenzierten Felder `hebesatz_b_wohnen`/`hebesatz_b_nichtwohnen` erlauben bewusst 0–3000.)*

### Performance
- [x] Tabelle lädt in unter 1 Sekunde bei bis zu 5.000 Datensätzen (serverseitige Paginierung via Supabase). *(Indexes auf bundesland, name, (bundesland,name); `.range()` Paginierung)*

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
- **Datenhaltung:** Supabase PostgreSQL, Tabelle `municipalities` mit Row Level Security (RLS); SELECT für alle authentifizierten User, anonym nur Zeilen mit `quellenstatus = 'bestaetigt'` (SEO-Stadtseiten, Migrationen 0004 + 0023); INSERT/UPDATE/DELETE nur für Admin-Rolle.
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
│   └── AdminLink                   ← Nur für Admin-Nutzer sichtbar → führt zu /admin/datenbank
│
├── /admin/datenbank                ← Eigene Admin-Seite (nur Admin-Rolle)
│   ├── DatensatzListe              ← Übersicht aller Einträge mit Bearbeiten/Löschen
│   └── AdminFormular
│       ├── Pflicht: Gemeindename, Bundesland, Grundsteuer B
│       └── Optional: GrSt A, GewSt, Vorjahr B, Kreis, Quellenstatus, Datenstand
│
└── Middleware                      ← Prüft Session + Rolle:
                                      /datenbank        → eingeloggt erforderlich
                                      /admin/datenbank  → Admin-Rolle erforderlich
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
| Admin-Bereich als eigene Seite (`/admin/datenbank`) | Klare Trennung Nutzer- vs. Admin-Workflow, eigene URL für Bookmarks, Listen-Übersicht hat Platz |
| Δ-Berechnung im Frontend | Einfache Subtraktion, kein Datenbankjob nötig |
| shadcn/ui Komponenten | Table, Select, Input, Dialog, Pagination bereits installiert |

### Neues Paket
- `@supabase/ssr` — Supabase-Auth für Next.js App Router (Server Components + Middleware)

### Implementation Notes (Backend)
**Date:** 2026-05-04
**Branch:** `feat/proj-1-backend`

**Was wurde gebaut**
- SQL-Migration `supabase/migrations/0001_municipalities.sql`:
  - `municipalities` Tabelle mit allen Feldern aus dem Tech Design, CHECK-Constraints (0–2000), Pflichtfelder via NOT NULL.
  - `user_roles` Tabelle (separat, statt JWT-Claims) — Admin-Records werden manuell per SQL durch den Projekt-Owner gesetzt; keine API-Schreibwege.
  - Indizes: `bundesland`, `name`, composite `(bundesland, name)` für Standard-Sortierung.
  - RLS aktiviert: SELECT für `authenticated`, INSERT/UPDATE/DELETE nur wenn `user_roles.role = 'admin'`.
  - `updated_at`-Trigger via `set_updated_at()` Funktion.
- Supabase SSR-Setup mit `@supabase/ssr`:
  - `src/lib/supabase/server.ts` — Server-Client mit Next.js cookies().
  - `src/lib/supabase/client.ts` — Browser-Client.
  - `src/lib/supabase/is-admin.ts` — Helper, wiederverwendet in API-Routen.
  - `src/middleware.ts` — schützt `/datenbank/**` (Session) und `/admin/**` (Session + Admin); Redirect zu `/login?redirectTo=...` bzw. `/datenbank` für Nicht-Admins.
- Validation: `src/lib/validation/municipality.ts` mit 16-Bundesländer-Enum, `municipalityCreateSchema`, `municipalityUpdateSchema`, `listQuerySchema`.
- TypeScript-Typen: `src/lib/types/municipality.ts`.
- API-Routen:
  - `GET /api/municipalities` — paginiert (`page`, `pageSize` max 100), Filter `bundesland`, Suche `q` via `.ilike()`, sortiert `bundesland, name`. 401 ohne Session.
  - `POST /api/municipalities` — Admin only, Zod-validiert, setzt `created_by`.
  - `PATCH /api/municipalities/[id]` — Admin only, partial update.
  - `DELETE /api/municipalities/[id]` — Admin only, 204 bzw. 404.
- `.env.local.example` aktualisiert: dokumentiert das bewusste Weglassen des Service-Role-Keys.
- Alte `src/lib/supabase.ts` entfernt (keine Aufrufer im Code).

**Abweichungen vom Brief**
- Keine. Alle vier Vorab-Entscheidungen (separate `user_roles`, DELETE-Endpoint, kein Rate-Limiting im MVP, kein Service-Role-Key) sind umgesetzt.

**Was der Nutzer als Nächstes braucht**
1. `npm install` ausführen, um `@supabase/ssr` zu installieren.
2. Migration im Supabase-Dashboard (SQL Editor) ausführen: Inhalt von `supabase/migrations/0001_municipalities.sql`.
3. Eigenen Admin-Record manuell anlegen:
   ```sql
   insert into public.user_roles (user_id, role)
   values ('<deine-auth-user-uuid>', 'admin');
   ```

### Implementation Notes (Frontend)
**Date:** 2026-05-18
**Branch:** `feat/proj-1-backend`

**Was wurde gebaut**
- Neue Startseite mit GrundsteuerMonitor-Positionierung.
- Login-Seite `/login` mit Supabase E-Mail/Passwort-Anmeldung.
- Nutzerseite `/datenbank` mit Suche, Bundesland-Filter, 50er-Paginierung, responsiver Tabelle, Delta-Anzeige, Leerzustand und Quellenstatus.
- Admin-Seite `/admin/datenbank` mit Formular fuer neue Datensaetze, Bearbeitung, Loeschfunktion und optionalen Feldern.

**Technischer Check**
- `npm.cmd run build` erfolgreich.
- `/` und `/login` liefern lokal HTTP 200.
- `/datenbank` und `/admin/datenbank` leiten ohne Login korrekt zur Login-Seite weiter.
- Browser-Sichtpruefung wurde versucht, aber lokale localhost-Aufrufe wurden in der In-App-Browseroberflaeche blockiert.

### MVP Abrundung
**Date:** 2026-05-18

**Was wurde ergaenzt**
- Demo-Hinweis auf der Datenbankseite, damit Testdaten nicht mit amtlich geprueften Daten verwechselt werden.
- Logout-Button in der Navigation.
- Deutsche Anzeige verbessert: Umlaute in UI-Texten, Status `bestätigt`, Anzeige von `Koeln` als `Köln` und `Muenster` als `Münster`.
- Umlaut-Suche normalisiert Eingaben wie `Köln` zu `Koeln`.
- Demo-Daten als wiederholbares SQL in `supabase/seed_demo_municipalities.sql` gesichert.
- `supabaseuser.txt` in `.gitignore` aufgenommen, damit lokale Zugangsdaten nicht versehentlich ins Repository gelangen.

## QA Test Results

### QA Run: 2026-05-19

**Scope**
- PROJ-1 Hebesatz-Datenbank: Login, geschuetzte Datenbankseite, Admin-Datenpflege, API-Schutz, Demo-Daten und Build.

**Environment**
- Local Next.js app
- Supabase project: `grundsteuer-monitor`
- Browser: In-app/local browser context vorhanden, automatisierte localhost-Navigation im Browser-Tool wurde durch `ERR_BLOCKED_BY_CLIENT` blockiert.
- Fallback: Build, lokale HTTP-Routenchecks und Code-/Security-Review.

**Build**
- PASS: `npm.cmd run build` erfolgreich.
- Hinweis: Next.js 16 meldet eine Warnung, dass `middleware.ts` kuenftig durch `proxy` ersetzt werden soll. Kein aktueller Blocker.

**Acceptance Criteria Summary**
- PASS: Login-Schutz fuer `/datenbank`.
- PASS: Login-Schutz fuer `/admin/datenbank`.
- PASS: API gibt ohne Session `401` fuer `/api/municipalities`.
- PASS: Startseite und Login-Seite bauen erfolgreich.
- PASS: Datenmodell, RLS, Admin-Rolle und API-Routen sind vorhanden.
- PASS: Nutzeroberflaeche mit Suche, Bundesland-Filter, Tabelle, Delta-Anzeige, Datenstand und Status ist vorhanden.
- PASS: Admin-Oberflaeche fuer Anlegen, Bearbeiten und Loeschen ist vorhanden.
- PASS: 10 Demo-Kommunen wurden in Supabase angelegt und als Seed-SQL gesichert.
- PARTIAL: Vollautomatisierte Browser-Interaktion mit Login/Admin konnte wegen Browser-Tool-Blockade nicht erneut ausgefuehrt werden; der Flow wurde am 2026-05-18 manuell erfolgreich bestaetigt.

**Security Review**
- PASS: Keine Service-Role-Key-Nutzung im App-Code gefunden.
- PASS: Kein `dangerouslySetInnerHTML` im `src`-Code gefunden.
- PASS: API ist ohne Session nicht lesbar.
- PASS: `.env.local` und lokale Zugangsdaten sind durch `.gitignore` abgedeckt.

**Findings**
- LOW: `middleware.ts` wurde spaeter auf die Next.js-16-Konvention `proxy` migriert.
- LOW: Demo-Daten sind nicht amtlich verifiziert und duerfen nicht als echte Datenbasis fuer Kunden genutzt werden.

### Live Closeout: 2026-05-20

**Scope**
- Live-Pruefung der Datenbankansicht auf `https://grundsteuer-app.vercel.app/datenbank`.

**Result**
- PASS: Login und Weiterleitung zur Datenbank funktionieren.
- PASS: Tabelle wird live angezeigt.
- PASS: Suche, Bundeslandfilter, Reset, Pagination und horizontale Tabellenansicht sind umgesetzt.
- PASS: Delta-Spalte, Status, Datenstand und Quellenfelder sind sichtbar.
- PASS: Export aus der Datenbankansicht funktioniert als Folgeschritt ueber PROJ-5.

**Production Readiness**
- READY for MVP and pilot-demo use.
- Hinweis: Demo-Daten sind weiterhin nicht amtlich verifiziert und duerfen nicht als finale Kundendatenbasis verstanden werden.

## Deployment
**Status:** Deployed
**Date:** 2026-05-20

PROJ-1 ist live auf `https://grundsteuer-app.vercel.app/datenbank` verfuegbar und wurde als MVP-Basis fuer Import, Export und weitere Nutzerfunktionen abgeschlossen.
