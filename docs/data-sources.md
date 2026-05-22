# Datenquellen — Grundsteuer-Monitor

Dieses Dokument hält fest, woher die Hebesatz-Daten der Datenbank stammen, wie sie
aufbereitet werden und wie ein Update funktioniert.

## Aktiv genutzte Quelle

### Hebesätze der Realsteuern (Berichtsjahr 2022)

| Feld | Wert |
|------|------|
| Herausgeber | Statistische Ämter des Bundes und der Länder |
| Publikation | „Hebesätze der Realsteuern in Deutschland" |
| Berichtsjahr | 2022 (Gebietsstand 31.12.2022) |
| Format | Excel (`.xlsx`), ein Tabellenblatt je Bundesland |
| Quelle | https://www.statistikportal.de/de/veroeffentlichungen/hebesaetze-der-realsteuern-deutschland |
| Direktdownload | https://www.destatis.de/DE/Themen/Staat/Steuern/Steuereinnahmen/Publikationen/Downloads-Realsteuern/hebesaetze-realsteuern-8148001227005.xlsx |
| Lizenz | Datenlizenz Deutschland – Zero 2.0 (kommerzielle Nutzung erlaubt, Quellenangabe empfohlen) |
| Abgedeckt | Grundsteuer A, Grundsteuer B, Gewerbesteuer — pro Gemeinde |

**Wichtiger Hinweis:** Diese Publikation wurde **mit der Ausgabe 2022 eingestellt**.
Es ist die letzte als fertige Excel-Datei verfügbare Gemeinde-Auflistung.

## Verkaufsfähige Datenbasis

Für Pilotkunden wird die Datenbasis nicht nur nach Umfang bewertet, sondern nach Vertrauen:

| Qualitätsstufe | Bedeutung | Verwendung |
|----------------|-----------|------------|
| `bestaetigt` | Wert wurde aus einer dokumentierten Quelle importiert oder manuell geprüft. | Darf in Demo, Export und Kundengespräch verwendet werden. |
| `offen` | Quelle oder Stichprobe ist noch nicht ausreichend geprüft. | Nur als Arbeitsstand zeigen, nicht als belastbare Aussage verkaufen. |

Jeder verkaufsfähige Datensatz soll mindestens diese Angaben tragen:

- Datenstand, z. B. `2022-01-01` für Berichtsjahr 2022.
- Quellenname, z. B. `Statistische Ämter des Bundes und der Länder – Hebesätze der Realsteuern 2022`.
- Quellen-URL zur Originalquelle oder zur bestmöglichen öffentlichen Fundstelle.
- App-Aktualisierung über `updated_at`, damit sichtbar ist, wann der Datensatz zuletzt im System geändert wurde.
- Quellenstatus `bestaetigt` nur nach Import aus dokumentierter Quelle oder manueller Stichprobe.

## Pilotdaten NRW/Hessen

Der aktuelle Demo-Datensatz `data/import/nrw-hessen-2022.csv` ist als Pilotdatenbasis gedacht. Er deckt Nordrhein-Westfalen und Hessen aus der Realsteuer-Publikation 2022 ab.

Für Verkaufsgespräche ist diese Einordnung wichtig:

- Die Werte sind echte Hebesatzdaten aus einer amtlichen Statistikquelle.
- Der Datenstand ist 2022 und damit nicht als aktueller 2025-Reformstand zu verkaufen.
- Der Datensatz eignet sich für Produktdemo, Vergleichslogik, Exportlogik und Quellenvertrauen.
- Für bezahlte Pilotkunden sollten ausgewählte Kommunen zusätzlich gegen Originalquelle oder kommunale Veröffentlichung geprüft werden.

### Mindestprüfung vor Pilotkundengespräch

Vor einem echten Verkaufsgespräch sollten mindestens 20 relevante Kommunen geprüft und dokumentiert werden:

