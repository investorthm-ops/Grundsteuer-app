# Product Requirements Document - GrundsteuerMonitor

## Vision

Der GrundsteuerMonitor macht kommunale Hebesaetze fuer Grundsteuer A, Grundsteuer B und Gewerbesteuer zentral auffindbar, vergleichbar und exportierbar. Statt verstreute Informationen aus Amtsblaettern, Statistikportalen und kommunalen Webseiten manuell zusammenzutragen, erhalten Nutzer eine gepflegte Arbeitsgrundlage mit Datenstand, Quellenstatus, Vergleich, Watchlist und Export.

Ziel ist es, Hebesatz-Aenderungen frueh zu erkennen und bessere Standort-, Beratungs- und Portfolioentscheidungen zu ermoeglichen.

## Zielgruppen

Vier Zielgruppen stehen im Fokus:

- **Steuerberater und Kanzleien**: brauchen schnelle Vergleichswerte fuer Mandantengespraeche, Standortfragen und Bescheidpruefung.
- **Immobilieninvestoren und Bestandshalter**: wollen Veraenderungen in ihren Standort-Kommunen frueh erkennen und Portfolios benchmarken.
- **Kommunen und Verwaltung**: vergleichen eigene Hebesaetze mit Nachbarkommunen, Kreisen und Bundeslaendern.
- **Gewerbetreibende und Mittelstand**: pruefen Standortkosten und vergleichen steuerliche Rahmenbedingungen.

Gemeinsamer Schmerzpunkt: Die Daten sind oeffentlich, aber verteilt, uneinheitlich, oft nicht historisiert und nicht bequem exportierbar.

## Kern-Nutzenversprechen

Der GrundsteuerMonitor liefert eine zentrale Recherche- und Vergleichsumgebung fuer kommunale Hebesaetze:

**Suchen, vergleichen, beobachten und als Auswertung exportieren.**

Der Nutzer spart Zeit, erkennt auffaellige Aenderungen schneller und kann Gemeinden, Standorte oder Mandanten strukturierter bewerten.

## Produktpositionierung und USP

Der GrundsteuerMonitor positioniert sich als spezialisiertes Monitoring- und Vergleichswerkzeug fuer kommunale Steuerhebesaetze in Deutschland.

Der USP liegt in der Kombination aus:

- zentraler Hebesatz-Datenbank
- Datenstand und Quellenstatus
- oeffentlichen Stadtseiten
- Watchlist fuer relevante Gemeinden
- Vergleich und Ranking
- CSV/Excel-Export
- mandantenfaehiger Nutzerverwaltung
- differenzierten Grundsteuer-B-Werten fuer Wohnen und Nichtwohnen
- Self-Service-Zugang fuer Pilotkunden

Wichtig: Die Anwendung ersetzt keine Steuerberatung, Rechtsberatung oder amtliche Auskunft. Die angezeigten Werte dienen der Recherche und muessen bei verbindlichen Entscheidungen gegen amtliche Quellen geprueft werden.

## Geografischer Scope

Der Produktanspruch ist bundesweit fuer Deutschland. Die Datenbasis wird schrittweise erweitert und anhand von Relevanz, Nachfrage und verfuegbaren Quellen gepflegt.

Der aktuelle MVP enthaelt schwerpunktmaessig historische und gepruefte Demo-/Pilotdaten mit sichtbarem Datenstand und Quellenstatus.

## Geschaeftsmodell

Das Geschaeftsmodell wird im Markttest validiert. Der MVP unterstuetzt bereits die technische Grundlage fuer Pilotkunden:

- Login
- Kundenorganisationen
- Rollen
- Zugriffslaufzeit
- Account-Seite
- Admin-Freischaltung
- Audit-Log

Moegliche spaetere Modelle:

- Abo fuer Steuerberater, Investoren und Unternehmen
- Kanzlei-/Team-Tarife
- Enterprise-Zugang fuer groessere Organisationen
- Beratungs- oder Datenpakete als Zusatzleistung

Aktives Billing ist bewusst noch nicht umgesetzt.

## Core Features

