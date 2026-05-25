# Handout — Userverwaltungs-Konzept Grundsteuer-Monitor

> Für Markus, zum Nachlesen vor dem Code-Review. Stand: 24.05.2026, nach PROJ-12 (Self-Service-Auth + Audit-Log).

---

## 1. Das Mentale Modell — drei Schichten

Stell dir die Userverwaltung wie ein Bürogebäude vor:

| Schicht | Frage | Technik |
|---|---|---|
| **Auth** | "Wer bist du?" — Personalausweis | Supabase Auth (E-Mail + Passwort) |
| **Mandant** | "Zu welcher Firma gehörst du, ist die zahlend?" | Tabelle `organizations` + `organization_memberships` |
| **Rolle** | "Was darfst du im Gebäude?" | `user_roles` (Global-Admin) + `organization_memberships.role` (Owner/Member) |

Wichtig: **Auth allein reicht nicht.** Wer eingeloggt ist, kommt noch lange nicht in die App. Er muss zusätzlich Mitglied einer aktiven Organisation sein. Das ist der Punkt, an dem du als Admin die Kontrolle behältst.

---

## 2. Datenmodell — was steht in welcher Tabelle

### `auth.users` (Supabase verwaltet)
Identität: E-Mail, Passwort-Hash, eindeutige UUID. Diese Tabelle gehört Supabase, wir lesen sie nur über Auth-APIs.

### `user_roles`
Globale Admin-Rolle. Aktuell nur **du** stehst hier mit `role='admin'`. Wer hier steht, hat überall Zugriff — bypasst Org-Checks.

### `organizations`
Eine Zeile pro zahlendem Kunden / Pilotkunden.
- `name` — Anzeigename
- `status` — `trial` | `active` | `expired` | `blocked`
- `access_until` — Datum, bis wann der Zugang gilt (null = unbefristet)
- `notes` — interne Vertriebsnotizen

### `organization_memberships`
Verknüpft User mit Organisation. Heute gilt: **ein User kann nur in genau einer Org sein** (Unique-Constraint auf `user_id`).
- `role` — `owner` oder `member`. Heute funktional identisch, später relevant wenn Multi-User-Orgs kommen.

### `admin_audit_log` (neu mit PROJ-12)
Eine Zeile pro Admin-Schreibaktion. Wer hat wann was an welcher Org/Membership geändert. Wird **nur** vom Server geschrieben (Service-Role-Key), Admin-User können sie nur **lesen**.

---

## 3. Rollen — wer darf was

### Global-Admin (du)
- Sitzt in `user_roles`
- Sieht und ändert **alle** Organisationen
- Kann einladen, sperren, löschen
- Bypasst die Org-Statusprüfung — du kommst auch ohne aktive Org-Membership in die App rein

### Org-Member / Org-Owner (Kunde)
- Sitzt in `organization_memberships`
- Sieht und nutzt die App-Bereiche, wenn die Org `trial` oder `active` ist und `access_until` noch nicht abgelaufen ist
- Hat **keinen** Zugriff auf den Admin-Bereich
- Owner und Member sind heute gleich. Owner wird wichtig, wenn wir später Multi-User-Orgs einbauen (Owner darf dann sein Team verwalten).

### Eingeloggt, aber ohne Org
- Wird beim Aufruf von App-Bereichen auf `/zugang-gesperrt` umgeleitet
- Reason-Code: `no_organization`

### Eingeloggt, mit gesperrter / abgelaufener Org
- Wird ebenfalls auf `/zugang-gesperrt` umgeleitet
- Reason-Code: `blocked` oder `expired`

---

## 4. Lebenszyklus eines Kunden

```
Markus bekommt Kundenanfrage
        │
        ▼
[Admin-UI] Organisation anlegen (Status: trial, access_until: in 3 Monaten)
        │
        ▼
[Admin-UI] "Kunde per E-Mail einladen" (Name + E-Mail + Org)
        │           │
        │           ├─ supabase.auth.admin.inviteUserByEmail()
        │           │     → Eintrag in auth.users (kein Passwort)
        │           │     → Versand deutscher Bestätigungs-E-Mail
        │           │
        │           ├─ INSERT in organization_memberships
        │           │
        │           └─ INSERT in admin_audit_log
        ▼
Kunde klickt Link in E-Mail → /passwort-setzen
        │
        ▼
Kunde vergibt Passwort → supabase.auth.updateUser({ password })
        │
        ▼
Kunde ist eingeloggt → kommt durch Middleware-Prüfung →
        │                  (User vorhanden? ✓)
        │                  (Org-Status active/trial? ✓)
        │                  (access_until nicht abgelaufen? ✓)
        ▼
Hat Zugriff auf Datenbank, Vergleich, Watchlist, Rechner
        │
        ▼
... lebt in der App ...
        │
        ├─[Sonderfall] Passwort vergessen
        │       → Self-Service /passwort-vergessen → Reset-Mail → /passwort-setzen
        │
        ├─[Sonderfall] Laufzeit abgelaufen
        │       → /zugang-gesperrt (reason: expired)
        │       → Markus verlängert access_until
        │
        └─[Sonderfall] Gesperrt
                → Markus setzt Status: blocked → /zugang-gesperrt (reason: blocked)
```

