# Kunden-Onboarding — Standardablauf

> Diese Anleitung beschreibt, wie ein neuer Kunde im Grundsteuer-Monitor angelegt und freigeschaltet wird. Ablauf ab PROJ-12 (Self-Service-Auth).

## Voraussetzungen

- Du bist im Admin-Bereich eingeloggt (`/admin/kunden`)
- Du hast vom Kunden: **voller Name**, **E-Mail-Adresse**, **gewünschte Laufzeit**

## Schritt 1 — Organisation anlegen

1. `/admin/kunden` öffnen
2. Im linken Formular **"Kunde anlegen"**:
   - **Name**: Firmenname oder Privatperson, z.B. "Steuerberatung Mustermann"
   - **Status**: `Testphase` (Standard) oder `Aktiv`
   - **Zugang gültig bis**: Datum eintragen (z.B. drei Monate in Zukunft) oder leer lassen für unbefristet
   - **Notizen** (optional): Vertrieblicher Kontext
3. **"Kunde speichern"**

## Schritt 2 — Kunde einladen

1. Im rechten Formular **"Kunde per E-Mail einladen"**:
   - **Organisation**: Die soeben angelegte Org auswählen
   - **E-Mail**: Adresse des Kunden
   - **Voller Name**: Vorname Nachname
   - **Rolle**: `Member` (Standard) — `Owner` ist derzeit funktional identisch und für spätere Team-Funktionen vorgesehen
2. **"Einladung verschicken"**

Was jetzt passiert:
- Der Kunde bekommt eine E-Mail mit einem Bestätigungslink von Supabase.
- Klick auf den Link → Landing-Seite `/passwort-setzen`
- Kunde vergibt eigenes Passwort (mind. 10 Zeichen) → ist sofort eingeloggt und hat Zugriff auf alle App-Bereiche.

## Schritt 3 — Audit-Log prüfen (optional)

`/admin/audit-log` zeigt jede Aktion mit Zeitstempel:
- `Organisation angelegt`
- `Einladung verschickt`

Falls etwas nicht klappt: der "Anzeigen"-Button auf jedem Eintrag zeigt die genauen Payload-Daten.

## Häufige Sonderfälle

### Der Kunde hat die Mail nicht bekommen
- Spam-Ordner prüfen lassen
- E-Mail-Schreibweise verifizieren
- Im Zweifel: nochmal "Einladung verschicken" → Supabase erkennt den vorhandenen User und schickt eine erneute Einladung
- Wenn ein Tippfehler in der E-Mail war: bisher keine Self-Service-Korrektur — Kunde mit korrekter E-Mail neu einladen, alten Eintrag aus `auth.users` in Supabase-Console löschen

### Der Kunde hat sein Passwort vergessen
- Kunde nutzt selbst den Link **"Passwort vergessen?"** unter dem Login-Formular
- Bekommt automatisch eine Reset-Mail, landet auf `/passwort-setzen`
- Kein Admin-Eingriff nötig

### Laufzeit verlängern
- `/admin/kunden` → Kunden anklicken → "Zugang gültig bis" anpassen → speichern
- Audit-Log dokumentiert die Änderung (vorher/nachher-Diff)

### Zugang sperren
- Status auf `Gesperrt` setzen
- Bei der nächsten Aktion wird der Kunde auf `/zugang-gesperrt` umgeleitet
- Login bleibt möglich, App-Bereiche sind blockiert

### Bestehender Supabase-User per UUID zuordnen (Sonderfall)
- Nur wenn der User schon manuell in Supabase Auth angelegt wurde
- Im Customer-Manager unten: **"Erweitert: Bestehenden Supabase-Nutzer per UUID zuordnen"** ausklappen
- UUID aus Supabase-Console → Authentication kopieren

## Was im Hintergrund passiert (Kurzfassung)

1. **Einladung**: `supabase.auth.admin.inviteUserByEmail()` erzeugt einen `auth.users`-Eintrag ohne Passwort und versendet eine E-Mail mit Magic-Link.
2. **Membership**: gleichzeitig wird ein Eintrag in `organization_memberships` angelegt (`user_id` ↔ `organization_id`, Rolle).
3. **Passwort-Setzung**: Magic-Link erzeugt eine temporäre Session → `/passwort-setzen` ruft `supabase.auth.updateUser({ password })`.
4. **Zugriffsprüfung**: bei jedem Request prüft die Middleware Org-Status + Laufzeit (`getAccessState`) → blockt oder lässt durch.
5. **Audit**: jede Admin-Schreibaktion landet in `admin_audit_log` (Tabelle hat nur SELECT-Policy für Admins, geschrieben wird via Service-Role-Key serverseitig).
