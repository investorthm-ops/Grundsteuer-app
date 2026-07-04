# GrundsteuerMonitor — Test Cases

**Stand:** 2026-06-16  
**Repo:** `GrundsteuerMonitor` / GitHub `investorthm-ops/Grundsteuer-app`  
**Ziel:** Regressionstest-Set für MVP/Pilotbetrieb, manuelle Browser-QA und spätere Automatisierung mit Playwright/API-Tests.

## Aktueller Prüfstand

Am 2026-06-16 lokal ausgeführt:

| Prüfung | Ergebnis | Hinweis |
|---|---|---|
| `git status --short --branch` | OK | `main...origin/main`, keine uncommitted Änderungen |
| `npm test` | OK | 72 Tests bestanden, 0 Fehler |
| `npm run lint` | OK | ESLint ohne Fehler |
| `npm run build` | OK | Next.js Production Build erfolgreich |

Bekannte nicht-blockierende Hinweise:

- Node warnt bei einigen `.ts`-Imports vor fehlendem `"type": "module"` in `package.json`.
- Browserslist/Caniuse-Daten sind veraltet und sollten gelegentlich aktualisiert werden.

## Teststrategie

### Prioritäten

- **P0:** Muss vor Pilot-/Produktivbetrieb funktionieren; blockierend bei Fehler.
- **P1:** Wichtig für Nutzbarkeit, Vertrauen und Vertrieb; zeitnah beheben.
- **P2:** Erweiterte Regression, Komfort, Randfälle.

### Empfohlene Testarten

| Testart | Zweck |
|---|---|
| Unit/API-Tests | Parser, Validierung, Pricing, Redirects, Report-/Export-Helfer |
| Integration/API-Tests | Auth-Schutz, CSV-Export, Import-Freigabe, Admin-APIs |
| Browser/E2E-Tests | Login, Datenbank, Watchlist, Vergleich, Rechner, Adminflows |
| Mobile Smoke-Tests | zentrale Seiten bei ca. 390×844 px |
| Security/Access-Tests | Rollen, gesperrter Zugang, Admin-only APIs, Redirect-Sicherheit |
| Go-Live-Checks | Domain, SMTP, rechtliche Seiten, E2E-Testkunde |

---

## A. Smoke & Build

| ID | Prio | Test Case | Schritte | Erwartetes Ergebnis | Automatisierung |
|---|---|---|---|---|---|
| SMK-01 | P0 | Production Build | `npm run build` ausführen | Build kompiliert erfolgreich; zentrale Routen werden generiert | CI |
| SMK-02 | P0 | Unit-Test-Suite | `npm test` ausführen | Alle Tests grün, 0 Failures | CI |
| SMK-03 | P0 | Lint | `npm run lint` ausführen | Keine ESLint-Fehler | CI |
| SMK-04 | P0 | Startseite lädt | App starten, `/` öffnen | Startseite zeigt Hero, Navigation, CTA | Playwright |
| SMK-05 | P1 | 404-Seite | unbekannte Route öffnen | Nutzerfreundliche Nicht-gefunden-Seite mit Navigation | Playwright |
| SMK-06 | P1 | Sitemap/Robots | `/sitemap.xml`, `/robots.txt` öffnen | Beide Endpunkte liefern gültige Antworten | API/Playwright |

---

## B. Authentifizierung & Zugriffsschutz

| ID | Prio | Test Case | Schritte | Erwartetes Ergebnis | Automatisierung |
|---|---|---|---|---|---|
| AUTH-01 | P0 | Geschützte Seite ohne Login | Ohne Session `/datenbank` öffnen | Weiterleitung auf `/login?redirectTo=%2Fdatenbank` | Playwright |
| AUTH-02 | P0 | Login mit gültigem Nutzer | Testuser einloggen | Redirect zur Zielseite, geschützte Bereiche erreichbar | Playwright |
| AUTH-03 | P0 | Login mit falschem Passwort | gültige Mail + falsches Passwort | Login bleibt auf Formular, verständliche Fehlermeldung | Playwright |
| AUTH-04 | P0 | Logout schützt Session | Einloggen, Logout, `/watchlist` öffnen | Weiterleitung zum Login | Playwright |
| AUTH-05 | P0 | Safe Redirect blockt externe URL | Login/Redirect mit `https://evil.example` | Kein externer Redirect; Fallback auf sichere Route | Unit/E2E |
| AUTH-06 | P1 | Passwort vergessen Formular | `/passwort-vergessen`, E-Mail eintragen, absenden | Erfolgs-/Hinweismeldung ohne Datenleck | Playwright |
| AUTH-07 | P1 | Passwort setzen Seite | `/passwort-setzen` ohne/mit ungültigem Token öffnen | kontrollierter Hinweis, kein Crash | Playwright |
| AUTH-08 | P0 | Gesperrter Zugang | Testuser mit blockierter/abgelaufener Organisation anmelden | Weiterleitung/Anzeige `/zugang-gesperrt`; App-Funktionen gesperrt | E2E mit Testdaten |
| AUTH-09 | P0 | Admin-only Seiten für normalen Nutzer | normaler Nutzer öffnet `/admin/kunden` | Zugriff verweigert / Redirect; keine Admin-Daten sichtbar | E2E mit Rollen |
| AUTH-10 | P0 | Admin APIs ohne Session | `/api/admin/*` ohne Login aufrufen | `401` oder `403`, keine Daten | API-Test |

