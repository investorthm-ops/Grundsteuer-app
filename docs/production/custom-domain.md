# Eigene Domain für GrundsteuerMonitor

Ziel: Die App läuft unter `https://grundsteuermonitor.de`. Die `www`-Variante leitet auf die Hauptdomain weiter.

## 1. Domain vorbereiten

- Domain kaufen oder in den eigenen Account übernehmen: `grundsteuermonitor.de`
- DNS-Verwaltung beim Anbieter öffnen
- Alte A-/CNAME-Records prüfen, damit keine widersprüchlichen Einträge bestehen

## 2. Vercel konfigurieren

Im Vercel-Projekt unter **Settings -> Domains**:

1. `grundsteuermonitor.de` hinzufügen.
2. `www.grundsteuermonitor.de` hinzufügen.
3. `grundsteuermonitor.de` als Primary Domain setzen.
4. `www.grundsteuermonitor.de` auf `grundsteuermonitor.de` weiterleiten.
5. DNS-Hinweise von Vercel übernehmen und SSL-Status abwarten.

## 3. DNS setzen

Die exakten Werte aus Vercel übernehmen. Typischer Aufbau:

| Host | Typ | Ziel |
|---|---|---|
| `@` | A | Vercel-Apex-Ziel |
| `www` | CNAME | Vercel-CNAME-Ziel |

Nach DNS-Änderungen kann die Aktivierung je nach Anbieter einige Minuten bis mehrere Stunden dauern.

## 4. Vercel Environment ändern

In Vercel unter **Settings -> Environment Variables**:

```text
NEXT_PUBLIC_SITE_URL=https://grundsteuermonitor.de
```

Danach einen neuen Production Deploy auslösen.

## 5. Supabase Auth ändern

In Supabase unter **Authentication -> URL Configuration**:

- Site URL: `https://grundsteuermonitor.de`
- Redirect URLs:
  - `https://grundsteuermonitor.de/passwort-setzen`
  - `https://grundsteuermonitor.de/**`
  - `http://localhost:3000/**`

Für Preview-Deployments optional zusätzlich das Vercel Preview Pattern ergänzen.

## 6. E-Mail-Templates prüfen

In Supabase Auth Templates:

- Invite-Template nutzt `{{ .ConfirmationURL }}`
- Reset-Template nutzt `{{ .ConfirmationURL }}`
- Beide Texte sind deutsch
- Beide Flows führen auf `/passwort-setzen`

## 7. Abnahmetest

- `https://grundsteuermonitor.de` lädt die App
- `https://www.grundsteuermonitor.de` leitet weiter
- HTTP leitet auf HTTPS
- Admin Login funktioniert
- Einladung an Testnutzer funktioniert
- Passwort setzen und Passwort vergessen landen auf der neuen Domain
- `/admin/pilotstart`, `/admin/kunden`, `/admin/datenbank`, `/admin/audit-log` funktionieren
- Response Headers enthalten die Security Headers aus `next.config.ts`