| Nr. | Kommune | Bundesland | App-Wert | Fachprüfung | Status |
|-----|---------|------------|----------|-------------|--------|
| 1 | Dreieich | Hessen | 2022: A 500 / B 500 / GewSt 370 | 2022 historisch korrekt. 2025 laut Kreis Offenbach: A 661 / B 709 / GewSt 370. 2026 laut Hebesatzsatzung: A 900 / B 900 / GewSt 380. | geprüft: historisch korrekt, aktuell veraltet |
| 2 | Düsseldorf | Nordrhein-Westfalen | 2022: A 156 / B 440 / GewSt 440 | 2022 historisch korrekt. 2025/2026: Grundsteuer nach städtischen Quellen geändert; Gewerbesteuer 440. Quellenkonflikt zwischen Grundsteuerseite und Haushaltsdaten für A/B dokumentiert. | geprüft: historisch korrekt, aktuell veraltet; Quellenkonflikt bei A/B |
| 3 | Köln | Nordrhein-Westfalen | 2022: A 165 / B 515 / GewSt 475 | 2022 historisch korrekt. 2025: A 165 / B 475 / GewSt 475; 2026: A 165 / B 550 / GewSt 475. | geprüft: historisch korrekt, aktuell veraltet |
| 4 | Essen | Nordrhein-Westfalen | 2022: A 255 / B 670 / GewSt 480 | 2022 historisch korrekt. 2025: A 390 / B 655 für Wohngrundstücke / B 1.290 für Nichtwohngrundstücke / GewSt 480. | geprüft: historisch korrekt, aktuell veraltet; differenzierte Grundsteuer B |
| 5 | Dortmund | Nordrhein-Westfalen | 2022: A 325 / B 610 / GewSt 485 | 2022 historisch korrekt. 2025: A 450 / B 625 für Wohngrundstücke / B 1.245 für Nichtwohngrundstücke; 2026: A 595 / B 800 / GewSt 485. | geprüft: historisch korrekt, aktuell veraltet; differenzierte Grundsteuer B 2025 |
| 6 | Frankfurt am Main | Hessen | 2022: A 175 / B 500 / GewSt 460 | 2022 historisch korrekt. 2025/2026: A 317,62 / B 854,69 / GewSt 460. | geprüft: historisch korrekt, aktuell veraltet |
| 7 | Wiesbaden | Hessen | 2022: A 275 / B 492 / GewSt 454 | 2022 historisch korrekt. 2026 laut städtischer Haushaltssatzung: A 341,01 / B 690,06 / GewSt 460. IHK-Übersicht nennt abweichend GewSt 395. | geprüft: historisch korrekt, aktuell veraltet; Quellenkonflikt bei GewSt |
| 8 | Kassel | Hessen | 2022: A 450 / B 490 / GewSt 440 | 2022 historisch korrekt. 2025/2026: A 345 / B 490 / GewSt 440. | geprüft: historisch korrekt, Grundsteuer A aktuell veraltet |
| 9 | Darmstadt | Hessen | 2022: A 320 / B 535 / GewSt 454 | 2022 historisch korrekt. 2025/2026: A 693 / B 1.181 / GewSt 459. | geprüft: historisch korrekt, aktuell veraltet |
| 10 | Bonn | Nordrhein-Westfalen | 2022: A 340 / B 680 / GewSt 490 | 2022 historisch korrekt. 2025/2026: A 543 / B 657 Wohngrundstücke / B 900 Nichtwohngrundstücke / GewSt 537 laut Haushaltssatzung. | geprüft: historisch korrekt, aktuell veraltet; differenzierte Grundsteuer B |
| 11 | Duisburg | Nordrhein-Westfalen | 2022: A 260 / B 855 / GewSt 520 | 2022 historisch korrekt. 2025: GewSt 495; 2026: A 329 / einheitliche Grundsteuer B 1.169. | geprüft: historisch korrekt, aktuell veraltet |
| 12 | Münster | Nordrhein-Westfalen | 2022: A 255 / B 510 / GewSt 460 | 2022 historisch korrekt. 2025: A 255 / B 410 Wohngrundstücke / B 620 Nichtwohngrundstücke / GewSt 460; 2026: A 393 / B 492 / GewSt 460. | geprüft: historisch korrekt, aktuell veraltet; differenzierte Grundsteuer B 2025 |
| 13 | Aachen | Nordrhein-Westfalen | 2022: A 305 / B 525 / GewSt 475 | 2022 historisch korrekt. Ab 01.01.2025: A 368 / B 637 / GewSt 475. | geprüft: historisch korrekt, aktuell veraltet |
| 14 | Bielefeld | Nordrhein-Westfalen | 2022: A 300 / B 660 / GewSt 480 | 2022 historisch korrekt. 2025/2026: A 426 / B 765; Gewerbesteuer separat zu bestätigen. | geprüft: historisch korrekt, aktuell veraltet; GewSt offen |
| 15 | Wuppertal | Nordrhein-Westfalen | 2022: A 240 / B 620 / GewSt 490 | 2022 historisch korrekt. Ab 01.01.2025: A 309 / B 947 / GewSt 490. | geprüft: historisch korrekt, aktuell veraltet |
| 16 | Bochum | Nordrhein-Westfalen | 2022: A 250 / B 645 / GewSt 495 | 2022 historisch korrekt. 2025: A 374 / B 715 Wohngrundstücke / B 1.190 Nichtwohngrundstücke / GewSt 495. | geprüft: historisch korrekt, aktuell veraltet; differenzierte Grundsteuer B |
| 17 | Offenbach am Main | Hessen | 2022: A 250 / B 895 / GewSt 440 | 2022 historisch korrekt. 2025: aufkommensneutrale Grundsteuer B 1.230 (vorher 895); Gewerbesteuer 440 unverändert. | geprüft: historisch korrekt, Grundsteuer B aktuell veraltet |
| 18 | Hanau | Hessen | 2022: A 330 / B 595 / GewSt 430 | 2022 historisch korrekt (Stand seit 2017). 2025 Reform: A 175 / B 645; Gewerbesteuer 430, ab 2026 458. | geprüft: historisch korrekt, aktuell veraltet |
| 19 | Gießen | Hessen | 2022: A 330 / B 600 / GewSt 420 | 2022 historisch korrekt. 2025: A 259 / B 626; Gewerbesteuer 2025 nicht separat bestätigt. | geprüft: historisch korrekt, Grundsteuer A/B aktuell veraltet |
| 20 | Marburg | Hessen | 2022: A 280 / B 390 / GewSt 357 | 2022 historisch korrekt. 2025: A 210 / B 450 / GewSt 380; 2026: B 490 / GewSt 420. | geprüft: historisch korrekt, aktuell veraltet |
| 21 | Fulda | Hessen | 2022: A 220 / B 340 / GewSt 380 | 2022 historisch korrekt. 2025: A 144 / B 313 (aufkommensneutral, leicht reduziert); Gewerbesteuer 380 unverändert. | geprüft: historisch korrekt, Grundsteuer A/B aktuell veraltet |