---

## 5. Was an Code dahinter steckt — die Landkarte

| Was du im UI siehst | Datei | Was sie macht |
|---|---|---|
| Login-Form | `src/components/login-form.tsx` | E-Mail + Passwort → `signInWithPassword` |
| "Passwort vergessen?"-Link | dito (neu) | Verlinkt auf `/passwort-vergessen` |
| Passwort-vergessen-Seite | `src/app/passwort-vergessen/page.tsx` | Triggert `resetPasswordForEmail` |
| Passwort-setzen-Seite | `src/app/passwort-setzen/page.tsx` | Akzeptiert sowohl Invite- als auch Reset-Token. Ruft `updateUser({ password })` |
| Admin-Kundenmanager | `src/components/admin/customer-manager.tsx` | UI für alle Admin-Aktionen |
| Audit-Log-Seite | `src/app/admin/audit-log/page.tsx` | Liste der letzten 100 Admin-Aktionen |
| Middleware | `src/proxy.ts` | Prüft bei jedem Request: User? Admin? Org aktiv? |
| Org-Check-Logik | `src/lib/supabase/access.ts` | Sagt: darf der User rein oder nicht |
| Admin-Check | `src/lib/supabase/is-admin.ts` | Steht der User in `user_roles`? |
| Audit-Helper | `src/lib/supabase/audit.ts` | `logAdminAction()` — wird in allen Admin-Endpoints aufgerufen |
| Service-Role-Client | `src/lib/supabase/admin-client.ts` | Hat **alle Rechte** — nur server-side benutzen |

### Admin-API-Endpoints (alle nur für Global-Admin)
- `POST /api/admin/organizations` — Org anlegen
- `PATCH /api/admin/organizations/:id` — Org ändern
- `DELETE /api/admin/organizations/:id` — Org löschen (Memberships cascade)
- `POST /api/admin/memberships` — User per UUID zuordnen (Sonderfall)
- `PATCH /api/admin/memberships/:id` — Rolle ändern
- `DELETE /api/admin/memberships/:id` — User aus Org entfernen
- `POST /api/admin/invitations` — **neu**: User per E-Mail einladen + Membership anlegen
- `GET /api/admin/audit-log` — **neu**: Audit-Einträge abfragen

---

## 6. Sicherheitsprinzipien — warum das so gebaut ist

### Mehrschichtige Verteidigung (Defense in Depth)
Jede sensible Aktion wird auf **drei** Ebenen geprüft:
1. **Middleware** (`src/proxy.ts`) — fängt unauthentifizierte Requests vor dem Endpoint ab
2. **API-Route** — prüft `isAdmin()` bevor irgendetwas Schreibendes passiert
3. **Row Level Security in der Datenbank** — selbst wenn API-Code Bugs hat, lässt Postgres nicht zu, dass jemand fremde Org-Daten liest

Wenn auch nur eine Schicht durchlässt, fangen die anderen es.

### Service-Role-Key — die Atomwaffe
Der `SUPABASE_SERVICE_ROLE_KEY` umgeht **alle** RLS-Regeln. Deshalb:
- **Nie** in Client-Code referenzieren
- **Nie** mit `NEXT_PUBLIC_`-Prefix benennen
- **Nie** in Git committen
- Nur in `.env.local` lokal und in Vercel-ENV produktiv
- Im Code nur über `createSupabaseAdminClient()` zugänglich, der wirft einen Fehler wenn der Key fehlt

Wir brauchen ihn für zwei Sachen:
- Einladungen verschicken (`inviteUserByEmail` ist eine Admin-API)
- Audit-Log schreiben (die Tabelle hat keine INSERT-Policy für normale User)

### Keine User-Enumeration
Auf `/passwort-vergessen` zeigen wir **immer** dieselbe Erfolgsmeldung — egal ob die E-Mail existiert oder nicht. Sonst könnte jemand systematisch durchprobieren, welche E-Mails Kunden bei uns sind.

### Audit-Log ist unfälschbar (für Admins)
Selbst du als Global-Admin kannst Audit-Einträge nur **lesen**, nicht löschen oder bearbeiten. Das geht nur über den Service-Role-Key direkt in Supabase. Heißt: ein kompromittierter Admin-Account kann Spuren nicht verwischen.

### Passwort-Stärke
Mindestens 10 Zeichen. Bewusst keine komplexen Regex-Regeln — NIST empfiehlt seit Jahren: lieber lang als komplex. Längen-Validierung passiert sowohl im Client (UX) als auch im Schema (Zod).

---

## 7. Was bewusst NICHT gebaut wurde (und warum)

