# Browser-Testbericht 2026-05-30

## Kontext

- Projekt: GrundsteuerMonitor
- Umgebung: lokal, `http://localhost:3000`
- Testdatum: 2026-05-30
- Testuser: `browser-test@grundsteuermonitor.local`
- Browser: Codex In-App-Browser
- Datenbank: Supabase-Testdatenbestand
- Screenshot-Nachweis: nicht erstellt, da `Page.captureScreenshot` im Browser-Tool in einen Timeout lief.

Das Passwort des Testusers ist nicht in diesem Bericht dokumentiert. Es liegt lokal in `.env.test-user.local`.

## Neuer Testlauf: 10 Browser-Tests

| ID | Testfall | Ergebnis | Beobachtung |
| --- | --- | --- | --- |
| T01 | Login mit gespeichertem Testuser | OK | Testuser war bereits angemeldet, geschützte Bereiche waren erreichbar. |
| T02 | Umlaut-Suche `Münster` in der Datenbank | OK | `Münster` wurde gefunden und angezeigt. |
| T03 | Teilbegriff-Suche `alten` | OK | Treffer u. a. `Altena`, `Altenbeken`, `Altenberge`. |
| T04 | Suche ohne Treffer | OK | Kein-Treffer-Zustand wurde angezeigt. |
| T05 | Nicht vorhandene Detailseite | OK | Fehlerzustand / Nicht-gefunden-Zustand wurde angezeigt. |
| T06 | `Aachen` per UI zur Watchlist hinzufügen | OK | Aachen wurde über die Datenbankseite hinzugefügt. |
| T07 | Watchlist zeigt `Aachen` | OK | Aachen war in der Watchlist sichtbar. |
| T08 | `Aachen` aus Watchlist entfernen | OK | Entfernen per Iconbutton erfolgreich. Accessibility wurde nachgezogen: Der Button hat jetzt einen zugänglichen Namen. |
| T09 | Vergleichsseite lädt mit Suchergebnis | OK | Vergleichsseite und Aachen-Suchergebnis waren sichtbar. |
| T10 | Rechnerseite lädt | OK | Rechner-Kernelemente waren sichtbar. |

## Zusatz-Testlauf: 10 weitere Browser-Tests

| ID | Testfall | Ergebnis | Beobachtung |
| --- | --- | --- | --- |
| Z01 | Rechner aktualisiert Berechnung mit echten Eingaben | OK | Messbetrag `200` bei Hebesatz `715 %` ergibt `1.430,00 €`. |
| Z02 | Rechner-Beispielwerte setzen Standardwerte | OK | Beispielwerte `100` und `20000` sowie `715,00 €` waren sichtbar. |
| Z03 | Vergleich: Aachen hinzufügen | OK | Aachen wurde ausgewählt, der Zähler zeigte `1 von 5`. |
| Z04 | Vergleich: Mindesthinweis bei nur einer Gemeinde | OK | Hinweis `Bitte mindestens zwei Kommunen auswählen` war sichtbar. |
| Z05 | CSV-Export für gefilterte Datenbank | OK | Export-Link `/api/exports/municipalities?q=Aachen` war vorhanden. |
| Z06 | Logout schützt Watchlist | OK | Nach Logout leitete `/watchlist` auf `/login?redirectTo=%2Fwatchlist` weiter. |
| Z07 | Falsches Passwort | OK | Login blieb auf der Loginseite und zeigte einen Fehlerhinweis. |
| Z08 | Mobile Datenbankansicht | OK | Bei `390x844` waren Datenbank, Aachen und CSV-Export sichtbar. |
| Z09 | Rechtliche Seiten | OK | Impressum, Datenschutz, AGB, Hinweise und Haftungsausschluss waren erreichbar. |
| Z10 | Accessibility der Iconbuttons | OK | `Aachen aus Watchlist entfernen` war als zugänglicher Buttonname sichtbar. |

