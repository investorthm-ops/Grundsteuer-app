// Relativer Import statt @/-Alias: Diese Datei wird von node --test geladen,
// und der Test-Runner kennt den Alias nicht (siehe Commit 7917909).
import type { Municipality } from '../types/municipality'

/**
 * Gemeinsame Formatierungs-Helfer für Hebesatz-Anzeigen und Exporte.
 * Eine Quelle der Wahrheit für UI-Komponenten, CSV-Export und (künftig)
 * PDF-Reports (PROJ-18), damit Zahlen, Daten und der Haftungshinweis
 * überall identisch ausgegeben werden.
 */

export const DATA_NOTICE =
  'Recherche- und Vergleichsdaten; Fehler sind möglich. Maßgeblich sind die amtlichen Veröffentlichungen der Kommune oder Behörde. Keine Garantie für Richtigkeit, Vollständigkeit oder Aktualität.'

/**
 * Hebesatz als Prozentwert, z. B. "480 %". Auf max. zwei Nachkommastellen
 * gerundet (Durchschnitte können Float-Artefakte haben, Hebesätze selbst
 * sind per Validierung auf zwei Nachkommastellen begrenzt).
 */
export function formatRate(value: number | null | undefined): string {
  return typeof value === 'number' ? `${Math.round(value * 100) / 100} %` : '-'
}

/**
 * Datum im de-DE-Kurzformat. Der Fallback-Text ist konfigurierbar
 * (z. B. '-', 'noch offen', 'unbegrenzt').
 */
export function formatDate(value: string | null | undefined, fallback = '-'): string {
  if (!value) return fallback
  return new Intl.DateTimeFormat('de-DE').format(new Date(value))
}

/**
 * Zahlen im deutschen Format ausgeben (Dezimalkomma), damit Excel-DE Werte
 * wie 854,69 korrekt erkennt. Ganze Zahlen bleiben ohne Nachkommastellen.
 */
export function num(value: number | string | null | undefined): string | number {
  if (typeof value !== 'number') return value ?? ''
  return value.toLocaleString('de-DE', { maximumFractionDigits: 2, useGrouping: false })
}

/** Delta Grundsteuer B zum Vorjahr, auf zwei Nachkommastellen gerundet. */
export function deltaB(item: Municipality): number | '' {
  if (typeof item.vorjahr_b !== 'number') return ''
  return Math.round((item.hebesatz_b - item.vorjahr_b) * 100) / 100
}
