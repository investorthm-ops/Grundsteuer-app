# PROJ-11: Homepage- und Legal-Seiten-Redesign

## Status: Deployed
**Created:** 2026-05-24
**Last Updated:** 2026-05-24

## Uebersicht
Erste Politur-Runde vor Pilotkunden-Ansprache: Homepage wird zur eigenstaendigen Landingpage mit Hero-Suchbox und klarer Nutzenkommunikation, statt direktem App-Einstieg. Footer mit vollstaendigen Rechtsseiten (Impressum, Datenschutz, AGB, Haftungsausschluss, Kontakt) ergaenzt. Custom 404-Seite auf Deutsch mit Recovery-Links.

## Zielgruppe
Erstbesucher (Steuerberater, Investoren), die das Tool ueber Suchmaschine oder Empfehlung finden und in unter 5 Sekunden verstehen muessen, was es leistet. Plus: rechtliche Mindestanforderungen vor erstem zahlenden Kunden.

## Umgesetzte Aenderungen
- Neue Landingpage (`src/app/page.tsx`) mit Hero, Suchbox, Nutzenversprechen
- Footer-Komponente (`src/components/footer.tsx`) mit Legal-Navigation
- Auth-aware Header-Button (`src/components/auth-button.tsx`)
- Legal-Seiten: `/impressum`, `/datenschutz`, `/agb`, `/haftungsausschluss`, `/kontakt`, `/hinweise`
- Custom 404 (`src/app/not-found.tsx`) mit deutscher Navigation
- Stakeholder-Diagramm und Dokumentations-Update unter `docs/` und `diagrams/`

## Bekannte offene Punkte
- Impressum- und Datenschutz-Inhalte sind Templates und muessen vor Produktivbetrieb durch echte Daten ersetzt werden (siehe `docs/legal-checklist.md`)
- DSGVO-Pruefung vor erstem zahlenden Kunden ausstehend

## Verwandte Commits
- `554015a` feat(PROJ-11): Redesign homepage and legal pages
- `0d90e1b` fix(ui): custom 404 page in German (#16)
- `d4e74ec` feat(ui): welcome-hero search box, richer footer (#15)
- `de81fda` feat(ui): auth-aware button, footer with legal pages (#14)
