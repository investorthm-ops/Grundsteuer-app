# Production-Readiness fuer GrundsteuerMonitor

Diese Checkliste beschreibt, was vor einem echten Pilotkunden in Vercel und Supabase stimmen muss. Sie ist bewusst praktisch formuliert und ersetzt keine rechtliche Pruefung.

## Status im Code

Erledigt im Repo:

- `/mein-zugang` ist in der Middleware als geschuetzter Auth-Pfad hinterlegt.
- `.env.local.example` nennt alle benoetigten Supabase-Variablen inklusive `SUPABASE_SERVICE_ROLE_KEY`.
- Der Service-Role-Key wird im Code nur ueber `src/lib/supabase/admin-client.ts` verwendet.
- Der Service-Role-Key wird serverseitig fuer Einladungen und Audit-Log-Schreibvorgaenge genutzt.
- Build und Lint koennen lokal gegen die vorhandenen Variablen laufen.

## Vercel Environment Variables

In Vercel unter Project Settings -> Environment Variables pruefen:

| Variable | Zweck | Umgebung |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase-Projekt-URL fuer App und Server | Production und Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase-Anon-Key fuer User-Session/RLS | Production und Preview |
| `NEXT_PUBLIC_SITE_URL` | Oeffentliche App-URL fuer Invite- und Reset-Links | Production und Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Admin-Key fuer Invite und Audit-Log | Production und Preview |

Wichtig:

- `SUPABASE_SERVICE_ROLE_KEY` darf niemals mit `NEXT_PUBLIC_` beginnen.
- Der Key darf nicht im Browser-Code, in Screenshots, Tickets oder Mails auftauchen.
- Nach Aenderungen an Vercel-Variablen neu deployen.

## Supabase Datenbank

In Supabase pruefen:

- Migration `0009_admin_audit_log.sql` ist angewendet.
- Migration `0010_allow_members_read_own_organization.sql` ist angewendet.
- Tabelle `admin_audit_log` existiert.
- RLS ist auf `admin_audit_log` aktiv.
- Normale Nutzer koennen `admin_audit_log` nicht schreiben.
- Mitglieder koennen ihre eigene Organisation lesen.

Ein schneller SQL-Check im Supabase SQL Editor:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('admin_audit_log', 'organizations', 'organization_memberships');
```

## Supabase Auth

In Supabase Authentication pruefen:

- Site URL zeigt auf die produktive Domain.
- Redirect URL enthaelt `https://<deine-domain>/passwort-setzen`.
- Invite-Mail fuehrt auf `/passwort-setzen`.
- Passwort-Reset-Mail fuehrt auf `/passwort-setzen`.
- E-Mail-Templates sind auf Deutsch und enthalten keine verwirrenden Standardtexte.
- Optional: eigener SMTP-Absender ist eingerichtet, bevor viele Pilotkunden eingeladen werden.

## Manueller End-to-End-Test

Vor Pilotkunde einmal komplett testen:

1. In der App als Admin einloggen.
2. Neue Test-Organisation anlegen.
3. Testnutzer per Einladung anlegen.
4. Mail empfangen und Passwort setzen.
5. Als Testnutzer einloggen.
6. `/mein-zugang` oeffnen und Organisation, Rolle, Laufzeit pruefen.
7. Datenbank, Vergleich, Rechner und Watchlist kurz oeffnen.
8. Als Admin `/admin/audit-log` oeffnen und pruefen, ob Aktionen sichtbar sind.
9. Passwort-vergessen-Flow fuer den Testnutzer pruefen.

## Rechtliches und Datenschutz

Vor zahlenden Kunden offen:

- Impressum mit echten Betreiberangaben finalisieren.
- Datenschutzerklaerung mit Verantwortlichem, Vercel, Supabase, Regionen und AV-Vertraegen ergaenzen.
- AGB und Haftungsausschluss finalisieren.
- Vercel Plan, Analytics, Speed Insights und Log-Speicherdauer dokumentieren.
- Supabase Region, Auth-Mail-Provider, Backups und Log-Speicherdauer dokumentieren.

Details stehen in `docs/legal-checklist.md` und `docs/privacy-dsgvo-notes.md`.
