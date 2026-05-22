# Product Requirements Document — Grundsteuer-Monitor

## Vision
Der Grundsteuer-Monitor macht kommunale Hebesätze (Grundsteuer A, B und Gewerbesteuer) für ganz Deutschland transparent vergleichbar. Statt verstreut Auskünfte aus Amtsblättern, Statistikämtern und Kommunal-Webseiten zusammenzusuchen, erhalten Nutzer eine zentrale, gepflegte Datenbasis mit Vergleich, Benchmarking, Watchlist und Export. Ziel ist es, Hebesatz-Veränderungen früh zu erkennen und fundierte Standort- bzw. Beratungsentscheidungen zu ermöglichen.

## Target Users
Vier primäre Zielgruppen, alle mit dem gemeinsamen Bedarf nach belastbaren, aktuellen Hebesatz-Daten:

- **Steuerberater & Kanzleien** — beraten Mandanten bei Hebesatz-Änderungen, Bescheidprüfung, Standortwahl. Brauchen schnellen Zugriff auf historische und aktuelle Werte für Mandantengespräche.
- **Immobilieninvestoren & Bestandshalter** — wollen Veränderungen in ihren Standort-Kommunen früh erkennen, Renditen prognostizieren, Portfolios benchmarken.
- **Kommunen & Verwaltung** — vergleichen sich mit Nachbargemeinden (Benchmarking), nutzen die Datenbasis für eigene Hebesatz-Beschlüsse.
- **Gewerbetreibende & Mittelstand** — prüfen Standortkosten, planen Standortentscheidungen, vergleichen Steuerlast über Regionen hinweg.

Gemeinsamer Pain Point: Daten sind öffentlich, aber zersplittert, nicht historisiert und nicht maschinell vergleichbar.

## Kern-Nutzenversprechen
**Vergleich und Benchmarking.** Der Kunde zahlt für die Möglichkeit, Hebesätze zwischen Kommunen, Kreisen und Bundesländern systematisch zu vergleichen — inklusive Veränderungen über die Zeit, Risiko-Indikatoren und exportierbarer Auswertungen.

## Produktpositionierung und USP
Der Grundsteuer-Monitor zeigt Steuerberatern, Immobilienbestandshaltern und Unternehmen frühzeitig, wo sich kommunale Hebesätze ändern, wie stark die Belastung steigt und welche Standorte im Vergleich auffällig sind.

Für den MVP-Start wird der Nutzen noch konkreter formuliert:

**Änderungen bei Grundsteuer- und Gewerbesteuer-Hebesätzen automatisch überwachen, vergleichen und als Excel-Auswertung für Mandanten oder Immobilienportfolios nutzen.**

## Geografischer Scope
**Bundesweit (alle 16 Bundesländer)** ab MVP. Datenpflege erfolgt schrittweise, Priorisierung nach Einwohnerzahl und Marktnachfrage.

## Geschäftsmodell
**Noch offen — wird im Markttest validiert.** Im MVP sind Plan-Kategorien (Basic / Professional / Enterprise) nur als Filter-Konzept hinterlegt, ohne aktives Billing. Entscheidung über Abo-, Einzelverkaufs- oder Beratungs-Add-on-Modell folgt nach den ersten Pilotkunden.

## Core Features (Roadmap)

| Priorität | Feature | Status |
|-----------|---------|--------|
| P0 (MVP) | Bundesweite Hebesatz-Datenbank (A, B, Gewerbe) — suchbar, filterbar nach Bundesland/Kreis/Kommune | Planned |
| P0 (MVP) | Vergleich & Benchmarking-Ansicht — mehrere Kommunen nebeneinander, Ranglisten, Karten | Planned |
| P0 (MVP) | Watchlist mit Alerts — Kommunen markieren, Benachrichtigung bei Hebesatz-Änderung | Planned |
| P0 (MVP) | CSV/Excel-Export — Daten für eigene Auswertungen herunterladen | Planned |
| P1 | Nutzer-Authentifizierung & Mandantentrennung (Supabase Auth + RLS) | Planned |
| P1 | Admin-gesteuerte Kundenfreischaltung mit Rollen und Laufzeitbegrenzung | Planned |
| P1 | Datenpflege-Workflow (Import-Pipeline, Quellenverwaltung, Versionierung) | Planned |
| P1 | Datenvertrauen und Demo-Daten — Quellen, Datenstand und geprüfte Pilotdaten sichtbar machen | In Progress |
| P1 | Differenzierte Grundsteuer-B-Hebesätze für Wohnen und Nichtwohnen ab 2025 | Planned |
| P2 | Beratungs-Reports (PDF/Excel-Auswertungen für Mandantengespräche) | Planned |
| P2 | Billing-Integration (sobald Geschäftsmodell validiert ist) | Planned |

## Success Metrics
Erfolg wird auf drei Ebenen gemessen:

- **Anzahl zahlender Kunden** — primäre Geschäftsmetrik nach Markteinführung.
- **Aktive Nutzung pro Kunde** — Logins pro Monat, Anzahl Watchlist-Einträge, Anzahl Vergleichs- und Exportvorgänge. Engagement zeigt, ob das Tool wirklich gebraucht wird.
- **Erste 10 Pilotkunden gewinnen** — konkretes MVP-Ziel der ersten Phase, vor jeder weiteren Skalierung.

## Constraints
- Einzelentwickler-Projekt (Selbstständigkeit), Zeitbudget begrenzt.
- Tech-Stack vorgegeben: Next.js 16 + Supabase + Tailwind/shadcn/ui (bereits im Repo angelegt).
- DSGVO-Konformität verpflichtend (Impressum, Datenschutz, AGB vor erstem zahlenden Kunden).
- Datenpflege-Aufwand offen — manuelle Pflege vs. automatisierter Import muss in P1 entschieden werden.

## Non-Goals (V1)
Diese Funktionen werden ausdrücklich **nicht** gebaut:

- Individuelle Grundsteuer-Berechnung pro Immobilie (kein Steuer-Rechner).
- Bescheid-Prüfung oder Einspruchs-Tool (keine Rechtsberatung).
- Native Mobile-Apps (iOS/Android) — nur responsive Web.
- Internationale Daten (Österreich, Schweiz) — Fokus Deutschland.

---

Use `/requirements` to create detailed feature specifications for each P0 item above.