#### Prüfergebnis Dreieich

Die App-Zeile `Dreieich; Hessen; A 500; B 500; GewSt 370; Datenstand 2022` ist für den Datenstand 2022 plausibel und historisch korrekt. Sie darf aber nicht als aktueller Wert verkauft werden.

Quellenlage:

- Stadt Dreieich, Grundsteuerreform 2025: bis 31.12.2024 A 500 / B 500; ab 01.01.2025 aufkommensneutral A 660,94 / B 708,93.
- Kreis Offenbach, Realsteuersätze 4. Quartal 2025: Dreieich A 661 / B 709 / GewSt 370.
- Hebesatzsatzung Dreieich 2026: ab 01.01.2026 A 900 / B 900 / GewSt 380.

Entscheidung für PROJ-9:

- Quellenstatus der 2022-Zeile bleibt nur dann `bestaetigt`, wenn der Datenstand sichtbar bei 2022 bleibt.
- Für aktuelle Demo oder Verkaufsgespräch muss Dreieich als veraltet markiert oder auf 2026 aktualisiert werden.
- Saubere Produktlösung: historische Werte langfristig getrennt von aktuellen Werten führen.

#### Prüfergebnis Frankfurt am Main

Die App-Zeile `Frankfurt am Main; Hessen; A 175; B 500; GewSt 460; Datenstand 2022` ist für den Datenstand 2022 plausibel und historisch korrekt. Sie darf aber nicht als aktueller Wert verkauft werden.