Nach dem Testlauf wurde die Watchlist des Testusers wieder geleert.

## Zusatz-Testlauf 2: Vergleich, Filter, CSV und Tastatur

| ID | Testfall | Ergebnis | Beobachtung |
| --- | --- | --- | --- |
| V01 | Vergleich mit zwei Gemeinden | OK | `Aachen` und `Altena` wurden hinzugefügt; die Vergleichstabelle war aktiv. |
| V02 | Vergleich mit fünf Gemeinden | OK | Der Maximalzustand `5 von 5` wurde mit `Aachen`, `Altena`, `Ahlen`, `Ahaus` und `Alsdorf` erreicht. |
| V03 | Vergleich über Limit | OK | Bei `5 von 5` blieb `Hinzufügen` für eine sechste Gemeinde sichtbar, aber deaktiviert. |
| V04 | Vergleich: Gemeinde entfernen | OK | `Aachen` wurde entfernt; der Zähler fiel auf `4 von 5`. |
| V05 | CSV-Export-Link für Aachen | OK | Der Browser zeigte den korrekten Link `/api/exports/municipalities?q=Aachen`. |
| V06 | Rechner mit ungültiger Texteingabe | OK | Der Rechner blieb bei Eingabe `abc` im Messbetrag stabil sichtbar. |
| V07 | Rechner: Gemeindewechsel | OK | Wechsel auf `Aachen` setzte den verwendeten B-Hebesatz auf `525 %`. |
| V08 | Datenbank-Bundeslandfilter | OK | Der Bundeslandfilter ließ sich öffnen; `Nordrhein-Westfalen` war als Option sichtbar. |
| V09 | Pagination | OK | Wechsel `Seite 1 -> Seite 2 -> Seite 1` funktionierte. |
| V10 | Tastaturbedienung Suchfeld | OK | Das Suchfeld wurde per Tastatur mit `Altena` befüllt. |

### Hinweise aus Zusatz-Testlauf 2

- Der In-App-Browser blockiert direkte Aufrufe von `/api/*`- und Download-URLs mit `net::ERR_BLOCKED_BY_CLIENT`. Deshalb wurde beim CSV-Test im Browser der sichtbare Export-Link geprüft, nicht der Downloadinhalt.
- Ein lokaler Aufruf des CSV-Endpunkts ohne Browser-Session lieferte erwartungsgemäß `401 Nicht autorisiert`. Für eine spätere Vollprüfung sollte ein authentifizierter Downloadtest in Playwright oder einem API-Test mit Session-Cookie ergänzt werden.
- Der Radix-Bundeslandfilter öffnet korrekt und zeigt `Nordrhein-Westfalen`. Der Klick auf einzelne Portal-Optionen war im In-App-Browser koordinatenanfällig; die sichtbare Option wurde deshalb als UI-Signal dokumentiert.

## Zusatz-Testlauf 3: Preise, Watchlist, Rangliste und Konto

| ID | Testfall | Ergebnis | Beobachtung |
| --- | --- | --- | --- |
| W01 | Preisseite zeigt Tarifstruktur | OK | Preisseite mit Tarif- und Preisangaben war sichtbar. |
| W02 | Watchlist Empty State nach Bereinigung | OK | Leere Watchlist zeigte `0` und einen Empty State. |
| W03 | Watchlist Dubletten verhindern | OK | `Aachen` hatte genau eine Tabellenzeile in der Watchlist. |
| W04 | Watchlist bleibt nach Reload stabil | OK | `Aachen` blieb nach Reload sichtbar. |
| W05 | Rangliste im Vergleich öffnet und zeigt Werte | OK | Rangliste zeigte Filter, Sortierung, Export und Wertbereich. |
| W06 | Rangliste Sortierung umschaltbar | OK | Sortieroption war sichtbar und bedienbar. |
| W07 | Detailseite zeigt Quelle, Datenstand und Haftung | OK | Aachen-Detailseite zeigte Quelle, Datenstand und Haftungshinweis. |
| W08 | Mein-Zugang-Seite zeigt Testuser-Kontext | OK | Seite zeigte Testuser- bzw. Zugangsinformationen. |
| W09 | Passwort vergessen zeigt Formular | OK | Formular mit E-Mail-Feld und Reset-Hinweis war sichtbar. |
| W10 | Passwort vergessen nimmt E-Mail an | OK | E-Mail-Feld übernahm `browser-test@grundsteuermonitor.local`. |

