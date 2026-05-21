# PROJ-8: Mandantenfaehige Nutzerverwaltung

## Status: In Progress
**Created:** 2026-05-21
**Last Updated:** 2026-05-21

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
- [ ] Admin kann eine Organisation mit Name, Status und optionalem Zugriffsende anlegen.
- [ ] Admin kann Organisationen in einer Admin-Ansicht sehen.
- [ ] Admin kann Status und Zugriffsende einer Organisation bearbeiten.
- [ ] Admin kann Organisationen sperren.
- [ ] Statuswerte sind auf `trial`, `active`, `expired`, `blocked` begrenzt.

### Nutzer und Rollen
- [ ] Admin kann einem bestehenden Supabase-Nutzer eine Organisation zuordnen.
- [ ] Ein Nutzer kann genau einer aktiven Organisation zugeordnet werden.
- [ ] Rollen sind auf `admin`, `owner`, `member` begrenzt.
- [ ] Nur Admins duerfen Organisationen und Zuordnungen verwalten.
- [ ] Bestehende Admin-Funktionalitaet bleibt erhalten.

### Zugriffskontrolle
- [ ] Nutzer ohne Login werden weiterhin zur Login-Seite geleitet.
- [ ] Eingeloggte Nutzer ohne Organisation erhalten eine klare Zugangs-Hinweisseite.
- [ ] Nutzer mit Organisation `trial` und gueltigem Zugriffsende duerfen die App nutzen.
- [ ] Nutzer mit Organisation `active` duerfen die App nutzen, solange kein abgelaufenes Zugriffsende vorliegt.
- [ ] Nutzer mit abgelaufenem Zugriffsende werden blockiert.
- [ ] Nutzer mit Status `blocked` werden blockiert.
- [ ] Admins behalten Zugriff auf Adminbereiche, auch wenn sie keiner Kundenorganisation angehoeren.

### Anmeldung und Onboarding
- [ ] Login-Seite erklaert, dass Zugriffe durch den Betreiber freigeschaltet werden.
- [ ] Es gibt keinen oeffentlichen Registrieren-Button.
- [ ] Fehlender oder abgelaufener Zugriff wird menschlich verstaendlich erklaert.
- [ ] Der Admin-Prozess unterstuetzt manuelle Pilotkundenfreischaltung.

### Sicherheit
- [ ] Organisationen und Mitgliedschaften sind per RLS geschuetzt.
- [ ] Normale Nutzer koennen keine fremden Organisationen lesen oder veraendern.
- [ ] Normale Nutzer koennen ihre eigene Rolle nicht hochstufen.
- [ ] API-Endpunkte fuer Organisationen geben ohne Adminrechte `403` zurueck.
- [ ] Zugriff auf geschuetzte App-Bereiche wird serverseitig geprueft.

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
_To be added by /qa_

## Deployment
_To be added by /deploy_
