/**
 * convert-realsteuer.mjs
 *
 * Wandelt die amtliche Excel "Hebesätze der Realsteuern" der Statistischen Ämter
 * des Bundes und der Länder in eine Import-CSV für die Grundsteuer-Monitor-Pipeline um.
 *
 * Eingabe : data/raw/hebesaetze-realsteuern.xlsx
 * Ausgabe : data/import/nrw-hessen-<jahr>.csv  (UTF-8, ';'-getrennt)
 *
 * Verarbeitet werden die Länder-Tabellenblätter für NRW und Hessen. Pro Gemeinde
 * entsteht eine Zeile im Schema, das src/lib/imports/csv.ts erwartet:
 *   name;bundesland;kreis;grundsteuer_a;grundsteuer_b;gewerbesteuer;vorjahr_b;datenstand;quellenname;quellen_url
 *
 * Wiederverwendung für ein anderes Jahr: neue Excel unter gleichem Pfad ablegen,
 * BERICHTSJAHR anpassen, Skript erneut laufen lassen.
 *
 * Aufruf: node scripts/convert-realsteuer.mjs
 */
import xlsx from 'xlsx'
import { mkdirSync, writeFileSync } from 'node:fs'

// --- Konfiguration -----------------------------------------------------------

const INPUT_FILE = 'data/raw/hebesaetze-realsteuern.xlsx'
const BERICHTSJAHR = '2022'
const QUELLENNAME = 'Statistische Ämter des Bundes und der Länder – Hebesätze der Realsteuern 2022'
const QUELLEN_URL =
  'https://www.statistikportal.de/de/veroeffentlichungen/hebesaetze-der-realsteuern-deutschland'
const OUTPUT_FILE = `data/import/nrw-hessen-${BERICHTSJAHR}.csv`

// Tabellenblatt -> Bundesland (exakte Strings aus der Pipeline-Whitelist)
const SHEETS = [
  { sheet: 'Land 05 Nordrhein-Westfalen', bundesland: 'Nordrhein-Westfalen' },
  { sheet: 'Land 06 Hessen', bundesland: 'Hessen' },
]

// Spaltenindizes im Länder-Tabellenblatt (0-basiert)
const COL = { jahr: 0, gemeinde: 4, grundsteuerA: 6, grundsteuerB: 7, gewerbesteuer: 8 }

// --- Hilfsfunktionen ---------------------------------------------------------

/** Entfernt jegliches Whitespace (inkl. geschütztem Leerzeichen) aus Zahlfeldern. */
function cleanNumber(value) {
  const raw = String(value ?? '').replace(/\s| /g, '')
  if (!raw || !/^\d+$/.test(raw)) return ''
  return raw
}

/** Gemeindename bereinigen: amtliche Typzusätze nach dem Komma abtrennen. */
function cleanName(value) {
  const full = String(value ?? '').trim()
  const name = full.split(',')[0].trim()
  const stripped = full.length > name.length ? full.slice(name.length + 1).trim() : ''
  return { name, stripped }
}

/** CSV-Feld escapen (Trennzeichen ';'). */
function csvField(value) {
  const text = String(value ?? '')
  return /[";\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

// --- Verarbeitung ------------------------------------------------------------

const wb = xlsx.readFile(INPUT_FILE)

const HEADER = [
  'name',
  'bundesland',
  'kreis',
  'grundsteuer_a',
  'grundsteuer_b',
  'gewerbesteuer',
  'vorjahr_b',
  'datenstand',
  'quellenname',
  'quellen_url',
]

const outRows = []
const skipped = []
const strippedSuffixes = new Set()
let perLand = {}

for (const { sheet, bundesland } of SHEETS) {
  const ws = wb.Sheets[sheet]
  if (!ws) {
    console.error(`FEHLER: Tabellenblatt "${sheet}" nicht gefunden.`)
    process.exit(1)
  }
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, blankrows: false, raw: false })
  let count = 0

  for (const row of rows) {
    // Datenzeile erkennen: Spalte "Jahr" enthält eine 4-stellige Jahreszahl.
    if (!/^\d{4}$/.test(String(row[COL.jahr] ?? '').trim())) continue

    const { name, stripped } = cleanName(row[COL.gemeinde])
    if (stripped) strippedSuffixes.add(stripped)

    const grundsteuerA = cleanNumber(row[COL.grundsteuerA])
    const grundsteuerB = cleanNumber(row[COL.grundsteuerB])
    const gewerbesteuer = cleanNumber(row[COL.gewerbesteuer])

    if (!name || /insgesamt/i.test(name)) {
      continue
    }
    // grundsteuer_b ist Pflichtfeld der Pipeline — Zeilen ohne Wert auslassen.
    if (!grundsteuerB) {
      skipped.push(`${name} (${bundesland}): kein Grundsteuer-B-Wert`)
      continue
    }

    outRows.push([
      name,
      bundesland,
      '', // kreis: in dieser Quelle nicht als Klartext enthalten
      grundsteuerA,
      grundsteuerB,
      gewerbesteuer,
      '', // vorjahr_b: bewusst leer (Grundsteuerreform 2025 — siehe docs/data-sources.md)
      BERICHTSJAHR,
      QUELLENNAME,
      QUELLEN_URL,
    ])
    count += 1
  }
  perLand[bundesland] = count
}

// --- Ausgabe schreiben -------------------------------------------------------

mkdirSync('data/import', { recursive: true })
const csv = [HEADER, ...outRows].map((row) => row.map(csvField).join(';')).join('\r\n')
writeFileSync(OUTPUT_FILE, '﻿' + csv, 'utf8')

// --- Bericht -----------------------------------------------------------------

console.log(`Konvertierung abgeschlossen: ${OUTPUT_FILE}`)
for (const [land, count] of Object.entries(perLand)) {
  console.log(`  ${land}: ${count} Gemeinden`)
}
console.log(`  Gesamt: ${outRows.length} Gemeinden`)
if (strippedSuffixes.size > 0) {
  console.log(`  Abgetrennte Namenszusätze: ${[...strippedSuffixes].sort().join(', ')}`)
}
if (skipped.length > 0) {
  console.log(`  Übersprungen (${skipped.length}):`)
  for (const item of skipped) console.log(`    - ${item}`)
}
