# PROJ-13: Mein Zugang (Account-Selbstanzeige)

## Status: Deployed
**Created:** 2026-05-25
**Last Updated:** 2026-05-25

## Übersicht
Eine eigene Account-Seite, auf der jeder eingeloggte User auf einen Blick sieht: zu welcher Organisation gehöre ich, wie lange ist mein Zugang noch gültig, an wen wende ich mich bei Fragen. Bewusst ohne Billing-Anzeige (im MVP nicht vorhanden) und ohne Profilbearbeitung — beides später.

Inspiration: Layoutaufbau der Fenerofolio-Mitgliedschaftsseite (großer Titel, Block mit Status & Laufzeit, Aktions-Links unten). Übernommen wird ausschließlich die Anordnung, nicht das Theme (Light-Mode, eigene Markenfarben).

## Zielgruppe
- **Pilotkunde** — bekommt Transparenz über seinen Zugang, Vertrauen ins System.
- **Markus (Admin)** — entlastet, weil Standardfragen ("Bis wann läuft mein Zugang?") nun selbsterklärend sind.

## Akzeptanzkriterien
- Neue Seite `/mein-zugang`, erreichbar für jeden eingeloggten User mit aktiver Org (Middleware-protected).
- Zeigt: Org-Name (groß), Status-Badge, eigene E-Mail, Rolle (Owner/Member), Zugang gültig bis (Datum + verbleibende Tage), Mitglied seit.
- Aktions-Links:
  - "Kontakt aufnehmen" → `mailto:investorthm@gmail.com` mit vorbelegtem Betreff
  - "Passwort ändern" → Link auf `/passwort-vergessen`
  - "Account-Löschung anfragen" → `mailto:` mit Subject "Account-Löschung gemäß DSGVO Art. 17"
- Navigationspunkt im AppShell-Header (User-Icon → Dropdown ODER direkt sichtbar als "Konto")
- Footer-Link "Mein Zugang" (sichtbar nur wenn eingeloggt)
- Admins ohne Org sehen einen Hinweis "Du bist Global-Admin und nicht an eine Organisation gebunden." statt einer leeren Org-Anzeige.

## Bewusst nicht im Scope
- Profilbearbeitung (Name, E-Mail ändern) — separates Feature später
- Passwort direkt auf der Seite ändern — geht über vorhandenen `/passwort-vergessen`-Flow
- Billing / Zahlungsinformationen — gibt es nicht
- Team-Verwaltung — wartet auf Multi-User-Orgs

## Architektur-Notizen
- Datenquelle: `auth.users` (E-Mail, created_at) + `organization_memberships` + `organizations`
- Datenbeschaffung: serverseitig in der Page (Server Component) via `createSupabaseServerClient()`
- Wiederverwendung: bestehende RLS-Policies aus PROJ-12 (Migration 0010) reichen — der User darf seine Membership und seine Org lesen
- Komponenten: shadcn `Card`, `Badge`, `Button`. Kein eigenes Styling, das nicht im Designsystem ist.

## Verwandte Dateien (geplant)
- `src/app/mein-zugang/page.tsx` — Server Component, lädt Daten
- `src/components/account/account-overview.tsx` — Darstellung
- `src/components/account/contact-actions.tsx` — Mailto-Links
- `src/proxy.ts` — `/mein-zugang` als geschützten Pfad ergänzen
- `src/components/app-shell.tsx` — Header-Link "Konto" hinzufügen
- `src/components/footer.tsx` — Footer-Link ergänzen
