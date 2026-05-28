# Projekt-Konnektoren und MCP-Workflow

Diese Doku hält fest, welche Plugins und MCP-Konnektoren für den GrundsteuerMonitor genutzt werden sollen. Ziel ist ein klarer, wiederholbarer Arbeitsablauf für Entwicklung, Qualitätssicherung, Deployment und Pilotkundenbetrieb.

## Grundsatz

- Nur Konnektoren nutzen, die für die aktuelle Aufgabe einen klaren Nutzen haben.
- Keine Secrets in Prompts, Screenshots, Tickets oder Dokumentation kopieren.
- Supabase-Service-Role-Keys nur lokal oder in Vercel-Umgebungsvariablen verwenden.
- Schreibzugriffe in produktiven Systemen vorher bewusst bestätigen.
- Bei sichtbaren deutschen Texten echte Umlaute und ß verwenden.

## Bereits sinnvoll nutzbar

| Konnektor | Status | Nutzen im Projekt |
|---|---|---|
| GitHub | aktiv nutzbar | Repository prüfen, Branches, Commits, PRs, Reviews und CI-Status verwalten |
| Vercel | aktiv nutzbar, aktuell mit begrenztem Schreibumfang | Deployments, Domain-Verfügbarkeit, Projekt- und Deployment-Kontext prüfen |
| Supabase | aktiv nutzbar, aktuell mit begrenztem Schreibumfang | Supabase-Doku suchen, Projektkontext prüfen, Datenbank- und Auth-Themen vorbereiten |
| Browser/Playwright | aktiv nutzbar | Lokale App auf `localhost:3000` testen, UI prüfen, Admin-Flows visuell kontrollieren |
| Google Drive/Sheets | aktiv nutzbar bei Bedarf | Pilotkundenlisten, Datenquellen, Importlisten und Prüfchecklisten auswerten |

## Projektinterner MCP-Server

Im Ordner `mcp/` liegt ein vorbereiteter lokaler MCP-Server für den Hebesatz-Import:

- Datei: `mcp/grundsteuer_import_mcp.py`
- Zweck: Datenquellen prüfen, Hebesätze abrufen, Gemeinden suchen und optional nach Supabase importieren.
- Status: vorbereitet, aber nicht automatisch aktiv.
- Voraussetzung: Python-Abhängigkeiten, GENESIS-Zugangsdaten und bewusst gesetzte Supabase-Importvariablen.

Wichtig: Der direkte Supabase-Import nutzt einen Service-Key. Deshalb nur mit Dry-Run testen und erst nach Datenprüfung schreibend ausführen.

## Empfohlener Standard-Workflow

1. **Vor Entwicklung**
   - `git status --short` prüfen.
   - Offene Projektpunkte in `features/INDEX.md` und `docs/production-readiness.md` prüfen.

2. **Während Entwicklung**
   - GitHub für Branch-/PR-Kontext nutzen.
   - Supabase nur mit klarer Aufgabe einsetzen, zum Beispiel SQL-Prüfung, RLS-Fragen oder Auth-Konfiguration.
   - Vercel für Deployment-, Domain- und Build-Kontext nutzen.

3. **Nach UI-Änderungen**
   - Browser/Playwright auf `localhost:3000` verwenden.
   - Desktop und mobile Breite prüfen.
   - Besonders prüfen: Header, Tabellen, Adminseiten, Umlaute, Button-Texte.

4. **Vor Pilotkunden**
   - `/admin/pilotstart` prüfen.
   - Supabase Auth Redirects und E-Mail-Templates prüfen.
   - Vercel Production-Deploy prüfen.
   - Security Headers prüfen.
   - Testeinladung vollständig durchspielen.

## Später ergänzen

| Kandidat | Empfehlung | Grund |
|---|---|---|
| Sentry | als nächster Produktionsbaustein | Fehler vor Pilotkunden erkennen, statt auf Nutzerhinweise zu warten |
| PostHog oder Vercel Analytics | nach Pilotstart | Nutzung von Suche, Vergleich, Watchlist und Export verstehen |
| Stripe | erst bei Zahlungsmodell | Kunden, Abos, Rechnungen und Zahlungsstatus verwalten |
| Resend, Postmark oder Brevo | dringend für Produktions-Mailversand | Supabase Default-Mailer ist für Pilotkunden zu limitiert |

## Nicht priorisiert

- Canva und Präsentations-Plugins: sinnvoll für Vertriebsmaterial, nicht für den App-Betrieb.
- Gmail und Calendar: nützlich für Pilotkunden-Kommunikation, aber kein Kernbaustein der Anwendung.
- Weitere generische MCP-Server: nur nach Sicherheitsprüfung und mit klar begrenzten Rechten.