---

## C. Datenbank / Hebesatzsuche

| ID | Prio | Test Case | Schritte | Erwartetes Ergebnis | Automatisierung |
|---|---|---|---|---|---|
| DB-01 | P0 | Datenbankliste lädt | Eingeloggt `/datenbank` öffnen | Tabelle/Liste mit Gemeinden sichtbar | Playwright |
| DB-02 | P0 | Suche Aachen | Suche `Aachen` | Aachen sichtbar, Grundsteuer B `525 %` | Playwright |
| DB-03 | P0 | Suche Lüdenscheid/Umlaut | Suche `Lüdenscheid` | Lüdenscheid sichtbar, Umlaut korrekt, B `766 %` | Playwright |
| DB-04 | P1 | Suche Münster/Umlaut | Suche `Münster` | Münster wird gefunden; keine Umlaut-Probleme | Playwright |
| DB-05 | P1 | Teilbegriff-Suche | Suche `alten` | Treffer wie Altena/Altenbeken/Altenberge | Playwright |
| DB-06 | P1 | Suche ohne Treffer | zufälligen Unsinn suchen | Empty State „keine Daten verfügbar“, kein Fehler | Playwright |
| DB-07 | P0 | Bundeslandfilter NRW | Filter Nordrhein-Westfalen setzen | Nur NRW-Gemeinden; Hessen-Treffer fehlen | Playwright/API |
| DB-08 | P1 | Pagination | Seite 1 → Seite 2 → Seite 1 | Seitenwechsel stabil, Filter/Suche bleiben konsistent | Playwright |
| DB-09 | P0 | Quellenstatus sichtbar | Gemeinde mit bestätigter Quelle öffnen | Datenstand, Quellenname, Quellenstatus sichtbar | Playwright |
| DB-10 | P0 | Nur bestätigte öffentliche Daten | anonyme/public API-Abfrage | Nur bestätigte Hebesätze sichtbar, offene nicht | API/RLS-Test |

---

## D. Detail-/SEO-Stadtseiten

| ID | Prio | Test Case | Schritte | Erwartetes Ergebnis | Automatisierung |
|---|---|---|---|---|---|
| SEO-01 | P0 | Detailseite Aachen | `/grundsteuer-hebesatz/aachen` öffnen | Werte, Datenstand, Quelle, Haftungshinweis sichtbar | Playwright |
| SEO-02 | P0 | Detailseite Lüdenscheid | `/grundsteuer-hebesatz/luedenscheid` öffnen | `766 %`, Quelle, Datenstand sichtbar | Playwright |
| SEO-03 | P0 | Detailseite Altena differenziert | `/grundsteuer-hebesatz/altena` öffnen | B Standard, B Wohnen `1010 %`, B Nichtwohnen `2020 %` sichtbar | Playwright |
| SEO-04 | P1 | Nicht existierender Slug | `/grundsteuer-hebesatz/gibt-es-nicht` | Sauberer Fehler-/Nicht-gefunden-Zustand | Playwright |
| SEO-05 | P1 | SEO-Metadaten | Detailseite prüfen | Title/Description enthalten Gemeinde und Hebesatz-Kontext | Playwright/API |
| SEO-06 | P1 | Haftungshinweis konsistent | mehrere Detailseiten prüfen | Hinweis „keine amtliche Auskunft“ o. ä. sichtbar | Playwright |

---

## E. CSV-/Excel-Export