Quellenlage:

- Stadt Frankfurt: ab 01.01.2025 Grundsteuer A 317,62 / Grundsteuer B 854,69; vorher A 175 / B 500.
- IHK Frankfurt, Realsteuerhebesätze 2026/2025: Frankfurt am Main A 317,62 / B 854,69 / GewSt 460, Stand März 2026.

Entscheidung für PROJ-9:

- 2022-Zeile bleibt historisch nachvollziehbar.
- Für aktuelle Demo ist Frankfurt auf 2025/2026 zu aktualisieren oder klar als historischer Datenstand zu markieren.

#### Prüfergebnis Wiesbaden

Die App-Zeile `Wiesbaden; Hessen; A 275; B 492; GewSt 454; Datenstand 2022` ist für den Datenstand 2022 plausibel und historisch korrekt. Sie darf aber nicht als aktueller Wert verkauft werden.

Quellenlage:

- Hebesatzsatzung Grundsteuer Wiesbaden: ab 01.01.2025 Grundsteuer A 341,01 / Grundsteuer B 690,06.
- Haushaltssatzung Wiesbaden 2026: Grundsteuer A 341,01 / Grundsteuer B 690,06 / Gewerbesteuer 460.
- Gewerbesteuer-Hebesatzsatzung Wiesbaden: Gewerbesteuer 460 ab 01.01.2024.
- IHK-Übersicht 2026 nennt abweichend Gewerbesteuer 395. Dieser Konflikt muss vor Datenupdate nochmals gegen die Stadt bestätigt werden.

Entscheidung für PROJ-9:

- 2022-Zeile bleibt historisch nachvollziehbar.
- Für aktuelle Demo ist Wiesbaden auf A 341,01 / B 690,06 zu aktualisieren.
- Gewerbesteuer vor produktiver Aktualisierung nochmals gegen städtische Quelle prüfen; aktuell wird die städtische Satzung mit 460 höher gewichtet.

#### Prüfergebnis Kassel

Die App-Zeile `Kassel; Hessen; A 450; B 490; GewSt 440; Datenstand 2022` ist für den Datenstand 2022 plausibel und historisch korrekt. Grundsteuer B und Gewerbesteuer sind auch aktuell unverändert, Grundsteuer A ist ab 2025 niedriger.

Quellenlage:

- Stadt Kassel, Hebesatzsatzung 2025: Grundsteuer A 345 / Grundsteuer B 490 / Gewerbesteuer 440.
- Stadt Kassel, Grundsteuerreform-Seite: Grundsteuer B bleibt 490, Grundsteuer A sinkt ab 2025 von 450 auf 345.
- Haushaltssatzung Kassel 2025/2026: 2025 und 2026 jeweils A 345 / B 490 / GewSt 440.

Entscheidung für PROJ-9:

- 2022-Zeile ist historisch korrekt.
- Für aktuelle Demo muss mindestens Grundsteuer A auf 345 und Datenstand 2025/2026 aktualisiert werden.

#### Prüfergebnis Darmstadt

Die App-Zeile `Darmstadt; Hessen; A 320; B 535; GewSt 454; Datenstand 2022` ist für den Datenstand 2022 plausibel und historisch korrekt. Sie darf aber nicht als aktueller Wert verkauft werden.

Quellenlage:

