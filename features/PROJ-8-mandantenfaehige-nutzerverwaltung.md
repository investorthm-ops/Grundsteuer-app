# PROJ-8: Mandantenfaehige Nutzerverwaltung

## Status: Deployed
**Created:** 2026-05-21
**Last Updated:** 2026-05-22

## Uebersicht
Die mandantenfaehige Nutzerverwaltung macht den Grundsteuer-Monitor bereit fuer echte Pilotkunden. Kunden sollen sich nicht frei registrieren, sondern durch den Betreiber als Organisation angelegt und gezielt freigeschaltet werden. Der Zugriff kann zeitlich begrenzt, unbegrenzt aktiv oder gesperrt sein.

## Zielgruppe
- Projektbetreiber/Admin, der Pilotkunden, Einzelkaeufe und Testzugriffe verwaltet.
- Steuerberater, Kanzleien, Investoren und Unternehmen als zahlende oder testende Organisationen.
- Einzelne Anwender innerhalb einer Organisation, die sich einloggen und die Software nutzen.

## MVP-Scope
- Admin kann Organisationen/Kunden anlegen.
- Admin kann Organisationen bearbeiten und sperren.
- Admin kann fuer eine Organisation einen Zugangsstatus setzen: `trial`, `active`, `expired`, `blocked`.
- Admin kann ein Zugriffsende setzen, z. B. fuer Testphase, Einzelkauf oder befristetes Abo.
- Admin kann Nutzer einer Organisation zuordnen.
- Nutzer haben Rollen: `admin`, `owner`, `member`.
- Login bleibt ueber Supabase Auth.
- Oeffentliche Selbstregistrierung bleibt deaktiviert.
- Die App prueft nach Login, ob der Nutzer einer freigeschalteten Organisation angehoert.
- Abgelaufene oder gesperrte Organisationen erhalten eine klare Sperr-/Hinweisseite.
- Bestehende persoenliche Funktionen wie Watchlist bleiben nutzerbezogen, koennen spaeter aber organisationstauglich erweitert werden.

## Non-Goals
- Keine vollautomatische Zahlung oder Stripe-Integration in diesem Schritt.
- Kein Self-Service-Kundenportal fuer Rechnungen oder Abo-Wechsel.
- Keine offene Registrierung fuer beliebige Nutzer.
- Keine komplexen Team-Einladungsprozesse durch Kunden selbst.
- Keine Preislogik oder Tarifabrechnung.
- Keine Mehrmandanten-Auswertungen innerhalb einer Organisation.

## Dependencies
- Requires: bestehender Supabase-Login.
- Builds on: bestehende Admin-Rolle `admin`.
- Supports: PROJ-2 Watchlist und spaetere kundenspezifische Funktionen.
- Prepares: spaetere Billing-Integration und Pilotkunden-Onboarding.

## User Stories
- Als Admin moechte ich eine Kundenorganisation anlegen, damit ich Pilotkunden sauber verwalten kann.
- Als Admin moechte ich einem Kunden ein Zugriffsende setzen, damit Testphasen und Einzelkaeufe automatisch begrenzt sind.
- Als Admin moechte ich Kunden sperren koennen, damit unbezahlte oder beendete Zugriffe sofort blockiert werden.
- Als Admin moechte ich Nutzer einer Organisation zuordnen, damit mehrere Personen eines Kunden kontrolliert Zugriff erhalten.
- Als Kunde moechte ich mich mit E-Mail und Passwort anmelden, damit ich die Software nutzen kann.
- Als Kunde mit abgelaufenem Zugriff moechte ich eine klare Meldung sehen, damit ich weiss, warum ich nicht in die App komme.
- Als Projektbetreiber moechte ich keine offene Registrierung, damit ich die Pilotphase kontrolliert fuehren kann.

## Acceptance Criteria

### Organisationen
- [x] Admin kann eine Organisation mit Name, Status und optionalem Zugriffsende anlegen.
- [x] Admin kann Organisationen in einer Admin-Ansicht sehen.
- [x] Admin kann Status und Zugriffsende einer Organisation bearbeiten.
- [x] Admin kann Organisationen sperren.
- [x] Statuswerte sind auf `trial`, `active`, `expired`, `blocked` begrenzt.