| Prioritaet | Feature | Status |
|---|---|---|
| P0 | Bundesweite Hebesatz-Datenbank fuer Grundsteuer A, Grundsteuer B und Gewerbesteuer | Deployed |
| P0 | Suche und Filter nach Gemeinde und Bundesland | Deployed |
| P0 | Vergleich und Benchmarking mehrerer Kommunen | Deployed |
| P0 | Watchlist fuer relevante Gemeinden | Deployed |
| P0 | CSV/Excel-Export fuer Auswertungen | Deployed |
| P0 | Oeffentliche SEO-Stadtseiten fuer Hebesatz-Suchen | Deployed |
| P1 | Import- und Quellenpipeline | Deployed |
| P1 | Mandantenfaehige Nutzerverwaltung mit Supabase Auth und RLS | Deployed |
| P1 | Admin-gesteuerte Kundenfreischaltung mit Rollen und Zugriffslaufzeit | Deployed |
| P1 | Datenvertrauen, Demo-Daten, Datenstand und Quellenstatus | Deployed |
| P1 | Differenzierte Grundsteuer-B-Hebesaetze fuer Wohnen und Nichtwohnen | Deployed |
| P1 | Homepage- und Legal-Seiten-Redesign | Deployed |
| P1 | Self-Service-Auth, Einladung, Passwort-Reset und Audit-Log | Deployed |
| P1 | Mein Zugang: Account-Selbstanzeige fuer Nutzer | Deployed |
| P1 | Pilotkunden-Onboarding und Datenqualitaets-Startzentrale | Planned |
| P2 | Beratungsreports als PDF/Excel fuer Mandantengespraeche | Planned |
| P2 | Billing-Integration nach Geschaeftsmodell-Validierung | Planned |
| P2 | Multi-User-Teamverwaltung pro Organisation | Planned |

## Aktueller Produktstand

Der MVP ist technisch vorzeigbar und fuer Pilotkunden grundsaetzlich nutzbar. Die wichtigsten Nutzer- und Admin-Flows sind vorhanden:

- Nutzer koennen sich einloggen.
- Admins koennen Kundenorganisationen verwalten.
- Admins koennen Nutzer einladen.
- Nutzer koennen ein Passwort setzen oder zuruecksetzen.
- Admin-Aktionen werden im Audit-Log protokolliert.
- Nutzer sehen unter `/mein-zugang` ihre Organisation, Rolle und Zugriffslaufzeit.
- Rechtliche Seiten sind strukturell vorhanden.

Noch nicht produktionsfinal sind Impressum, AGB, Datenschutzdetails, Hosting-/AV-Dokumentation und die finale Datenabdeckung.

## Success Metrics

Erfolg wird auf drei Ebenen gemessen:

- **Pilotkunden**: Ziel ist es, die ersten 10 Pilotkunden zu gewinnen.
- **Nutzung pro Kunde**: Logins, Watchlist-Eintraege, Vergleichsaufrufe, Exporte.
- **Datenqualitaet**: Anteil der Gemeinden mit aktuellem Datenstand, bestaetigter Quelle und nachvollziehbarer Historie.

Nach erfolgreichem Pilotbetrieb werden zahlende Kunden und wiederkehrende Nutzung zur Hauptmetrik.

## Constraints

- Einzelentwickler-Projekt mit begrenztem Zeitbudget.
- Tech-Stack: Next.js 16, Supabase, Tailwind CSS, shadcn/ui, Vercel.
- DSGVO, Impressum, AGB, Haftungshinweise und Auftragsverarbeitung muessen vor zahlenden Kunden finalisiert werden.
- Datenpflege ist der groesste operative Aufwand.
- Die Anwendung darf nicht als Steuerberatung, Rechtsberatung oder amtliche Auskunft auftreten.

## Non-Goals fuer V1

Diese Funktionen sind fuer V1 bewusst nicht im Scope:

- individuelle Grundsteuerberechnung pro Immobilie
- Bescheidpruefung oder Einspruchs-Tool
- Steuer- oder Rechtsberatung
- native iOS- oder Android-App
- internationale Daten ausserhalb Deutschlands
- vollautomatisiertes Billing
- oeffentliche Self-Signup-Registrierung

## Naechste sinnvolle Schritte

1. Produktionskonfiguration pruefen: Supabase-Migrationen, Vercel ENV, Redirect URLs, E-Mail-Templates.
2. Impressum, Datenschutz, AGB und Haftungstexte mit echten Betreiberangaben finalisieren.
3. Datenbasis priorisieren: aktuelle 2025/2026-Hebesaetze fuer relevante Pilotkommunen nachziehen.
4. PROJ-14 umsetzen: Pilotkunden-Onboarding und Datenqualitaets-Startzentrale.
