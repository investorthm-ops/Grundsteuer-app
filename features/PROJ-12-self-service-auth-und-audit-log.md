# PROJ-12: Self-Service-Auth und Audit-Log

## Status: Deployed
**Created:** 2026-05-24
**Last Updated:** 2026-05-25

## Übersicht
Schließt drei harte Lücken in der bestehenden Mandantenverwaltung (PROJ-8), bevor der erste zahlende Kunde anfangen kann:

1. **Self-Service-Erstpasswort** — Admin lädt einen Kunden per E-Mail ein, der Kunde setzt sein Passwort selbst. Keine Klartext-Passwörter mehr per Mail.
2. **Passwort-vergessen-Flow** — Self-Service-Reset über Supabase reset-password-Mail, kein Support-Ticket.
3. **Audit-Log für Admin-Aktionen** — Tabelle `admin_audit_log` protokolliert alle Org-, Membership- und Invitation-Schreibvorgänge mit Actor, Diff und Zeitstempel.

## Bewusst nicht im Scope (mit User abgestimmt)
- Self-Signup (öffentliche Registrierung)
- Multi-User pro Organisation (separates Folgethema)
- Profilbearbeitung, Account-Löschung durch User

## Zielgruppe
- **Markus (Admin)** — onboardet Pilotkunden zügig und kann Verlauf seiner Admin-Aktionen nachvollziehen.
- **Pilotkunde** — bekommt eine deutsche E-Mail, klickt einen Link, vergibt eigenes Passwort. Bei Passwortvergessen Self-Service.

## Akzeptanzkriterien
- Admin kann im Customer-Manager einen neuen User per E-Mail einladen (Name, E-Mail, Org, Rolle). Backend ruft `supabase.auth.admin.inviteUserByEmail` und legt das Membership an.
- Der eingeladene User landet via E-Mail-Link auf `/passwort-setzen`, vergibt ein Passwort und ist sofort eingeloggt mit aktivem Org-Zugang.
- Auf `/login` gibt es einen Link "Passwort vergessen?", der auf `/passwort-vergessen` führt; nach Absenden zeigt die Seite immer dieselbe generische Erfolgsmeldung (kein User-Enumeration-Leak).
- Jede Schreibaktion in `/api/admin/organizations`, `/api/admin/memberships` und `/api/admin/invitations` schreibt einen Audit-Eintrag mit Actor (user_id + email), Action-Code, Entity-Typ/-ID und JSON-Payload (vorher/nachher bzw. Eingabe).
- `/admin/audit-log` zeigt die letzten 100 Einträge mit Filter nach Entitätstyp.
- RLS: `admin_audit_log` ist SELECT-only für Admins, kein INSERT/UPDATE/DELETE via authenticated-Rolle.

## Architektur-Notizen
- Neuer Service-Role-Client in `src/lib/supabase/admin-client.ts` (cached singleton, nur server-side). ENV: `SUPABASE_SERVICE_ROLE_KEY` (kein `NEXT_PUBLIC_`).
- Helper `logAdminAction()` in `src/lib/supabase/audit.ts` — fehlertolerant, blockiert die Hauptaktion nie.
- Migration `0009_admin_audit_log.sql`.

## Reihenfolge der Umsetzung
1. ✅ Migration 0009 + Audit-Helper + Service-Role-Client
2. ✅ Audit-Logging in bestehenden Admin-Routes (orgs + memberships)
3. ✅ Audit-Log-Ansicht `/admin/audit-log` und API
4. ✅ Invite-Flow (`/api/admin/invitations`, Customer-Manager-UI mit Invite-Form, `/passwort-setzen`)
5. ✅ Passwort-Reset-Flow (`/passwort-vergessen`, Link auf Login, recycelt `/passwort-setzen`)
6. ⏳ Supabase Email-Templates auf Deutsch (manueller Konfigurationsschritt, siehe `docs/handout-user-konzept.md`)
7. ✅ Onboarding-SOP `docs/onboarding-sop.md` + Handout `docs/handout-user-konzept.md`

Vor "Deployed": Schritt 6 (Email-Templates und ENV-Variable `SUPABASE_SERVICE_ROLE_KEY` in Production setzen).

## Risiken
- **Service-Role-Key Leak** — Mitigation: nur server-side, kein `NEXT_PUBLIC_`, niemals in Client-Bundle.
- **Audit-Logging-Ausfall** blockiert keine Admin-Aktion (try/catch in Helper).
- Supabase Rate-Limit auf unverifizierte Sender-Domains greift erst >4 Mails/Stunde, für 10 Pilotkunden unkritisch.

## Verifikation
End-to-End-Tests laut Plan-Datei: Invite-Roundtrip, Reset-Roundtrip, Audit-Sichtbarkeit, Sperre-via-Update, 403 für Nicht-Admins.