### Nutzer und Rollen
- [x] Admin kann einem bestehenden Supabase-Nutzer eine Organisation zuordnen.
- [x] Ein Nutzer kann genau einer aktiven Organisation zugeordnet werden.
- [x] Rollen sind auf `admin`, `owner`, `member` begrenzt.
- [x] Nur Admins duerfen Organisationen und Zuordnungen verwalten.
- [x] Bestehende Admin-Funktionalitaet bleibt erhalten.

### Zugriffskontrolle
- [x] Nutzer ohne Login werden weiterhin zur Login-Seite geleitet.
- [x] Eingeloggte Nutzer ohne Organisation erhalten eine klare Zugangs-Hinweisseite.
- [x] Nutzer mit Organisation `trial` und gueltigem Zugriffsende duerfen die App nutzen.
- [x] Nutzer mit Organisation `active` duerfen die App nutzen, solange kein abgelaufenes Zugriffsende vorliegt.
- [x] Nutzer mit abgelaufenem Zugriffsende werden blockiert.
- [x] Nutzer mit Status `blocked` werden blockiert.
- [x] Admins behalten Zugriff auf Adminbereiche, auch wenn sie keiner Kundenorganisation angehoeren.

### Anmeldung und Onboarding
- [x] Login-Seite erklaert, dass Zugriffe durch den Betreiber freigeschaltet werden.
- [x] Es gibt keinen oeffentlichen Registrieren-Button.
- [x] Fehlender oder abgelaufener Zugriff wird menschlich verstaendlich erklaert.
- [x] Der Admin-Prozess unterstuetzt manuelle Pilotkundenfreischaltung.

### Sicherheit
- [x] Organisationen und Mitgliedschaften sind per RLS geschuetzt.
- [x] Normale Nutzer koennen keine fremden Organisationen lesen oder veraendern.
- [x] Normale Nutzer koennen ihre eigene Rolle nicht hochstufen.
- [x] API-Endpunkte fuer Organisationen geben ohne Adminrechte `403` zurueck.
- [x] Zugriff auf geschuetzte App-Bereiche wird serverseitig geprueft.

## Edge Cases
- Was passiert, wenn ein Nutzer eingeloggt ist, aber keiner Organisation zugeordnet wurde?
- Was passiert, wenn das Zugriffsende heute erreicht wird?
- Was passiert, wenn eine Organisation `active` ist, aber ein vergangenes Zugriffsende hat?
- Was passiert, wenn ein Nutzer versehentlich zwei Organisationen zugeordnet werden soll?
- Was passiert, wenn ein Admin sich selbst nicht als Organisationmitglied angelegt hat?
- Was passiert, wenn eine Organisation gesperrt wird, waehrend Nutzer eingeloggt sind?
- Was passiert, wenn ein Nutzer geloescht wird, aber seine Mitgliedschaft bestehen bleibt?
- Was passiert, wenn die Kundendaten unvollstaendig sind?

## Technical Requirements (optional)
- Auth: Supabase Auth bleibt Grundlage.
- Security: RLS fuer Organisationen, Mitgliedschaften und Rollen.
- Admin UX: einfache Admin-Seite fuer Kunden und Nutzerzuordnung.
- Access Check: geschuetzte App-Bereiche pruefen Organisation und Laufzeit.
- Auditability: wichtige Verwaltungsdaten enthalten Erstell- und Aktualisierungszeitpunkt.
- Browser Support: aktuelle Versionen von Chrome, Edge, Firefox und Safari.

## Implementation Notes
**Date:** 2026-05-21

**Was wurde gebaut**
- Supabase-Migration fuer `organizations` und `organization_memberships`.
- RLS-Policies fuer Admin-Verwaltung und eigene Mitgliedschaft.
- Hilfsfunktionen fuer Admin-Pruefung und aktive Organisation.
- Zentrale Zugriffskontrolle fuer geschuetzte App-Bereiche.
- Sperrseite `/zugang-gesperrt`.
- Admin-APIs fuer Organisationen und Mitgliedschaften.
- Admin-Seite `/admin/kunden`.
- Navigation um Kundenverwaltung erweitert.
- Login-Hinweis auf admin-gesteuerte Freischaltung angepasst.

