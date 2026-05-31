# Product Requirements Document - GrundsteuerMonitor

## Vision

Der GrundsteuerMonitor macht kommunale Hebesätze für Grundsteuer A, Grundsteuer B und Gewerbesteuer zentral auffindbar, vergleichbar und exportierbar. Statt verstreute Informationen aus Amtsblättern, Statistikportalen und kommunalen Webseiten manuell zusammenzutragen, erhalten Nutzer eine gepflegte Arbeitsgrundlage mit Datenstand, Quellenstatus, Vergleich, Watchlist und Export.

Ziel ist es, Hebesatz-Änderungen früh zu erkennen und bessere Standort-, Beratungs- und Portfolioentscheidungen zu ermöglichen.

## Zielgruppen

Vier Zielgruppen stehen im Fokus:

- **Steuerberater und Kanzleien**: brauchen schnelle Vergleichswerte für Mandantengespräche, Standortfragen und Bescheidprüfung.
- **Immobilieninvestoren und Bestandshalter**: wollen Veränderungen in ihren Standort-Kommunen früh erkennen und Portfolios benchmarken.
- **Kommunen und Verwaltung**: vergleichen eigene Hebesätze mit Nachbarkommunen, Kreisen und Bundesländern.
- **Gewerbetreibende und Mittelstand**: prüfen Standortkosten und vergleichen steuerliche Rahmenbedingungen.

Gemeinsamer Schmerzpunkt: Die Daten sind öffentlich, aber verteilt, uneinheitlich, oft nicht historisiert und nicht bequem exportierbar.

## Kern-Nutzenversprechen

Der GrundsteuerMonitor liefert eine zentrale Recherche- und Vergleichsumgebung für kommunale Hebesätze:

**Suchen, vergleichen, beobachten und als Auswertung exportieren.**

Der Nutzer spart Zeit, erkennt auffällige Änderungen schneller und kann Gemeinden, Standorte oder Mandanten strukturierter bewerten.

## Produktpositionierung und USP

Der GrundsteuerMonitor positioniert sich als spezialisiertes Monitoring- und Vergleichswerkzeug für kommunale Steuerhebesätze in Deutschland.

Der USP liegt in der Kombination aus:

- zentraler Hebesatz-Datenbank
- Datenstand und Quellenstatus
- öffentlichen Stadtseiten
- Watchlist für relevante Gemeinden
- Vergleich und Ranking
- CSV/Excel-Export
- mandantenfähiger Nutzerverwaltung
- differenzierten Grundsteuer-B-Werten für Wohnen und Nichtwohnen
- Self-Service-Zugang für Pilotkunden

Wichtig: Die Anwendung ersetzt keine Steuerberatung, Rechtsberatung oder amtliche Auskunft. Die angezeigten Werte dienen der Recherche und müssen bei verbindlichen Entscheidungen gegen amtliche Quellen geprüft werden.

## Geografischer Scope

Der Produktanspruch ist bundesweit für Deutschland. Die Datenbasis wird schrittweise erweitert und anhand von Relevanz, Nachfrage und verfügbaren Quellen gepflegt.

Der aktuelle MVP enthält schwerpunktmäßig historische und geprüfte Demo-/Pilotdaten mit sichtbarem Datenstand und Quellenstatus.

## Geschäftsmodell

Das Geschäftsmodell wird im Markttest validiert. Der MVP unterstützt bereits die technische Grundlage für Pilotkunden:

- Login
- Kundenorganisationen
- Rollen
- Zugriffslaufzeit
- Account-Seite
- Admin-Freischaltung
- Audit-Log

Mögliche spätere Modelle:

- Abo für Steuerberater, Investoren und Unternehmen
- Kanzlei-/Team-Tarife
- Enterprise-Zugang für größere Organisationen
- Beratungs- oder Datenpakete als Zusatzleistung

Aktives Billing ist bewusst noch nicht umgesetzt.

## Core Features

