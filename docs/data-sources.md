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

| Kommune | Bundesland | Prüfschritt | Status |
|---------|------------|-------------|--------|
| Düsseldorf | Nordrhein-Westfalen | Gegen Original-Excel prüfen | offen |
| Köln | Nordrhein-Westfalen | Gegen Original-Excel prüfen | offen |
| Essen | Nordrhein-Westfalen | Gegen Original-Excel prüfen | offen |
| Dortmund | Nordrhein-Westfalen | Gegen Original-Excel prüfen | offen |
| Frankfurt am Main | Hessen | Gegen Original-Excel prüfen | offen |
| Wiesbaden | Hessen | Gegen Original-Excel prüfen | offen |
| Kassel | Hessen | Gegen Original-Excel prüfen | offen |
| Darmstadt | Hessen | Gegen Original-Excel prüfen | offen |

Diese Liste ist bewusst kurz gehalten. Sie soll als Startpunkt dienen und nach jedem geprüften Import erweitert werden.

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