- Digitales Rathaus Darmstadt: Stadt folgt der Hebesatzempfehlung ab 2025 mit Grundsteuer A rund 693 und Grundsteuer B rund 1.181.
- Wirtschaftsdaten der Stadt Darmstadt: Gewerbesteuer 459 / Grundsteuer B 1.181.
- IHK Darmstadt, Realsteuerhebesätze 2025: Darmstadt A 693 / B 1.181 / GewSt 459.
- IHK Hessen-Übersicht 2026: Darmstadt B 1.181 / GewSt 459.

Entscheidung für PROJ-9:

- 2022-Zeile bleibt historisch nachvollziehbar.
- Für aktuelle Demo ist Darmstadt auf A 693 / B 1.181 / GewSt 459 zu aktualisieren oder klar als historischer Datenstand zu markieren.

#### Prüfergebnis Offenbach am Main

Die App-Zeile `Offenbach am Main; Hessen; A 250; B 895; GewSt 440; Datenstand 2022` ist für den Datenstand 2022 plausibel und historisch korrekt.

Quellenlage:

- Stadt Offenbach, Grundsteuerreform: Grundsteuer B 2024 noch 895, ab 01.01.2025 aufkommensneutraler Hebesatz 1.230.
- Gewerbesteuer für Offenbach am Main 2025 unverändert bei 440.
- Grundsteuer A 2025 in den öffentlichen Quellen nicht beziffert; vor produktiver Aktualisierung gegen die städtische Hebesatzsatzung zu prüfen.

Entscheidung für PROJ-9:

- 2022-Zeile bleibt historisch nachvollziehbar.
- Für aktuelle Demo ist Grundsteuer B auf 1.230 zu aktualisieren; Grundsteuer A vorher kommunal bestätigen.

#### Prüfergebnis Hanau

Die App-Zeile `Hanau; Hessen; A 330; B 595; GewSt 430; Datenstand 2022` ist für den Datenstand 2022 plausibel und historisch korrekt (Stand seit 2017).

Quellenlage:

- Stadtverordnetenversammlung Hanau, Beschluss vom 18.11.2024: ab 2025 Grundsteuer A 175 / Grundsteuer B 645 (Landesempfehlung A 176,08 / B 646,62, bewusst leicht darunter).
- Gewerbesteuer 2025 unverändert bei 430, geplante Anhebung auf 458 ab 2026.

Entscheidung für PROJ-9:

- 2022-Zeile bleibt historisch nachvollziehbar.
- Für aktuelle Demo ist Hanau auf A 175 / B 645 zu aktualisieren; Gewerbesteuer 2026 separat nachziehen.

#### Prüfergebnis Gießen

Die App-Zeile `Gießen; Hessen; A 330; B 600; GewSt 420; Datenstand 2022` ist für den Datenstand 2022 plausibel und historisch korrekt.

Quellenlage:

- Stadt Gießen, Grundsteuerreform: ab 01.01.2025 Grundsteuer A 259 (vorher 330) / Grundsteuer B 626 (vorher 600).
- Gewerbesteuer 2025 in den geprüften Quellen nicht separat ausgewiesen; 2022-Wert 420, vor produktiver Aktualisierung kommunal bestätigen.

Entscheidung für PROJ-9:

- 2022-Zeile bleibt historisch nachvollziehbar.
- Für aktuelle Demo ist Gießen auf A 259 / B 626 zu aktualisieren; Gewerbesteuer kommunal bestätigen.

#### Prüfergebnis Marburg

Die App-Zeile `Marburg; Hessen; A 280; B 390; GewSt 357; Datenstand 2022` ist für den Datenstand 2022 plausibel und historisch korrekt.

Quellenlage:

- Universitätsstadt Marburg, Neuaufteilung der Grundsteuer ab 2025: Grundsteuer A 210 (vorher 280) / Grundsteuer B 450 (vorher 390), Grundsteuer B 490 ab 2026.
- Gewerbesteuer 380 ab 2025, geplante Anhebung auf 420 ab 2026 (vorher 357).

Entscheidung für PROJ-9:

- 2022-Zeile bleibt historisch nachvollziehbar.
- Für aktuelle Demo ist Marburg je nach Stichjahr auf den 2025- oder 2026-Stand zu aktualisieren.