| ID | Prio | Test Case | Schritte | Erwartetes Ergebnis | Automatisierung |
|---|---|---|---|---|---|
| EXP-01 | P0 | Export ohne Login | `/api/exports/municipalities` ohne Session | `401 Nicht autorisiert` | API-Test |
| EXP-02 | P0 | Authentifizierter Export Aachen | Eingeloggt Export mit `q=Aachen` | CSV-Datei enthält Header, Aachen, `525`, Datenstand, Quelle | API/E2E mit Cookie |
| EXP-03 | P0 | Export Lüdenscheid Umlaut | Export mit `q=Lüdenscheid` | CSV rendert Umlaut korrekt; `766` enthalten | API/E2E |
| EXP-04 | P1 | Export ohne Treffer | Export mit leerem Suchergebnis | Header vorhanden, keine Datensätze, kein 500 | API-Test |
| EXP-05 | P1 | Export mit Bundeslandfilter | Export `bundesland=Nordrhein-Westfalen` | NRW-Daten enthalten, Hessen ausgeschlossen | API-Test |
| EXP-06 | P0 | CSV-Injection-Schutz | Testwert beginnt mit `=`, `+`, `-`, `@` | Export entschärft gefährliche Zellen | Unit/API |
| EXP-07 | P1 | Differenzierte Spalten | Export enthält Altena | Spalten für B Standard, B Wohnen, B Nichtwohnen korrekt | API-Test |

---

## F. Watchlist

| ID | Prio | Test Case | Schritte | Erwartetes Ergebnis | Automatisierung |
|---|---|---|---|---|---|
| WAT-01 | P0 | Empty State | Testuser mit leerer Watchlist öffnet `/watchlist` | Empty State und Zähler `0` sichtbar | Playwright |
| WAT-02 | P0 | Gemeinde hinzufügen | Aachen aus Datenbank zur Watchlist hinzufügen | Erfolgszustand; Aachen in Watchlist sichtbar | Playwright |
| WAT-03 | P0 | Dublette verhindern | Aachen zweimal hinzufügen | Nur ein Watchlist-Eintrag | Playwright/API |
| WAT-04 | P0 | Persistenz nach Reload | Aachen hinzufügen, Seite neu laden | Aachen bleibt sichtbar | Playwright |
| WAT-05 | P0 | Gemeinde entfernen | Aachen entfernen | Eintrag verschwindet; Empty State falls Liste leer | Playwright |
| WAT-06 | P1 | Accessibility Entfernen-Button | Button per Accessibility Tree prüfen | `aria-label` z. B. „Aachen aus Watchlist entfernen“ | Playwright |
| WAT-07 | P1 | Mobile Watchlist | 390×844 px, Watchlist öffnen | Tabelle/Karten und Entfernen-Button bedienbar | Playwright |
| WAT-08 | P0 | Watchlist API ohne Login | `/api/watchlist` ohne Session | `401` | API-Test |

---

## G. Vergleich & Benchmarking

| ID | Prio | Test Case | Schritte | Erwartetes Ergebnis | Automatisierung |
|---|---|---|---|---|---|
| CMP-01 | P0 | Vergleichsseite lädt | `/vergleich` öffnen | Suchfeld und Vergleichsbereich sichtbar | Playwright |
| CMP-02 | P0 | Eine Gemeinde ausgewählt | Aachen hinzufügen | Zähler `1 von 5`, Hinweis „mindestens zwei“ | Playwright |
| CMP-03 | P0 | Zwei Gemeinden vergleichen | Aachen + Altena hinzufügen | Vergleichstabelle aktiv, beide Gemeinden sichtbar | Playwright |
| CMP-04 | P0 | Maximal fünf Gemeinden | fünf Gemeinden hinzufügen | Zähler `5 von 5`; sechste Auswahl verhindert/deaktiviert | Playwright |
| CMP-05 | P1 | Gemeinde entfernen | ausgewählte Gemeinde entfernen | Zähler sinkt, Tabelle aktualisiert | Playwright |
| CMP-06 | P0 | Rangliste sichtbar | Rangliste öffnen | Filter, Sortierung, Wertbereich sichtbar | Playwright |
| CMP-07 | P1 | Rangliste Sortierung | Sortierung wechseln | Reihenfolge/Werte aktualisieren sich plausibel | Playwright |
| CMP-08 | P0 | Differenzierte B-Werte | Altena vergleichen | B Wohnen/Nichtwohnen werden korrekt angezeigt oder als fehlend behandelt | Playwright |
| CMP-09 | P1 | Mobile Vergleichsansicht | 390×844 px, zwei Gemeinden vergleichen | Vergleich bleibt lesbar/bedienbar | Playwright |

