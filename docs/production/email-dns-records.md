# DNS-Einträge für E-Mail-Setup

Referenz-Karte für Schritt 4 aus `docs/production/email-setup.md`.

Diese Datei enthält **Platzhalter**. Die exakten Werte liefern Mailbox.org und Resend, wenn die Domain dort angemeldet ist. Claude trägt sie zur Setup-Session in diese Tabelle ein.

## Übersicht aller benötigten Einträge

| # | Host | Typ | Wert (von wo) | Zweck |
|---|---|---|---|---|
| 1 | `@` | MX | wird von Mailbox.org geliefert (Priorität 10) | Empfang: leitet Mails an Mailbox.org |
| 2 | `@` | TXT | `mailbox-verification=<token>` (Mailbox.org) | Domain-Verifikation Mailbox.org |
| 3 | `@` | TXT | `v=spf1 include:_spf.resend.com include:mailbox.org -all` (kombiniert) | Versand: bestätigt Resend + Mailbox.org als legitime Absender |
| 4 | `resend._domainkey` | TXT | `p=<DKIM-Public-Key>` (Resend) | Versand: signiert App-Mails kryptografisch |
| 5 | `_dmarc` | TXT | `v=DMARC1; p=quarantine; rua=mailto:info@grundsteuermonitor.de` | Versand: definiert Verhalten bei fehlgeschlagener Auth |

## Wichtig: SPF-Eintrag nur EINMAL

SPF darf pro Domain nur **einen** TXT-Eintrag haben. Wenn schon einer existiert (typisch durch Vercel oder das Domain-Hosting), müssen die `include:`-Teile kombiniert werden — kein zweiter SPF-Eintrag.

**Beispiel kombiniert:**
```
v=spf1 include:_spf.resend.com include:mailbox.org -all
```

Falls Vercel auch einen SPF beansprucht (selten bei reinen App-Deployments):
```
v=spf1 include:_spf.resend.com include:mailbox.org include:vercel.com -all
```

## Wichtig: Mailbox.org-MX-Werte

Mailbox.org gibt typischerweise zwei MX-Server zurück:
- `mxext1.mailbox.org` (Priorität 10)
- `mxext2.mailbox.org` (Priorität 20)

Beide eintragen — die zweite Priorität ist Fallback bei Ausfall der ersten.

## Wichtig: Resend-DKIM-Selector

Der DKIM-Selector ist immer `resend._domainkey`. Der TXT-Wert ist ein längerer öffentlicher Schlüssel — exakt so kopieren, wie Resend ihn anzeigt (keine Leerzeichen ändern).

## Tabelle zum Ausfüllen (Setup-Session)

Diese Tabelle wird in der Setup-Session mit den echten Werten aus Mailbox.org und Resend gefüllt.

| # | Host | Typ | TTL | Priorität | Wert |
|---|---|---|---|---|---|
| 1 | `@` | MX | 3600 | 10 | `mxext1.mailbox.org.` |
| 2 | `@` | MX | 3600 | 20 | `mxext2.mailbox.org.` |
| 3 | `@` | TXT | 3600 | – | `<aus Mailbox.org-Domains-Tab>` |
| 4 | `@` | TXT | 3600 | – | `v=spf1 include:_spf.resend.com include:mailbox.org -all` |
| 5 | `resend._domainkey` | TXT | 3600 | – | `<aus Resend-Domains-Tab>` |
| 6 | `_dmarc` | TXT | 3600 | – | `v=DMARC1; p=quarantine; rua=mailto:info@grundsteuermonitor.de` |

## Verifikation per Kommandozeile

Nach Eintragen und Warten (15–30 min) kann Claude per `nslookup` prüfen, ob die Einträge live sind:

```bash
nslookup -type=mx grundsteuermonitor.de
nslookup -type=txt grundsteuermonitor.de
nslookup -type=txt resend._domainkey.grundsteuermonitor.de
nslookup -type=txt _dmarc.grundsteuermonitor.de
```

Erwartete Ausgaben:
- MX: zwei Einträge auf `mxext1/mxext2.mailbox.org`
- TXT für Apex: SPF + Mailbox-Verifikation
- TXT für `resend._domainkey`: Resend-DKIM-Schlüssel
- TXT für `_dmarc`: DMARC-Policy

Wenn ein Eintrag fehlt → DNS-Anbieter neu prüfen.
Wenn alles da → 5–10 min später nochmal in Mailbox.org und Resend auf „Verified" prüfen.

## TTL-Empfehlung

- **Setup-Phase:** TTL auf 300 Sekunden (5 min) setzen → Änderungen wirken schnell.
- **Nach erfolgreichem Setup:** TTL auf 3600 (1 h) erhöhen → entlastet DNS-Resolver.
