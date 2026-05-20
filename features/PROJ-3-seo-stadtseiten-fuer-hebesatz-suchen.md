# PROJ-3: SEO-Stadtseiten fuer Hebesatz-Suchen

## Status: Deployed
**Created:** 2026-05-20
**Last Updated:** 2026-05-20

## Uebersicht
Oeffentliche Stadtseiten machen einzelne Gemeinden ueber Google auffindbar. Nutzer sollen bei Suchanfragen wie "Grundsteuer Hebesatz Dortmund" direkt eine einfache, schnelle und glaubwuerdige Seite finden.

## MVP-Scope
- Oeffentliche Route `/grundsteuer-hebesatz/[slug]`.
- SEO-Title und Description je Gemeinde.
- Anzeige von Grundsteuer A, Grundsteuer B, Gewerbesteuer, Vorjahr, Delta, Datenstand und Quellenstatus.
- Link zur Datenbank, um die Gemeinde auf die Watchlist zu setzen.
- Dynamische `sitemap.xml` fuer alle vorhandenen Stadtseiten.
- `robots.txt` mit Verweis auf die Sitemap.
- Oeffentliche Lesepolicy fuer `municipalities`, da Hebesaetze oeffentliche Daten sind.

## Non-Goals
- Keine 10.000 statischen Seiten im Build.
- Keine IndexNow-/Search-Console-Automatisierung.
- Keine redaktionellen Langtexte pro Stadt.

## Acceptance Criteria
- [x] Eine Gemeinde ist unter `/grundsteuer-hebesatz/<stadt-slug>` erreichbar.
- [x] Die Seite zeigt die wichtigsten Hebesatz-Kennzahlen.
- [x] Die Seite enthaelt dynamische Metadata fuer Title und Description.
- [x] Die Seite verlinkt zur Datenbank, damit Nutzer die Gemeinde merken koennen.
- [x] Migration `0004_public_municipality_seo_select.sql` ist im Supabase-Projekt ausgefuehrt.
- [x] Live-Test mit mindestens einer vorhandenen Gemeinde ist bestanden.
- [x] `/sitemap.xml` listet vorhandene Stadtseiten.
- [x] `/robots.txt` verweist auf `/sitemap.xml`.

## Implementation Notes
**Date:** 2026-05-20

**Was wurde gebaut**
- Slug-Helfer fuer Gemeinde-URLs.
- Neue SEO-Detailseite unter `/grundsteuer-hebesatz/[slug]`.
- Supabase-Migration fuer oeffentlichen Lesezugriff auf Gemeinde-Daten.
- Dynamische Sitemap und robots.txt.
- `NEXT_PUBLIC_SITE_URL` als Basis-URL fuer produktive Sitemap-Links.

## QA Test Results
**Local Check:** 2026-05-20

- [x] `npm.cmd run build` erfolgreich.
- [x] Next.js erkennt `/grundsteuer-hebesatz/[slug]` als dynamische Route.
- [x] Lokaler Test mit `/grundsteuer-hebesatz/dortmund` erfolgreich.
- [x] Seite zeigt Gemeinde, Grundsteuer B, Vorjahr, Delta, Datenstand und Quellenstatus.

**Public Access Check:** 2026-05-20

- [x] Supabase-Migration `0004_public_municipality_seo_select.sql` erfolgreich ausgefuehrt.
- [x] Oeffentlicher Zugriff ohne Browser-Login liefert HTTP 200.
- [x] `/grundsteuer-hebesatz/dortmund` enthaelt "Grundsteuer Hebesatz Dortmund".
- [x] `/grundsteuer-hebesatz/dortmund` enthaelt den Wert "610 %".

**Sitemap Check:** 2026-05-20

- [x] `npm.cmd run build` erfolgreich.
- [x] `/sitemap.xml` liefert HTTP 200.
- [x] `/sitemap.xml` enthaelt Dortmund, Koeln und Duesseldorf.
- [x] `/robots.txt` liefert HTTP 200.
- [x] `/robots.txt` verweist auf `/sitemap.xml`.

## Deployment

**Live-Test:** 2026-05-20

Getesteter Ablauf:
1. Supabase-Policy fuer anonymen Lesezugriff ausgefuehrt.
2. Dortmund-Seite lokal geoeffnet.
3. Oeffentliche Seite ohne Login technisch abgefragt.
4. Gemeinde und Hebesatz wurden korrekt ausgeliefert.

**Ergebnis:** Bestanden.
