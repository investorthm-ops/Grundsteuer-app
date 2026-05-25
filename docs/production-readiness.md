# Production-Readiness für GrundsteuerMonitor

Diese Checkliste beschreibt, was vor einem echten Pilotkunden in Vercel und Supabase stimmen muss. Sie ist bewusst praktisch formuliert und ersetzt keine rechtliche Prüfung.

## Status im Code

Erledigt im Repo:

- `/mein-zugang` ist in der Middleware als geschützter Auth-Pfad hinterlegt.
- `.env.local.example` nennt alle benötigten Supabase-Variablen inklusive `SUPABASE_SERVICE_ROLE_KEY`.
- Der Service-Role-Key wird im Code nur über `src/lib/supabase/admin-client.ts` verwendet.
- Der Service-Role-Key wird serverseitig für Einladungen und Audit-Log-Schreibvorgänge genutzt.
- Security Headers sind in `next.config.ts` hinterlegt.
- Build und Lint können lokal gegen die vorhandenen Variablen laufen.

## Eigene Domain

Ziel für den Pilotbetrieb:

- Hauptdomain: `https://grundsteuermonitor.de`
- `https://www.grundsteuermonitor.de` leitet auf die Hauptdomain weiter.
- Pilotkunden bekommen nur die Hauptdomain genannt.

In Vercel unter Project Settings -> Domains:

1. `grundsteuermonitor.de` hinzufügen.
2. `www.grundsteuermonitor.de` hinzufügen.
3. `grundsteuermonitor.de` als Primary Domain setzen.
4. `www.grundsteuermonitor.de` auf die Primary Domain weiterleiten.
5. SSL-Zertifikat abwarten, bis Vercel die Domain als gültig markiert.

Beim Domainanbieter DNS setzen:

| Host | Typ | Ziel |
|---|---|---|
| `@` | A | Vercel-Apex-Ziel aus dem Vercel-Dashboard |
| `www` | CNAME | Vercel-CNAME-Ziel aus dem Vercel-Dashboard |

Wichtig: Die exakten DNS-Werte immer aus Vercel übernehmen, weil Vercel projektbezogene Hinweise anzeigen kann.

## Vercel Environment Variables

In Vercel unter Project Settings -> Environment Variables prüfen:

| Variable | Zweck | Umgebung |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase-Projekt-URL für App und Server | Production und Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase-Anon-Key für User-Session/RLS | Production und Preview |
| `NEXT_PUBLIC_SITE_URL` | Öffentliche App-URL für Invite- und Reset-Links | Production und Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Admin-Key für Invite und Audit-Log | Production und Preview |

Wichtig:

- `SUPABASE_SERVICE_ROLE_KEY` darf niemals mit `NEXT_PUBLIC_` beginnen.
- Der Key darf nicht im Browser-Code, in Screenshots, Tickets oder Mails auftauchen.
- Production-Wert für `NEXT_PUBLIC_SITE_URL`: `https://grundsteuermonitor.de`
- Nach Änderungen an Vercel-Variablen neu deployen.

## Supabase Datenbank

In Supabase prüfen:

- Migration `0009_admin_audit_log.sql` ist angewendet.
- Migration `0010_allow_members_read_own_organization.sql` ist angewendet.
- Tabelle `admin_audit_log` existiert.
- RLS ist auf `admin_audit_log` aktiv.
- Normale Nutzer können `admin_audit_log` nicht schreiben.
- Mitglieder koennen ihre eigene Organisation lesen.

Ein schneller SQL-Check im Supabase SQL Editor:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('admin_audit_log', 'organizations', 'organization_memberships');
```

## Supabase Auth

In Supabase Authentication prüfen:

- Site URL: `https://grundsteuermonitor.de`
- Redirect URLs enthalten:
  - `https://grundsteuermonitor.de/passwort-setzen`
  - `https://grundsteuermonitor.de/**`
  - `http://localhost:3000/**`
  - optional: Vercel Preview URL Pattern für Tests
- Invite-Mail führt auf `/passwort-setzen`.
- Passwort-Reset-Mail führt auf `/passwort-setzen`.
- E-Mail-Templates sind auf Deutsch und enthalten keine verwirrenden Standardtexte.
- Optional: eigener SMTP-Absender ist eingerichtet, bevor viele Pilotkunden eingeladen werden.

## Security Headers

Nach Deployment in den Browser DevTools unter Network -> Response Headers prüfen:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

## Manueller End-to-End-Test

Vor Pilotkunde einmal komplett testen:

1. In der App als Admin einloggen.
2. Neue Test-Organisation anlegen.
3. Testnutzer per Einladung anlegen.
4. Mail empfangen und Passwort setzen.
5. Als Testnutzer einloggen.
6. `/mein-zugang` öffnen und Organisation, Rolle, Laufzeit prüfen.
7. Datenbank, Vergleich, Rechner und Watchlist kurz öffnen.
8. Als Admin `/admin/pilotstart`, `/admin/kunden`, `/admin/datenbank` und `/admin/audit-log` öffnen.
9. Passwort-vergessen-Flow für den Testnutzer prüfen.
10. Prüfen, dass keine Weiterleitung mehr auf localhost oder alte Vercel-URLs zeigt.

## Rechtliches und Datenschutz

Vor zahlenden Kunden offen:

- Impressum mit echten Betreiberangaben finalisieren.
- Datenschutzerklärung mit Verantwortlichem, Vercel, Supabase, Regionen und AV-Verträgen ergänzen.
- AGB und Haftungsausschluss finalisieren.
- Vercel Plan, Analytics, Speed Insights und Log-Speicherdauer dokumentieren.
- Supabase Region, Auth-Mail-Provider, Backups und Log-Speicherdauer dokumentieren.

Details stehen in `docs/legal-checklist.md` und `docs/privacy-dsgvo-notes.md`.