Nach dem Testlauf wurde die Watchlist des Testusers wieder geleert.

## Abschluss-Testlauf: Lüdenscheid und Kernflüsse

| ID | Testfall | Ergebnis | Beobachtung |
| --- | --- | --- | --- |
| A01 | Datenbank Suche `Lüdenscheid` zeigt Treffer | OK | `Lüdenscheid`, `Nordrhein-Westfalen` und `766 %` waren sichtbar. |
| A02 | CSV Export `Lüdenscheid` zeigt Erfolgsmeldung | OK | Meldung `CSV wurde erstellt` war sichtbar. |
| A03 | Detailseite `Lüdenscheid` zeigt Werte und Quelle | OK | Detailseite zeigte `766 %`, Quelle und Datenstand. |
| A04 | Watchlist `Lüdenscheid` hinzufügen | OK | `Lüdenscheid` war in der Watchlist sichtbar. |
| A05 | Watchlist `Lüdenscheid` entfernen | OK | `Lüdenscheid` wurde aus der Watchlist entfernt. |
| A06 | Vergleich `Lüdenscheid` plus `Aachen` | OK | Vergleich mit beiden Gemeinden war aktiv. |
| A07 | Rechner mit `Aachen` als Kontrollgemeinde | OK | Rechner zeigte `Aachen` mit `525 %`. |
| A08 | Preisseite bleibt erreichbar | OK | Preisseite war sichtbar. |
| A09 | Mein Zugang bleibt erreichbar | OK | Mein-Zugang-Seite war sichtbar. |
| A10 | Footer Rechtliches von Datenbank erreichbar | OK | Impressum, Datenschutz und Haftungsausschluss waren sichtbar. |

Nach dem Abschlusslauf wurde die Watchlist des Testusers wieder geleert.

### Hinweis aus dem Testlauf

Der Watchlist-Entfernen-Button funktionierte bereits, war aber zunächst ein Iconbutton ohne zugänglichen Namen. Das wurde behoben: Der Button erhält jetzt ein gemeindespezifisches `aria-label`, z. B. `Aachen aus Watchlist entfernen`.

## Vorheriger Browser-Testlauf

| Testfall | Ergebnis | Beobachtung |
| --- | --- | --- |
| Startseite lädt | OK | `http://localhost:3000/` war erreichbar. |
| `/datenbank` ohne Login schützt die Seite | OK | Weiterleitung auf Login mit Redirect-Parameter. |
| Loginformular zeigt E-Mail-Feld | OK | Feld war sichtbar. |
| Loginformular zeigt Passwort-Feld | OK | Feld war sichtbar. |
| Loginformular zeigt Anmelden-Button | OK | Button war eindeutig. |
| Login mit Redirect zur Datenbank | OK | Nach Login wurde `/datenbank` erreicht. |
| Datenbank lädt Trefferliste | OK | Trefferliste war sichtbar. |
| Suche nach `Aachen` | OK | Aachen mit Grundsteuer B `525 %` wurde angezeigt. |
| Watchlist per UI hinzufügen | Eingeschränkt | In diesem Lauf hing der Browser-Klick am Tool-Timeout. Späterer Testlauf T06 war erfolgreich. |
| Watchlist zeigt vier Testgemeinden | OK | `Aachen`, `Ahaus`, `Ahlen`, `Aldenhoven` waren sichtbar. |
| Detailseite `Altena` | OK | Altena mit Grundsteuer B `910 %` wurde angezeigt. |
| Vergleichsseite lädt | OK | Seite `Vergleich und Benchmarking` war sichtbar. |
| Rechnerseite lädt | OK | Rechnerseite war erreichbar. |