| Priorität | Feature | Status |
|---|---|---|
| P0 | Bundesweite Hebesatz-Datenbank für Grundsteuer A, Grundsteuer B und Gewerbesteuer | Deployed |
| P0 | Suche und Filter nach Gemeinde und Bundesland | Deployed |
| P0 | Vergleich und Benchmarking mehrerer Kommunen | Deployed |
| P0 | Watchlist für relevante Gemeinden | Deployed |
| P0 | CSV/Excel-Export für Auswertungen | Deployed |
| P0 | Öffentliche SEO-Stadtseiten für Hebesatz-Suchen | Deployed |
| P1 | Import- und Quellenpipeline | Deployed |
| P1 | Mandantenfähige Nutzerverwaltung mit Supabase Auth und RLS | Deployed |
| P1 | Admin-gesteuerte Kundenfreischaltung mit Rollen und Zugriffslaufzeit | Deployed |
| P1 | Datenvertrauen, Demo-Daten, Datenstand und Quellenstatus | Deployed |
| P1 | Differenzierte Grundsteuer-B-Hebesätze für Wohnen und Nichtwohnen | Deployed |
| P1 | Homepage- und Legal-Seiten-Redesign | Deployed |
| P1 | Self-Service-Auth, Einladung, Passwort-Reset und Audit-Log | Deployed |
| P1 | Mein Zugang: Account-Selbstanzeige für Nutzer | Deployed |
| P1 | Pilotkunden-Onboarding und Datenqualitäts-Startzentrale | Deployed |
| P1 | Preisseite (/preise) mit Tarifen Solo und Kanzlei | Deployed |
| P1 | GENESIS-Automation für wöchentlichen Import NRW + Hessen | Deployed |
| P2 | Beratungsreports als PDF/Excel für Mandantengespräche | Planned |
| P2 | Billing-Integration nach Geschäftsmodell-Validierung | Planned |
| P2 | Multi-User-Teamverwaltung pro Organisation | Planned |

## Aktueller Produktstand

Der MVP ist technisch vorzeigbar und für Pilotkunden grundsätzlich nutzbar. Die wichtigsten Nutzer- und Admin-Flows sind vorhanden:

- Nutzer können sich einloggen.
- Admins können Kundenorganisationen verwalten.
- Admins können Nutzer einladen.
- Nutzer können ein Passwort setzen oder zurücksetzen.
- Admin-Aktionen werden im Audit-Log protokolliert.
- Nutzer sehen unter `/mein-zugang` ihre Organisation, Rolle und Zugriffslaufzeit.
- Admins sehen unter `/admin/pilotstart` eine Startzentrale für Pilotkunden-Onboarding und Datenqualität.
- Die Preisseite `/preise` zeigt die Tarife Solo und Kanzlei als kaufbereite Angebotsseite.
- Die GENESIS-Automation unterstützt den wöchentlichen Import für NRW und Hessen.
- Rechtliche Seiten sind strukturell vorhanden.

Noch nicht produktionsfinal sind Impressum, AGB, Datenschutzdetails, Hosting-/AV-Dokumentation und die finale Datenabdeckung.

## Success Metrics

Erfolg wird auf drei Ebenen gemessen:

- **Pilotkunden**: Ziel ist es, die ersten 10 Pilotkunden zu gewinnen.
- **Nutzung pro Kunde**: Logins, Watchlist-Einträge, Vergleichsaufrufe, Exporte.
- **Datenqualität**: Anteil der Gemeinden mit aktuellem Datenstand, bestätigter Quelle und nachvollziehbarer Historie.

Nach erfolgreichem Pilotbetrieb werden zahlende Kunden und wiederkehrende Nutzung zur Hauptmetrik.

## Constraints

- Einzelentwickler-Projekt mit begrenztem Zeitbudget.
- Tech-Stack: Next.js 16, Supabase, Tailwind CSS, shadcn/ui, Vercel.
- DSGVO, Impressum, AGB, Haftungshinweise und Auftragsverarbeitung müssen vor zahlenden Kunden finalisiert werden.
- Datenpflege ist der größte operative Aufwand.
- Die Anwendung darf nicht als Steuerberatung, Rechtsberatung oder amtliche Auskunft auftreten.

## Non-Goals für V1

Diese Funktionen sind für V1 bewusst nicht im Scope:

- individuelle Grundsteuerberechnung pro Immobilie
- Bescheidprüfung oder Einspruchs-Tool
- Steuer- oder Rechtsberatung
- native iOS- oder Android-App
- internationale Daten außerhalb Deutschlands
- vollautomatisiertes Billing
- öffentliche Self-Signup-Registrierung

## Nächste sinnvolle Schritte

1. Produktionskonfiguration prüfen: Supabase-Migrationen, Vercel ENV, Redirect URLs, E-Mail-Templates.
2. Impressum, Datenschutz, AGB und Haftungstexte mit echten Betreiberangaben finalisieren.
3. Datenbasis priorisieren: aktuelle 2025/2026-Hebesätze für relevante Pilotkommunen nachziehen.
4. Stripe-Billing vorbereiten oder bewusst weiter zurückstellen, je nach Ergebnis des Pilotkunden-Tests.