#### Prüfergebnis Fulda

Die App-Zeile `Fulda; Hessen; A 220; B 340; GewSt 380; Datenstand 2022` ist für den Datenstand 2022 plausibel und historisch korrekt.

Quellenlage:

- Stadt Fulda, Hebesatzsatzung 2025: Grundsteuer A 144 / Grundsteuer B 313 (rund 312,85, aufkommensneutral, leicht unter dem 2024-Niveau von 340).
- Gewerbesteuer 2025 unverändert bei 380.

Entscheidung für PROJ-9:

- 2022-Zeile bleibt historisch nachvollziehbar.
- Für aktuelle Demo ist Grundsteuer A/B auf den 2025-Stand zu aktualisieren; Gewerbesteuer bleibt 380.

#### Prüfergebnis NRW-Stichprobe

Die NRW-App-Zeilen aus `data/import/nrw-hessen-2022.csv` wurden gegen den 2022-Importstand und gegen aktuelle kommunale Veröffentlichungen geprüft. Ergebnis: Die 2022-Werte sind historisch als Pilotdatenbasis nutzbar, aber viele große NRW-Städte haben ab 2025 andere oder differenzierte Grundsteuer-B-Hebesätze. Diese Stichprobe bestätigt deshalb zwei Produktentscheidungen:

- In der Demo muss der Datenstand 2022 sichtbar bleiben.
- PROJ-10 ist fachlich notwendig, weil ein einzelnes Feld `Grundsteuer B` ab 2025 für mehrere NRW-Kommunen nicht mehr ausreicht.

Geprüfte kommunale Quellen:

| Kommune | Quelle |
|---------|--------|
| Düsseldorf | https://www.duesseldorf.de/steueramt/grundsteuer/ und https://www.duesseldorf.de/finanzen/haushaltsplaene/haushaltsdaten-2025 |
| Köln | https://www.stadt-koeln.de/artikel/06286/index.html |
| Essen | https://www.essen.de/rathaus/haushalt_und_finanzen/grundbesitzabgaben/gba_faqs_1.de.html und https://service.essen.de/detail/-/vr-bis-detail/dienstleistung/43362/show |
| Dortmund | https://www.dortmund.de/newsroom/nachrichten-dortmund.de/wohnen-soll-bezahlbar-bleiben-dortmund-beschliesst-unterschiedliche-grundsteuer-hebesaetze.html und https://www.dortmund.de/dortmund/projekte/rathaus/verwaltung/stadtkasse-und-steueramt/downloads/linksunddownloads/satzung-ueber-die-festsetzung-der-hebesaetze-fuer-die-realsteuern-v.-19.12.2025.pdf |
| Bonn | https://www.bonn.de/medien-global/amt-13/amtsblatt/21_2025_Amtsblatt.pdf |
| Duisburg | https://www.duisburg.de/vv/produkte/pro_du/dez_i/21/grundsteuer_639782_639789_639792_639795_639798_639801.php und https://www.duisburg.de/vv/produkte/pro_du/dez_i/21/gewerbesteuer_284817.php |
| Münster | https://www.stadt-muenster.de/finanzen/steuern-und-gebuehren/steuerhebesaetze |
| Aachen | https://serviceportal.aachen.de/suche/-/vr-bis-detail/dienstleistung/2693/show und https://www.aachen.de/in-aachen-leben/politik-und-verwaltung/stadtrecht/finanzen/satzung-ueber-die-festsetzung-der-hebesaetze.pdf?cid=bfv |
| Bielefeld | https://www.bielefeld.de/grundsteuer |
| Wuppertal | https://www.wuppertal.de/rathaus-buergerservice/verwaltung/politik/stadtrecht-dokumente/2-01.pdf |
| Bochum | https://www.bochum.de/Amt-fuer-Finanzsteuerung/Steuerhebesaetze-und-Gebuehren |

## Spalten-Mapping

