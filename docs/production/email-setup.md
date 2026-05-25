# E-Mail-Setup für GrundsteuerMonitor

Ziel: Mails von und an eine eigene Adresse `@grundsteuermonitor.de` empfangen und versenden — sowohl für persönliche Kommunikation (Kontakt, DSGVO-Anfragen) als auch für automatische App-Mails (Einladung, Passwort-Reset).

Diese Anleitung ist click-by-click formuliert. Markus führt die Klicks aus, Claude begleitet und liefert die exakten Werte (DNS-Zeilen, Resend-Konfiguration, Supabase-SMTP-Eintrag).

## Zwei Bausteine, zwei Anbieter

| Baustein | Aufgabe | Anbieter | Kosten |
|---|---|---|---|
| **A) Postfach** | Mails empfangen (`info@`, `kontakt@`) | Mailbox.org | 1 € / Monat |
| **B) App-Versand** | Auth-Mails verschicken (`noreply@`) | Resend | 0 € (bis 3.000 Mails/Monat) |

**Gesamtkosten:** ~1 € / Monat in der Pilotphase. Bei mehr als 3.000 App-Mails wird Resend kostenpflichtig (ab ~20 USD/Monat für 50.000 Mails).

## Voraussetzungen

- Domain `grundsteuermonitor.de` ist gekauft und steht in deinem Domain-Anbieter-Account (siehe `docs/production/custom-domain.md`).
- Du hast Zugriff auf die DNS-Verwaltung der Domain.
- Vercel-Custom-Domain-Setup ist abgeschlossen oder parallel in Arbeit.

## Schritt-für-Schritt

### 1. Mailbox.org-Account anlegen

1. `mailbox.org` öffnen.
2. „Kostenlos testen" oder direkt „Tarife" anklicken.
3. Tarif „Mail Standard" wählen (1 €/Monat, 2 GB, eigene Domain inklusive).
4. Account-Daten eintragen (Benutzername wird zu `<benutzer>@mailbox.org`, aber wir nutzen später nur die Custom-Domain).
5. Zahlungsmethode hinterlegen.
6. E-Mail-Bestätigung abwarten und Account aktivieren.

### 2. Mailbox.org: Custom Domain hinzufügen

1. Einloggen in `mailbox.org` Webmail.
2. Oben rechts → „Einstellungen" → „Eigene Domains".
3. „Domain hinzufügen" → `grundsteuermonitor.de` eintragen.
4. Mailbox.org zeigt **zwei DNS-Werte** an:
   - 1× MX-Eintrag
   - 1× TXT-Eintrag (Domain-Verifikation)
5. Beide Werte stehenlassen, im nächsten Schritt setzen wir sie. Tab nicht schließen.

### 3. Resend-Account anlegen

1. `resend.com` öffnen → „Sign up".
2. Account mit E-Mail anlegen (kannst deine bestehende Gmail nutzen).
3. Free-Tier ist automatisch aktiv (3.000 Mails/Monat, 100/Tag).
4. Im Dashboard: „Domains" → „Add Domain" → `grundsteuermonitor.de` eintragen.
5. Region wählen: **Frankfurt (eu-west-1)** für DSGVO-Konformität.
6. Resend zeigt **drei DNS-Werte** an:
   - SPF (TXT)
   - DKIM (TXT)
   - DMARC (TXT) — optional, aber empfohlen
7. Werte stehenlassen, Tab nicht schließen.

### 4. DNS-Einträge bei deinem Domain-Anbieter setzen

Du hast jetzt **fünf bis sechs DNS-Werte** offen: 2 von Mailbox.org, 3 von Resend.

Konkrete Reihenfolge bei deinem Domain-Anbieter (z. B. INWX, Hetzner, IONOS):

1. DNS-Verwaltung für `grundsteuermonitor.de` öffnen.
2. Alle Werte einzeln eintragen — die genaue Vorlage findest du in `docs/production/email-dns-records.md`.
3. Wichtig: **SPF-Eintrag nur einmal pro Domain.** Wenn schon ein SPF-Eintrag existiert (z. B. von Vercel), müssen die Werte zusammengeführt werden — Claude hilft dir dabei.
4. Speichern.
5. **15–30 Minuten warten**, bis die DNS-Einträge weltweit verteilt sind.

### 5. Verifikation in Mailbox.org und Resend abwarten

1. Zurück in **Mailbox.org**: „Eigene Domains" neu laden → Domain sollte als „verifiziert" markiert sein. Wenn nicht, weiter warten und nach 30 Minuten erneut prüfen.
2. Zurück in **Resend**: „Domains" → Status sollte auf „Verified" springen (grünes Häkchen bei allen drei Einträgen).

Wenn nach 1 Stunde noch nicht verifiziert: Claude prüft via `nslookup` oder `dig`, ob die Einträge korrekt gesetzt sind.

