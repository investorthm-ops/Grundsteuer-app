# PROJ-14: Pilotkunden-Onboarding und Datenqualitaet

## Status: Planned
**Created:** 2026-05-25
**Last Updated:** 2026-05-25

## Uebersicht
PROJ-14 ergaenzt eine Admin-Startzentrale fuer den Pilotkundenstart. Markus sieht dort auf einen Blick, ob Kundenorganisationen, Nutzerzuordnungen, Zugriffslaufzeiten und Datenqualitaet bereit fuer echte Pilotkundentests sind.

Die Funktion nutzt vorhandene Tabellen und legt keine neue Checklisten-Persistenz an. Der Status wird aus Organisationen, Mitgliedschaften, Gemeinden und Importhistorie abgeleitet.

## Zielgruppe
- **Markus (Admin)**: will vor Pilotkundentests schnell erkennen, welche operativen Risiken noch offen sind.
- **Pilotkunden indirekt**: profitieren von sauberer Freischaltung, klarer Datenlage und weniger manuellen Fehlern.

## User Stories
- Als Admin moechte ich eine Startzentrale fuer den Pilotstart sehen, damit ich nicht zwischen mehreren Seiten und Dokumenten springen muss.
- Als Admin moechte ich Organisationen ohne Nutzer oder mit ablaufendem Zugang erkennen, damit Einladungen und Laufzeiten vor Kundentests stimmen.
- Als Admin moechte ich Datenqualitaets-Kennzahlen sehen, damit historische oder unvollstaendige Daten nicht versehentlich als aktuell verkauft werden.
- Als Admin moechte ich direkte Links zu Kunden, Datenpflege und Importen sehen, damit ich Risiken sofort bearbeiten kann.

## Akzeptanzkriterien
- Neue Admin-Seite `/admin/pilotstart` ist vorhanden und ueber die Admin-Tabs erreichbar.
- Nur Admins koennen Seite und API nutzen.
- Dashboard zeigt Organisationen gesamt, Status-Verteilung, Organisationen ohne Nutzer und bald ablaufende Zugaenge.
- Dashboard zeigt Gemeinden gesamt, bestaetigte Quellen, offene Quellen, fehlenden Datenstand, veraltete Datenstaende vor 2025 und fehlende Quellenangaben.
- Pro Organisation werden Status, Nutzeranzahl, Zugriffslaufzeit und Warnhinweise angezeigt.
- Datenqualitaetsbereich verlinkt auf `/admin/datenbank` und `/admin/importe`.
- Bereich "Naechste Schritte" zeigt SMTP, Rechtliches, Pilotkommunen-Pruefung und Testkunden-Login als offene Betriebsaufgaben.
- Es wird keine neue Datenbanktabelle angelegt.

## Bewusst nicht im Scope
- Speicherbare, abhakebare Checkliste.
- SMTP-Einrichtung.
- Finale Impressums-, Datenschutz- oder AGB-Texte.
- Automatische Datenrecherche oder Web-Scraping.
- Loeschen oder Neuanlegen bestehender Testkunden wie MAB.

## Technische Notizen
- API: `GET /api/admin/pilot-readiness`
- Frontend: Admin-Seite `/admin/pilotstart`
- Datenquellen: `organizations`, `organization_memberships`, `municipalities`, `import_runs`
- "Bald ablaufend": Zugriff endet innerhalb der naechsten 14 Tage.
- "Aktuell genug": `datenstand >= 2025-01-01`.
- "Quellenfaehig": `quellenstatus = bestaetigt` und `quellenname` ist gesetzt.

## Edge Cases
- Keine Kundenorganisationen vorhanden: Tabelle zeigt leeren Zustand.
- Keine Gemeinden vorhanden: Prozentwerte bleiben 0 und erzeugen keinen Fehler.
- Zugriff ohne Ablaufdatum: Anzeige "unbegrenzt", kein Risiko.
- Organisation gesperrt, abgelaufen oder mit abgelaufenem Datum: kritischer Hinweis.
- Importhistorie fehlt: Dashboard bleibt nutzbar.

## Dependencies
- Requires: PROJ-8 Mandantenfaehige Nutzerverwaltung
- Requires: PROJ-12 Self-Service-Auth und Audit-Log
- Requires: PROJ-4 Import- und Quellenpipeline
- Builds on: PROJ-9 Datenvertrauen und Demo-Daten

## QA Test Results
**Date:** 2026-05-25

### Automated Checks
- `npm.cmd run lint`: passed
- `npm.cmd run build`: passed

### Acceptance Criteria
- `/admin/pilotstart` route exists and is included in the production build: passed
- `GET /api/admin/pilot-readiness` route exists and is included in the production build: passed
- Admin tabs include "Pilotstart": passed
- No new database migration or table was added: passed
- Dashboard covers organization, onboarding, data quality and next-step sections: passed

### Manual Notes
- Full browser check with a real Admin session is still recommended before deployment.
- Port 3000 was already occupied by another local Next.js worktree during verification, so visual inspection was limited to build output and route compilation.