## Geprüfte NRW-Gemeinden

Die folgenden zehn Detailseiten wurden im Browser gegen die Datenbankwerte geprüft.

| Gemeinde | Erwarteter Hebesatz B | Ergebnis |
| --- | ---: | --- |
| Aachen | 525 % | OK |
| Ahaus | 501 % | OK |
| Ahlen | 546 % | OK |
| Aldenhoven | 820 % | OK |
| Alfter | 995 % | OK |
| Alpen | 493 % | OK |
| Alsdorf | 895 % | OK |
| Altena | 910 % | OK |
| Altenbeken | 501 % | OK |
| Altenberge | 493 % | OK |

## Watchlist-Testdaten

Im vorherigen Lauf wurden vier Gemeinden für den Testuser in der Watchlist geprüft:

- Aachen
- Ahaus
- Ahlen
- Aldenhoven

Im neuen Lauf wurde die Watchlist vorab geleert. Danach wurde `Aachen` per UI hinzugefügt, auf der Watchlist geprüft und anschließend wieder entfernt.

## Datenquellen- und Importprüfungen

| Prüfung | Ergebnis | Beobachtung |
| --- | --- | --- |
| GENESIS-REST-Abfrage für Tabelle `71002` | Eingeschränkt | Die REST-API lieferte `404` für diese Tabelle. |
| XLSX-Download über Statistikportal | OK | Der alternative Downloadpfad funktionierte laut Check. |
| Hebesatzdaten für NRW-Gemeinden in Supabase | OK | Detailseiten und Datenbankwerte waren für die geprüften Gemeinden abrufbar. |

## Offene Punkte

1. Einen automatisierten Regressionstest für Watchlist hinzufügen, entfernen und leeren ergänzen.
2. CSV-Export nicht nur als Link prüfen, sondern den Dateiinhalt authentifiziert automatisiert validieren.
3. Screenshots erneut testen, sobald das Browser-Tool stabil Screenshots aufnehmen kann.

## Nächste Tests

Für den nächsten Testtag sind diese zehn Prüfungen sinnvoll:

| ID | Testfall | Ziel |
| --- | --- | --- |
| N01 | Authentifizierter CSV-Dateiinhalt | Exportdatei mit Session-Cookie prüfen: Header, `Lüdenscheid`, `766`, Umlaute und Trennzeichen. |
| N02 | CSV ohne Treffer | Export bei leerem Suchergebnis prüfen: Header vorhanden, keine Datensätze, klare Rückmeldung. |
| N03 | CSV mit Bundeslandfilter | Export für `Nordrhein-Westfalen` prüfen, ohne Hessen-Treffer. |
| N04 | Watchlist Regression automatisieren | Hinzufügen, Reload, Dublettenprüfung, Entfernen und Empty State als wiederholbaren Test abbilden. |
| N05 | Vergleich Ranking tiefer prüfen | Rangliste nach Steuerart und Sortierung mit erwarteten Top-/Bottom-Werten validieren. |
| N06 | Vergleich Export-Link | Export aus Rangliste/Vergleich prüfen, sofern vorgesehen. |
| N07 | Mobile Watchlist | Watchlist bei `390x844` prüfen: Tabelle, Entfernen-Button, Empty State. |
| N08 | Mobile Vergleich | Direktvergleich und Rangliste auf mobiler Breite prüfen. |
| N09 | Passwort vergessen Submit | Formular absenden und sichtbaren Erfolgs-/Fehlerhinweis prüfen, ohne echte Mailinhalte zu validieren. |
| N10 | Build/Production Smoke | `npm run build` und danach zentrale Seiten kurz prüfen. |