### 6. Postfächer in Mailbox.org anlegen

1. In Mailbox.org → „Einstellungen" → „Eigene Domains" → bei `grundsteuermonitor.de` auf „Adressen verwalten".
2. Neue Adressen anlegen:
   - `info@grundsteuermonitor.de` (Hauptadresse für Kontakt)
   - optional: `kontakt@grundsteuermonitor.de`, `datenschutz@grundsteuermonitor.de`
3. Alle Adressen können auf dasselbe Postfach laufen oder auf separate.
4. Einmal testen: in einem anderen Postfach (z. B. deiner Gmail) eine Mail an `info@grundsteuermonitor.de` schicken → muss in Mailbox.org ankommen.

### 7. Resend: Absender-Adresse `noreply@grundsteuermonitor.de` aktivieren

1. In Resend → „API Keys" → „Create API Key" → Name z. B. `supabase-prod` → Permission „Sending access" → Domain `grundsteuermonitor.de`.
2. Den API-Key kopieren und sicher speichern (zeigt Resend nur einmal an).
3. **Diesen API-Key gibt Markus an Claude weiter? NEIN.** Claude tippt keinen Secret. Markus trägt ihn im nächsten Schritt direkt in Supabase ein.

### 8. Supabase: Auth auf Custom SMTP umstellen

1. `supabase.com` → Projekt `grundsteuer-monitor` öffnen.
2. Linke Seitenleiste → „Authentication" → Tab „Emails" → Bereich „SMTP Settings".
3. „Enable Custom SMTP" einschalten.
4. Felder ausfüllen:
   - **Sender email:** `noreply@grundsteuermonitor.de`
   - **Sender name:** `GrundsteuerMonitor`
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** der API-Key aus Schritt 7
5. Speichern.
6. „Send test email" → eigene Adresse eintragen → Mail muss ankommen, Absender `noreply@grundsteuermonitor.de`.

### 9. Supabase: Auth-URL-Config prüfen

Wenn Custom-Domain auf Vercel auch live ist (siehe `docs/production/custom-domain.md`):

1. Supabase → „Authentication" → „URL Configuration".
2. **Site URL:** `https://grundsteuermonitor.de`
3. **Redirect URLs** enthalten:
   - `https://grundsteuermonitor.de/passwort-setzen`
   - `https://grundsteuermonitor.de/**`
   - `http://localhost:3000/**`

### 10. End-to-End-Test

Drei Tests, die du selbst klicken solltest:

1. **Empfangen:** Aus deiner Gmail (oder einem anderen externen Account) eine Mail an `info@grundsteuermonitor.de` → kommt in Mailbox.org an?
2. **App-Versand:** In der App `/admin/kunden` → einen Testkunden einladen → Einladungsmail muss von `noreply@grundsteuermonitor.de` kommen, nicht von der Supabase-Standardadresse.
3. **Spam-Check:** Aus Mailbox.org eine Mail an deine Gmail schicken → darf nicht im Spam landen. Falls doch: DKIM/SPF-Einträge nochmal prüfen.

## Mailto-Links im Repo anpassen (nach erfolgreichem Setup)

Wenn alles läuft, müssen die `mailto:`-Links im Projekt von der Gmail-Adresse auf die neue umgestellt werden. Claude erledigt das als kleinen PR. Betroffene Stellen:

- `src/app/mein-zugang/...` (Kontakt, DSGVO-Löschung)
- Impressum-Seite
- Kontakt-Seite

## Was schiefgehen kann (typische Stolperfallen)

| Problem | Ursache | Lösung |
|---|---|---|
| Domain bleibt in Mailbox.org/Resend „pending" | DNS noch nicht verteilt | 30–60 min warten, dann `nslookup` |
| Mehrere SPF-Einträge | Eintrag schon von Vercel/Hosting da | SPF zusammenführen in einen einzigen Eintrag |
| Auth-Mails landen im Spam | DKIM fehlt oder DMARC zu streng | DKIM-Eintrag prüfen, DMARC auf `p=quarantine` lockern |
| Mailbox.org bekommt keine Mails | MX-Eintrag fehlt oder falsche Priorität | MX-Wert exakt wie von Mailbox.org vorgegeben |
| Supabase-Testmail schlägt fehl | API-Key falsch eingetragen oder Port-Block | Username muss `resend` sein (nicht der Account), Port 465 mit SSL |

## Sicherheits-Hinweise

- Der Resend-API-Key ist ein Secret. Niemals ins Repo committen, niemals in Screenshots.
- Falls der Key versehentlich öffentlich wird: in Resend → API Keys → den alten Key sofort revoken und neuen erstellen.
- Mailbox.org-Zugang mit 2-Faktor-Authentifizierung schützen (in den Einstellungen aktivierbar).
- Resend-Account ebenfalls mit 2FA absichern.