Das Skript `scripts/convert-realsteuer.mjs` liest die Länder-Tabellenblätter
`Land 05 Nordrhein-Westfalen` und `Land 06 Hessen` und erzeugt
`data/import/nrw-hessen-2022.csv` im Schema, das `src/lib/imports/csv.ts` erwartet.

| Excel-Spalte | Import-CSV-Spalte | Anmerkung |
|--------------|-------------------|-----------|
| Gemeinde | `name` | Typzusatz nach Komma wird abgetrennt (z. B. „Frankfurt am Main, Stadt" → „Frankfurt am Main") |
| (Tabellenblatt) | `bundesland` | `Nordrhein-Westfalen` bzw. `Hessen` |
| — | `kreis` | leer — in dieser Quelle nicht als Klartext enthalten |
| Grundsteuer A | `grundsteuer_a` | |
| Grundsteuer B | `grundsteuer_b` | Pflichtfeld; Gemeinden ohne Wert werden ausgelassen |
| Gewerbesteuer | `gewerbesteuer` | |
| — | `vorjahr_b` | **bewusst leer** — siehe unten |
| — | `datenstand` | `2022` |
| — | `quellenname` | konstant gesetzt |
| — | `quellen_url` | konstant gesetzt |

### Warum `vorjahr_b` leer bleibt

Die Import-Pipeline (`src/lib/imports/validate.ts`) flaggt jede Änderung von
≥ 100 Punkten zwischen `vorjahr_b` und `grundsteuer_b` als Warnung. Zum 1.1.2025
ist die **Grundsteuerreform** in Kraft getreten: Bemessungsgrundlage und damit die
Hebesätze wurden grundlegend neu gesetzt. Hebesätze vor und nach 2025 sind nicht
direkt vergleichbar. Beim ersten Import (Stand 2022) bleibt `vorjahr_b` daher leer,
damit keine sachlich falschen Delta-Warnungen entstehen. `vorjahr_b` wird erst beim
2025-Update sinnvoll befüllt.

## Daten aktualisieren

1. Aktuelle Excel von der Quelle herunterladen, als `data/raw/hebesaetze-realsteuern.xlsx` ablegen.
2. In `scripts/convert-realsteuer.mjs` `BERICHTSJAHR`, `QUELLENNAME` und ggf. die
   Tabellenblatt-Namen anpassen.
3. `node scripts/convert-realsteuer.mjs` ausführen → erzeugt die Import-CSV.
4. CSV stichprobenartig prüfen (bekannte Städte gegen die Originalwerte).
5. Als Admin in `/admin/importe` hochladen, Vorschau prüfen, Import-Run freigeben.

Roh-Downloads (`data/raw/`) werden **nicht** versioniert (siehe `.gitignore`) —
sie sind über die obigen URLs reproduzierbar.

## Geprüfte, aber nicht genutzte Quellen

| Quelle | Warum nicht genutzt |
|--------|---------------------|
| Destatis „Realsteuervergleich 2024" (Statistischer Bericht) | Enthält nur **aggregierte** Tabellen (nach Größenklassen/Ländern), keine Einzelgemeinden |
| Regionaldatenbank Deutschland, Tabelle 71231-03-01-5 | Hat aktuelle Gemeinde-Daten (bis 31.12.2024), Bulk-Download erfordert aber ein kostenloses Benutzerkonto — Kandidat für ein späteres Update |
| Open.NRW „aufkommensneutrale Hebesätze" | Nur PDF; „aufkommensneutral" ist ein anderes Konzept (Reform-Empfehlungswert) |
| IHK Realsteueratlas | Deckt nur Schleswig-Holstein ab |

## Geplante nächste Schritte für die Datenbasis

- **2024-Update** über die Regionaldatenbank Deutschland (kostenloses Konto nötig).
- **2025-Reformdaten**, sobald flächendeckend veröffentlicht — dann auch `vorjahr_b` befüllen.
- **Unterjährige Änderungen** (Gemeinderatsbeschlüsse, Amtsblätter) — keine zentrale Quelle vorhanden.