---

## H. Renditeauswirkungs-Rechner

| ID | Prio | Test Case | Schritte | Erwartetes Ergebnis | Automatisierung |
|---|---|---|---|---|---|
| CALC-01 | P0 | Rechnerseite lädt | `/rechner` öffnen | Kernelemente sichtbar | Playwright |
| CALC-02 | P0 | Beispielwerte | Beispielwerte setzen | Messbetrag/Objektwert werden vorbelegt; Ergebnis sichtbar | Playwright |
| CALC-03 | P0 | Kontrollrechnung | Messbetrag `200`, Hebesatz `715 %` | Jahresbetrag `1.430,00 €` | Unit/Playwright |
| CALC-04 | P1 | Gemeindewechsel Aachen | Aachen auswählen | Hebesatz B `525 %` wird verwendet | Playwright |
| CALC-05 | P1 | Ungültige Eingabe | `abc` als Messbetrag | App bleibt stabil; keine NaN-/Crash-Anzeige | Playwright |
| CALC-06 | P0 | Differenzierte Auswahl Altena | Altena auswählen | Auswahl Standard/Wohnen/Nichtwohnen möglich; Werte korrekt | Playwright |
| CALC-07 | P1 | Mobile Rechner | 390×844 px, rechnen | Formular und Ergebnis bedienbar | Playwright |

---

## I. Admin: Kunden, Zugriff, Audit

| ID | Prio | Test Case | Schritte | Erwartetes Ergebnis | Automatisierung |
|---|---|---|---|---|---|
| ADM-01 | P0 | Admin-Kundenliste | Admin öffnet `/admin/kunden` | Organisationen/Nutzer sichtbar | E2E mit Admin |
| ADM-02 | P0 | Organisation anlegen | neue Testorganisation anlegen | Organisation erscheint in Liste; Audit-Log-Eintrag entsteht | E2E/API |
| ADM-03 | P0 | Nutzer einladen | Testnutzer zu Organisation hinzufügen | Einladung wird ausgelöst; Membership sichtbar | E2E/API |
| ADM-04 | P0 | Zugriffslaufzeit setzen | `access_until` ändern | Nutzerzugriff folgt neuer Laufzeit | E2E/API |
| ADM-05 | P0 | Organisation sperren | Status auf blocked/expired setzen | Nutzer wird auf `/zugang-gesperrt` geführt | E2E |
| ADM-06 | P1 | Organisation bearbeiten | Name/Status ändern | Änderungen gespeichert, UI aktualisiert | E2E |
| ADM-07 | P1 | Organisation löschen | Testorganisation löschen | Organisation entfernt; abhängige Daten kontrolliert behandelt | E2E/API |
| ADM-08 | P0 | Audit-Log ansehen | `/admin/audit-log` öffnen | relevante Aktionen chronologisch sichtbar | E2E/API |
| ADM-09 | P0 | Normaler Nutzer kein Audit-Zugriff | normaler Nutzer öffnet Audit-Route/API | `403`/Redirect, keine Logs | E2E/API |

---

## J. Admin: Import- und Quellenpipeline

| ID | Prio | Test Case | Schritte | Erwartetes Ergebnis | Automatisierung |
|---|---|---|---|---|---|
| IMP-01 | P0 | Importseite lädt | Admin öffnet `/admin/importe` | Upload-/Historienbereich sichtbar | E2E |
| IMP-02 | P0 | Gültige CSV validieren | CSV mit neuen/aktualisierten Gemeinden hochladen | Importlauf `validated`, Zeilenstatus korrekt | API/E2E |
| IMP-03 | P0 | Fehlende Pflichtfelder | CSV ohne Name/Bundesland | Zeilenstatus `error`, keine Live-Übernahme | API-Test |
| IMP-04 | P0 | Ungültiges Bundesland | CSV mit ungültigem Bundesland | Validierungsfehler | Unit/API |
| IMP-05 | P0 | Deutsches Dezimalkomma | Wert `854,69` importieren | Zahl korrekt geparst | Unit/API |
| IMP-06 | P0 | Delta-Warnung | Differenz >= 100 Punkte | Zeilenstatus `warning` | Unit/API |
| IMP-07 | P0 | Konflikt vorhandener Datensatz | bestehende Gemeinde mit abweichendem Wert | Zeilenstatus `conflict`, Admin-Entscheidung nötig | API/E2E |
| IMP-08 | P0 | Freigabe gültiger Zeilen | validierte Zeilen freigeben | Live-Daten aktualisiert; Importhistorie nachvollziehbar | API/E2E |
| IMP-09 | P0 | Import verwerfen | Importlauf verwerfen | Status `discarded`, keine Live-Datenänderung | API/E2E |
| IMP-10 | P0 | Admin-only Import-API | `/api/imports` als normaler Nutzer/ohne Login | `401`/`403` | API-Test |
| IMP-11 | P1 | Datei zu groß/leer | leere oder zu große CSV | Klare Fehlermeldung, kein 500 | API/E2E |