| Feature | Warum nicht | Wann später |
|---|---|---|
| **Self-Signup (öffentliche Registrierung)** | Du willst Kontrolle über Pilotkunden behalten, kein Spam, klare Liste wer drin ist | Wenn Geschäftsmodell validiert ist und automatisierter Verkauf läuft |
| **Multi-User pro Organisation** | Du wolltest erst verstehen, ob Kanzleien wirklich mehrere Sitze brauchen | Sobald ein konkreter Kunde danach fragt — wir lösen dann den Unique-Constraint auf `user_id` |
| **Profil-Selbstverwaltung** (Name, E-Mail ändern) | Nicht kritisch bei 10 Pilotkunden — du kannst es manuell machen | Wenn die Tickets dafür spürbar werden |
| **Account löschen durch User** | DSGVO-relevant, aber bei Pilotphase manuell handhabbar | Vor dem ersten zahlenden Kunden (Recht auf Löschung Art. 17 DSGVO) |
| **Magic-Link-Login (passwortlos)** | Passwort-Variante deckt deinen Anspruch ab, doppelte Wege wären Verwirrung | Falls Kunden es sich wünschen |
| **2FA / Sicherheitsschlüssel** | Overkill für MVP, niemand verarbeitet hier hochsensible Daten | Wenn ein Kunde es vertraglich verlangt |

---

## 8. Was du jetzt brauchst für Production

### Konfiguration in Supabase (manuell, einmalig)
1. **Service-Role-Key abholen**: Supabase-Dashboard → Project Settings → API → `service_role` (geheim!) kopieren
2. **In `.env.local` eintragen** (lokal): `SUPABASE_SERVICE_ROLE_KEY=...`
3. **In Vercel eintragen**: Project Settings → Environment Variables → `SUPABASE_SERVICE_ROLE_KEY` für Production und Preview
4. **E-Mail-Templates auf Deutsch**: Authentication → Email Templates → "Invite user" und "Reset Password". Beispiel-Text:

   *Betreff*: Willkommen beim Grundsteuer-Monitor
   *Body*:
   ```
   Hallo,

   du wurdest als Nutzer für den Grundsteuer-Monitor eingeladen.
   Klick auf den folgenden Link, um dein Passwort festzulegen und
   den Zugang zu aktivieren:

   {{ .ConfirmationURL }}

   Falls du die Einladung nicht erwartet hast, kannst du diese
   E-Mail ignorieren.

   Viele Grüße
   Grundsteuer-Monitor
   ```

5. **Site URL setzen**: Authentication → URL Configuration → `Site URL` = deine Prod-Domain. `Redirect URLs` muss `https://<deine-domain>/passwort-setzen` enthalten.

### Migration ausführen
- Datei: `supabase/migrations/0009_admin_audit_log.sql`
- Entweder via Supabase CLI (`supabase db push`) oder per Hand in SQL Editor

---

## 9. So testest du es morgen Schritt für Schritt

1. **Migration 0009** in Supabase ausführen → prüfen: `select * from admin_audit_log` gibt `[]` zurück.
2. **`SUPABASE_SERVICE_ROLE_KEY` setzen** in `.env.local`, dann `npm run dev`.
3. **Eigene Zweit-E-Mail einladen**:
   - Login als Admin → `/admin/kunden`
   - Test-Org anlegen
   - Einladen
4. **Mail empfangen**, Link klicken → solltest auf `/passwort-setzen` landen → Passwort vergeben → in der App.
5. **`/admin/audit-log`** öffnen → Org-Create und Invitation-Create sind sichtbar.
6. **Aus diesem Test-Account ausloggen** → `/passwort-vergessen` → eigene E-Mail eintragen → Reset-Mail kommt → neues Passwort vergeben.
7. **Sperre testen**: in `/admin/kunden` die Test-Org auf `Gesperrt` setzen → mit Test-Account einloggen → solltest auf `/zugang-gesperrt` landen.

---

## 10. Die ehrliche Einschätzung

**Was solide ist:** das Berechtigungsmodell, die Defense-in-Depth, das Audit-Log. Damit kannst du sauber 10–50 Pilotkunden händeln, ohne dass dir etwas um die Ohren fliegt.

**Was Aufmerksamkeit braucht:** die E-Mail-Templates in Supabase sind heute noch englisch — das wirkt nicht professionell wenn der erste Kunde die Mail bekommt. Setz dich morgen 15 Minuten mit den Templates hin.

**Was später kommt:** wenn ein Kunde "ich brauche 3 Sitze für mein Team" sagt, ist Multi-User die nächste Baustelle. Konzeptionell ist das eine 4-Stunden-Sache: Unique-Constraint lösen, Einladungsflow um "Owner lädt Team-Mitglied ein" erweitern, Rollen mit Bedeutung füllen.

**Was du dir merken kannst:** Du kontrollierst, wer rein kommt. Der Kunde kontrolliert sein Passwort. Du siehst alles, was du tust, im Audit-Log. Das ist das ganze Konzept in drei Sätzen.