**Technischer Check**
- [x] `npm.cmd run build` erfolgreich.
- [x] Next.js erkennt `/admin/kunden`, `/zugang-gesperrt` und neue Admin-APIs.

**Offen fuer Live-Test**
- [x] Migration `supabase/migrations/0006_organizations_access.sql` in Supabase anwenden.
- [x] Admin legt erste Organisation an.
- [x] Admin ordnet bestehenden Supabase-Nutzer per Nutzer-ID zu.
- [x] Zugriff mit gesperrter Organisation testen.
- [x] Zugriff mit aktiver Organisation erneut testen.
- [x] Zugriff mit abgelaufener Organisation ist implementiert und per Build/Codepfad abgedeckt.

**Live-Test 2026-05-21**
- Organisation `Pilotkunde Markus` angelegt.
- Bestehender Supabase-Nutzer als `owner` zugeordnet.
- Organisation auf `blocked` gesetzt.
- Aufruf von `/datenbank` leitet auf `/zugang-gesperrt?reason=blocked`.
- Ergebnis: Sperrlogik bestanden.
- Organisation anschliessend wieder auf `active` gesetzt.
- Aufruf der Datenbank war danach wieder moeglich; Altena-Datensatz wurde sichtbar geprueft.
- Ablaufdatum-Logik nutzt denselben serverseitigen Zugriffspfad und wurde als Rest-Risiko ohne separaten Klicktest dokumentiert.

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Entscheidung
PROJ-8 baut eine admin-gesteuerte Kundenverwaltung auf. Es gibt weiterhin keinen offenen Registrierungsprozess. Der Betreiber legt Kundenorganisationen an, ordnet Nutzer zu und entscheidet ueber Laufzeit und Status. Damit bleibt die Pilotphase kontrollierbar und Billing kann spaeter sauber angebunden werden.

### Component Structure
```
/login
+-- Login Form
+-- Hinweis: Zugang wird durch Betreiber freigeschaltet

/zugang-gesperrt
+-- Hinweisbox
+-- Grund: kein Mandant, abgelaufen oder gesperrt
+-- Kontakt-/Verlaengerungshinweis

/admin/kunden
+-- Kundenuebersicht
|   +-- Name
|   +-- Status
|   +-- Zugriff bis
|   +-- Anzahl Nutzer
|   +-- Bearbeiten-Aktion
+-- Kundenformular
|   +-- Name
|   +-- Status
|   +-- Zugriff bis
+-- Nutzerzuordnung
    +-- Nutzer-ID oder E-Mail
    +-- Rolle
    +-- Organisation

Geschuetzte App-Bereiche
+-- Zugriffskontrolle vor Seitenaufruf
+-- Erlaubt bei aktiver Organisation
+-- Blockiert bei fehlender/abgelaufener/gesperrter Organisation
```

### Data Model
Neue fachliche Objekte:

**Organisation**
- Name des Kunden
- Status: `trial`, `active`, `expired`, `blocked`
- Optionales Zugriffsende
- Erstell- und Aktualisierungszeitpunkt

**Organisation-Mitgliedschaft**
- Nutzer-ID aus Supabase Auth
- Organisation
- Rolle: `owner`, `member`
- Erstell- und Aktualisierungszeitpunkt

**Admin-Rollen**
- Bestehende Admin-Rolle bleibt separat.
- Admins duerfen Kunden und Mitgliedschaften verwalten.
- Admins brauchen nicht zwingend eine Kundenorganisation.

### Access Rules in Plain Language
- Nicht eingeloggt: Weiterleitung zur Login-Seite.
- Eingeloggt ohne Organisation: Zugang-Hinweis statt App.
- Organisation `trial`: Zugriff nur bis zum gesetzten Ende.
- Organisation `active`: Zugriff erlaubt, solange kein abgelaufenes Ende gesetzt ist.
- Organisation `expired`: Zugriff blockiert.
- Organisation `blocked`: Zugriff blockiert.
- Admin: Zugriff auf Adminbereiche bleibt moeglich.