---

## K. Preise & Produktseiten

| ID | Prio | Test Case | Schritte | Erwartetes Ergebnis | Automatisierung |
|---|---|---|---|---|---|
| PRC-01 | P0 | Preisseite öffentlich | Ohne Login `/preise` öffnen | Seite erreichbar | Playwright |
| PRC-02 | P0 | Tarifkarten sichtbar | `/preise` öffnen | Solo und Kanzlei sichtbar | Playwright |
| PRC-03 | P1 | Monats-/Jahresumschalter | Toggle umstellen | Preise/Rabatt-Hinweis ändern sich korrekt | Playwright |
| PRC-04 | P0 | CTA ohne Stripe | CTA anklicken/prüfen | Kontaktziel/Mailto statt Checkout | Playwright |
| PRC-05 | P1 | Kanzlei hervorgehoben | Seite prüfen | Kanzlei als Empfehlung markiert | Playwright |
| PRC-06 | P1 | Feature-Abgrenzung | Solo/Kanzlei Features prüfen | Kanzlei enthält „Alles aus Solo“, Report/Rechner korrekt eingeordnet | Unit/Playwright |
| PRC-07 | P1 | Mobile Preise | 390×844 px | Karten stapeln, Toggle bedienbar | Playwright |

---

## L. Rechtliches, Datenschutz, Content

| ID | Prio | Test Case | Schritte | Erwartetes Ergebnis | Automatisierung |
|---|---|---|---|---|---|
| LEG-01 | P0 | Impressum erreichbar | `/impressum` öffnen | Seite lädt, keine Platzhalter vor Go-Live | Playwright/Manual |
| LEG-02 | P0 | Datenschutz erreichbar | `/datenschutz` öffnen | Seite lädt, Vercel/Supabase/Verantwortlicher final gepflegt | Playwright/Manual |
| LEG-03 | P0 | AGB erreichbar | `/agb` öffnen | Seite lädt, finaler Stand vor zahlenden Kunden | Playwright/Manual |
| LEG-04 | P0 | Haftungsausschluss erreichbar | `/haftungsausschluss` öffnen | Seite lädt; Hinweis konsistent mit Export/Detailseiten | Playwright |
| LEG-05 | P1 | Footer-Links | Footer von Start/Datenbank öffnen | Impressum, Datenschutz, Haftung erreichbar | Playwright |
| LEG-06 | P0 | Kontakt erreichbar | `/kontakt` öffnen | Kontaktweg korrekt, keine private/testhafte Adresse vor Go-Live | Playwright/Manual |

---

## M. Pilot-/Production-Readiness

| ID | Prio | Test Case | Schritte | Erwartetes Ergebnis | Automatisierung |
|---|---|---|---|---|---|
| PROD-01 | P0 | Domain eingerichtet | `https://grundsteuermonitor.de` öffnen | Hauptdomain lädt, SSL grün | Manual/Monitoring |
| PROD-02 | P0 | www-Redirect | `https://www.grundsteuermonitor.de` öffnen | Redirect auf Hauptdomain | Manual/Monitoring |
| PROD-03 | P0 | Supabase Auth URLs | Invite/Reset mit Produktionsdomain prüfen | Links zeigen auf richtige Domain, nicht localhost/Preview | Manual/E2E |
| PROD-04 | P0 | Custom SMTP | Supabase Testmail senden | Absender `noreply@grundsteuermonitor.de`, Mail kommt an | Manual |
| PROD-05 | P0 | Testkunden-E2E | Admin legt Testorganisation + Testuser an | Einladung, Passwort setzen, Login, Zugriff vollständig OK | Manual/E2E |
| PROD-06 | P0 | Security Headers | Network Headers prüfen | X-Frame-Options, nosniff, Referrer-Policy, HSTS vorhanden | API/Manual |
| PROD-07 | P1 | Mobile Pilot-Smoke | zentrale Nutzerseiten mobil prüfen | Datenbank, Vergleich, Rechner, Watchlist, Zugang nutzbar | Playwright |
| PROD-08 | P1 | Monitoring/Fehlertracking | Sentry/Vercel Logs prüfen | Fehler werden sichtbar; keine Secrets in Logs | Manual |

