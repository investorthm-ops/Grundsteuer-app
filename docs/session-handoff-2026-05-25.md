# Session-Handoff 2026-05-25

## Aktueller Stand

- Branch: `main`
- Letzter Commit: `9249c05 fix(PROJ-13): improve password recovery guidance`
- GitHub: Push auf `origin/main` erledigt
- Arbeitsbaum nach Push: sauber
- Letzte technische Pruefung: `npm.cmd run lint` und `npm.cmd run build` erfolgreich

## Produktstand

Der GrundsteuerMonitor ist als MVP inzwischen deutlich vorzeigbar:

- Startseite und App-Navigation sind produktnah gestaltet.
- Suche, Datenbank, Vergleich, Rechner, Watchlist und Export sind vorhanden.
- Admin kann Kundenorganisationen verwalten.
- Nutzer können eingeladen werden.
- Passwort-Setzen und Passwort-Reset sind eingebaut.
- `/mein-zugang` zeigt Organisation, Rolle und Zugriffslaufzeit.
- Admin-Aktionen werden im Audit-Log protokolliert.
- Disclaimer, Datenschutz, Impressum-Platzhalter und Legal-Footer sind vorhanden.

## Heute geklaert

- Vercel Production ENV ist eingerichtet:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Supabase Auth Redirect URLs sind für Produktion und Localhost gesetzt.
- Supabase E-Mail-Templates für Invite und Reset sind deutsch und nutzen `{{ .ConfirmationURL }}`.
- Passwort-Reset-Problem bei MAB wurde analysiert:
  - Supabase Auth Logs zeigen `429: email rate limit exceeded`.
  - Ursache ist das Supabase-Default-Mail-Limit, nicht die App-Logik.
- Browserfehler `Invalid Refresh Token: Refresh Token Not Found` wurde im Code abgefangen.
- Abgelaufene oder ungültige Passwort-Links zeigen jetzt eine bessere Nutzerhilfe.

## Kritische offene Punkte

1. **SMTP für Auth-Mails**
   - Supabase Default-Mailer ist für Pilotkunden zu wackelig.
   - Später eigenen SMTP-Anbieter einrichten, z. B. Brevo, Resend, Mailgun, Postmark oder SendGrid.
   - Erwartete MVP-Kosten grob: 0 bis 20 EUR pro Monat.

2. **MAB pausiert**
   - Nutzer existiert in Supabase: `djibril.brand@gmail.com`
   - Organisation `Testkunde MAB` nicht löschen.
   - Reset erst wieder testen, wenn Rate Limit abgelaufen ist oder SMTP eingerichtet wurde.

3. **Rechtliches finalisieren**
   - Impressum braucht echte Betreiberangaben.
   - Datenschutzerklaerung braucht finale Angaben zu Verantwortlichem, Vercel, Supabase, Regionen, AV-Vertraegen und Mailanbieter.
   - AGB vor zahlenden Kunden finalisieren.

4. **Datenqualität**
   - Disclaimer ist eingebaut.
   - Vor zahlenden Kunden müssen Datenabdeckung, Quellenstatus und Aktualität weiter verbessert werden.

5. **Eigene Domain**
   - Geplante Hauptdomain: `grundsteuermonitor.de`.
   - Domain ist noch nicht gekauft.
   - Kauf, Vercel-Domain-Zuordnung, DNS-Records und Supabase-Auth-Umstellung werden später gemeinsam eingerichtet.
   - Repo ist vorbereitet: Security Headers, Domain-Doku und Production-Readiness-Checkliste sind vorhanden.

6. **Konnektoren und MCP**
   - Projektstandard ist in `docs/project-connectors.md` dokumentiert.
   - Direkt sinnvoll nutzbar: GitHub, Vercel, Supabase, Browser/Playwright und Google Drive/Sheets.
   - Später ergänzen: Sentry, PostHog oder Vercel Analytics, Stripe und ein verlässlicher SMTP-Anbieter.
   - Lokaler MCP-Importserver liegt vorbereitet in `mcp/`, ist aber nicht automatisch aktiv.

## Nächster sinnvoller Einstieg

Empfohlener Start für die nächste Session:

1. `git status --short` prüfen.
2. Live-Deployment nach letztem Push prüfen.
3. Entscheiden, ob PROJ-14 werden soll:
   - Option A: Datenqualitäts-Dashboard für Admins
   - Option B: Pilotkunden-Onboarding verbessern
   - Option C: SMTP/Produktions-Mailversand vorbereiten
   - Option D: Impressum/Datenschutz mit echten Angaben finalisieren

Meine Empfehlung: **PROJ-14 Pilotkunden-Onboarding und Datenqualität**. SMTP bleibt als Produktionspunkt wichtig, muss aber erst entschieden werden, wenn ein Mailanbieter ausgewählt ist.