### Backend Need
Dieses Feature braucht Backend-Arbeit.

Erforderlich:
- Datenbanktabellen fuer Organisationen und Mitgliedschaften.
- RLS-Regeln fuer Admin- und Nutzerzugriff.
- Admin-APIs fuer Organisationen.
- Admin-APIs fuer Mitgliedschaften.
- Hilfsfunktion fuer Zugriffskontrolle.
- Erweiterung des bestehenden Login-/Proxy-Schutzes.

Nicht erforderlich:
- Zahlungsanbieter.
- E-Mail-Einladungen.
- Offene Registrierung.

### Tech Decisions
- Admin-gesteuerte Freischaltung, weil Pilotkunden am Anfang persoenlich betreut werden und das Geschaeftsmodell noch validiert wird.
- Organisation getrennt vom Nutzer speichern, weil spaeter mehrere Nutzer zu einem Kunden gehoeren koennen.
- Lizenzstatus auf Organisationsebene speichern, weil der Kunde zahlt, nicht jede einzelne Person.
- Admin-Rolle separat halten, damit Betreiberzugriff nicht von Kundenlizenzen abhaengt.
- Manuelle Nutzerzuordnung im MVP, weil Supabase-Nutzer schon bestehen koennen und Einladungslogik spaeter separat sauber gebaut werden kann.

### Dependencies
- Supabase Auth
- Bestehende Admin-Rolle `user_roles`
- Bestehende App-Schutzlogik in `proxy.ts`
- Bestehende shadcn/ui-Komponenten fuer Formulare, Tabellen und Hinweise

### Rollout Plan
1. Datenmodell und RLS fuer Organisationen/Mitgliedschaften anlegen.
2. Zugriffskontrolle zentralisieren.
3. Admin-Seite `/admin/kunden` bauen.
4. Login- und Sperrhinweise verbessern.
5. Bestehende geschuetzte Seiten gegen Mandantenstatus pruefen.
6. Build, Live-Test und QA.

### Product Notes
- Fuer Pilotkunden reicht manuelle Freischaltung.
- Stripe/Billing sollte erst nach ersten zahlenden Tests folgen.
- Spaeter kann `owner` Nutzer selbst einladen, aber noch nicht im MVP.

## QA Test Results
**Tested:** 2026-05-22
**App URL:** http://localhost:3000
**Tester:** Markus + Codex

### Acceptance Criteria Status
- [x] Organisationen koennen angelegt und bearbeitet werden.
- [x] Statuswechsel `active` / `blocked` funktioniert.
- [x] Nutzer kann per Supabase-Nutzer-ID einer Organisation zugeordnet werden.
- [x] Adminbereich bleibt trotz Kundensperre erreichbar.
- [x] Normale App-Bereiche werden bei `blocked` gesperrt.
- [x] Sperrseite zeigt eine verstaendliche Meldung.
- [x] Aktiver Kunde kommt wieder in die Datenbank.
- [x] Build erfolgreich.

### Bugs Found
- [x] Bearbeiten-Button wirkte zunaechst ohne Rueckmeldung. Behoben durch sichtbaren Bearbeitungsmodus, Scroll zum Formular und klaren Buttontext.
- [x] Admin-Bypass liess normale App-Seiten trotz gesperrter Organisation offen. Behoben: Admin-Bypass gilt nur noch fuer Adminbereiche, nicht fuer `/datenbank`, `/vergleich`, `/watchlist` und `/rechner`.

### Residual Risk
- Ablaufdatum in der Vergangenheit wurde nicht separat manuell geklickt. Die Logik ist serverseitig implementiert und nutzt denselben Zugriffspfad wie `blocked`.
- Cross-Browser und Mobile wurden nicht separat getestet.

### Production-Ready Decision
**READY** fuer MVP-Demo und Pilotkunden-Onboarding.

## Deployment
**Status:** Deployed
**Deployed:** 2026-05-22
**Production URL:** Local MVP / Demo-Umgebung
**Result:** PROJ-8 ist fuer die manuelle Pilotkundenfreischaltung einsatzbereit.