---

## N. PROJ-18 PDF-Bericht — sobald implementiert

| ID | Prio | Test Case | Schritte | Erwartetes Ergebnis | Automatisierung |
|---|---|---|---|---|---|
| PDF-01 | P0 | Report-API ohne Login | `POST /api/reports/municipalities` ohne Session | `401` | API-Test |
| PDF-02 | P0 | Zu wenige Gemeinden | Eingeloggt mit 1 ID posten | `400` mit klarer Fehlermeldung | API-Test |
| PDF-03 | P0 | Zu viele Gemeinden | Eingeloggt mit 6 IDs posten | `400` | API-Test |
| PDF-04 | P0 | Gültiger Report | 2–5 Gemeinden aus Vergleich erzeugen | PDF Download, korrekter Dateiname mit Datum | E2E/API |
| PDF-05 | P0 | Inhalt Vergleichstabelle | PDF extrahieren/visuell prüfen | A, B, B Wohnen, B Nichtwohnen, Gewerbesteuer enthalten | API/PDF-Test |
| PDF-06 | P0 | Quellen und Datenstand | PDF für Aachen/Altena | Quelle, Status, Datenstand sichtbar | PDF-Test |
| PDF-07 | P1 | Deutsches Format/Umlaute | PDF mit Lüdenscheid/Münster | Umlaute und Dezimalkomma korrekt | PDF-Test |
| PDF-08 | P1 | Optionaler Titel | Report mit Mandantentext | Titel erscheint im Kopf, Länge begrenzt | API/E2E |
| PDF-09 | P0 | Haftungshinweis | PDF prüfen | Haftungshinweis konsistent enthalten | PDF-Test |
| PDF-10 | P1 | UI-Lade-/Fehlerzustand | Button klicken bei Erfolg/Fehler | Ladehinweis, Fehlermeldung klar | Playwright |

---

## Automatisierungsreihenfolge Empfehlung

1. **P0 API-/Access-Tests:** Auth-Schutz für CSV, Watchlist, Admin, Imports.
2. **Playwright Smoke:** Login, Datenbank, Suche, Detailseite, Watchlist, Vergleich, Rechner.
3. **CSV-Export mit Session-Cookie:** echter Dateiinhalt statt nur Export-Link.
4. **Admin-Import Regression:** Upload → Validierung → Freigabe → Historie.
5. **Mobile Smoke:** Datenbank, Watchlist, Vergleich, Rechner, Preise.
6. **PROJ-18 Tests**, sobald PDF-Report implementiert ist.

## Testdaten-Vorschlag

| Zweck | Gemeinde/Daten |
|---|---|
| Standard-NRW-Kontrolle | Aachen, B `525 %` |
| Umlaut + regionale Relevanz | Lüdenscheid, B `766 %` |
| Umlaut-Suche | Münster |
| Differenzierte Grundsteuer B | Altena, B Standard `910 %`, B Wohnen `1010 %`, B Nichtwohnen `2020 %` |
| Vergleich Maximalfall | Aachen, Altena, Ahlen, Ahaus, Alsdorf |
| Negative Suche | `xyz-kein-treffer-123` |

## Offene Testlücken gegenüber heutigem Stand

- Es gibt aktuell hauptsächlich Unit-Tests unter `src/lib/__tests__`; echte Browser-/API-Regressionen sind dokumentiert, aber noch nicht als Playwright/API-Test-Suite eingecheckt.
- CSV-Export wurde historisch teilweise nur über sichtbaren Link geprüft; der authentifizierte Dateiinhalt sollte automatisiert validiert werden.
- Watchlist-Flows sollten automatisiert werden: hinzufügen, Dublette verhindern, Reload, entfernen, Empty State.
- Admin- und Importflows brauchen reproduzierbare Testdaten und isolierte Testorganisationen.
- Go-Live-Themen wie Domain, SMTP, rechtliche Texte und Supabase Auth URLs bleiben manuelle P0-Checks, bis die Infrastruktur final eingerichtet ist.
