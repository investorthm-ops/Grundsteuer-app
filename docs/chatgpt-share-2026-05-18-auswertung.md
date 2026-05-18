# Auswertung ChatGPT-Share vom 2026-05-18

Quelle: https://chatgpt.com/share/6a0b42e3-4d5c-8389-8f59-786f2e73c1b7

## Kernaussage

GrundsteuerMonitor sollte nicht als reine Hebesatz-Tabelle verstanden werden.

Die bessere Positionierung ist:

> Fruehwarnsystem fuer kommunale Steuererhoehungen und Renditeauswirkungen bei Immobilien.

Der zahlbare Wert entsteht nicht durch den einzelnen Hebesatz. Der Wert entsteht durch Aktualitaet, Historie, Watchlists, Alerts, Quellen und konkrete Auswirkungen auf Immobilien-Portfolios.

## Zielgruppe zuerst

Prioritaet fuer den Start:

1. Immobilieninvestoren mit mehreren Objekten
2. Steuerberater und Hausverwaltungen
3. Makler und kleinere Bestandshalter
4. Spaeter: Banken, Portale und Softwareanbieter ueber API

Privatnutzer sind wichtig fuer SEO, aber wahrscheinlich nicht die beste zahlende Zielgruppe.

## MVP-Fokus

Der Start sollte bewusst klein bleiben:

- Top 500 Staedte statt sofort alle Kommunen perfekt
- Suche nach Gemeinde
- Grundsteuer A, Grundsteuer B und Gewerbesteuer
- Datenstand und Quellenlink
- Historie und Aenderung zum Vorjahr
- Watchlist mit E-Mail-Alert
- CSV/Excel-Export
- SEO-Stadtseiten

Nicht in V1 bauen:

- native App
- zu viele Charts
- API fuer Kunden
- vollstaendige Kommunaldatenplattform
- individuelle Steuerberatung oder Bescheidpruefung

## Produktlogik

Free:

- Gemeinde suchen
- aktueller Hebesatz
- SEO-Traffic aufbauen

Pro:

- Historie
- Watchlist
- Alerts
- Export

Investor:

- mehrere Standorte
- Portfolio-Monitoring
- Renditeauswirkung

Business:

- Teamnutzung
- viele Standorte
- Export und Beratungsnutzen

API:

- erst spaeter fuer Banken, Portale und Softwareanbieter

## Datenstrategie

Stufe 1: offizielle Basisdaten importieren.

Moegliche Quellen:

- Destatis Hebesaetze der Gemeinden
- Statistikportal / Regionaldatenbank
- GovData-Datensaetze
- kommunale Satzungen und Haushaltssatzungen

Stufe 2: KI-gestuetzte Aktualisierung.

Crawler suchen regelmaessig nach neuen Satzungen, Ratsbeschluessen und PDFs. KI extrahiert die Werte. Jeder Datensatz braucht:

- Quellen-URL
- Datenstand
- Confidence Score
- Status: offen, geprueft, bestaetigt

Ohne Quellen- und Prueflogik ist die Plattform nicht vertrauenswuerdig genug fuer zahlende Kunden.

## Umsetzung mit vorhandenen Tools

Codex:

- App-Struktur
- Datenbank
- API
- Supabase Auth
- Admin-Bereich
- Import- und Scraper-Logik

Claude:

- UX-Texte
- Landingpage-Varianten
- Angebotslogik
- Pitch und Kundenansprache

Optional spaeter:

- kleines API-Budget fuer KI-Parsing
- Stripe fuer Abos
- Plausible Analytics fuer datenschutzfreundliche Auswertung

## Naechste Projektentscheidungen

1. GrundsteuerMonitor bleibt der Name.
2. Hauptversprechen: "Nie wieder Renditeverlust durch ueberraschende Hebesatzaenderungen."
3. MVP-Ziel: 10 Pilotkunden, bevor groesser gebaut wird.
4. Erste Datenbasis: Top 500 Staedte mit Quelle und Datenstand.
5. Naechster Produktschritt nach PROJ-1: Watchlist und Alerts.

## Abgeleitete Features

- PROJ-2: Watchlist und Aenderungsalerts
- PROJ-3: SEO-Stadtseiten fuer Hebesatz-Suchen
- PROJ-4: Import- und Quellenpipeline
- PROJ-5: Export fuer Investoren und Berater
- PROJ-6: einfacher Renditeauswirkungs-Rechner

