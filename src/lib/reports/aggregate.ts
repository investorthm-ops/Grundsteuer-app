// Relativer Import statt @/-Alias: Diese Datei wird von node --test geladen,
// und der Test-Runner kennt den Alias nicht (siehe Commit 7917909).
import type { Municipality } from '../types/municipality'

/**
 * Gemeinsame Aggregat-Helfer für Vergleich, Ranglisten und (künftig)
 * PDF-Reports (PROJ-18): Durchschnitt, Minimum und Maximum über die
 * Steuerarten einer Kommunen-Auswahl.
 */

export type TaxField =
  | 'hebesatz_a'
  | 'hebesatz_b'
  | 'hebesatz_b_wohnen'
  | 'hebesatz_b_nichtwohnen'
  | 'hebesatz_gewerbe'

export const TAX_FIELDS: Array<{ value: TaxField; label: string }> = [
  { value: 'hebesatz_b', label: 'Grundsteuer B' },
  { value: 'hebesatz_b_wohnen', label: 'B Wohnen' },
  { value: 'hebesatz_b_nichtwohnen', label: 'B Nichtwohnen' },
  { value: 'hebesatz_a', label: 'Grundsteuer A' },
  { value: 'hebesatz_gewerbe', label: 'Gewerbesteuer' },
]

export const COMPARISON_FIELDS: TaxField[] = [
  'hebesatz_a',
  'hebesatz_b',
  'hebesatz_b_wohnen',
  'hebesatz_b_nichtwohnen',
  'hebesatz_gewerbe',
]

export function valuesFor(items: Municipality[], field: TaxField): number[] {
  return items
    .map((item) => item[field])
    .filter((value): value is number => typeof value === 'number')
}

/** Durchschnitt (auf ganze Zahl gerundet, wie in der Vergleichsansicht). */
export function average(items: Municipality[], field: TaxField): number | null {
  const values = valuesFor(items, field)
  if (!values.length) return null
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

export function extreme(
  items: Municipality[],
  field: TaxField,
  mode: 'min' | 'max'
): number | null {
  const values = valuesFor(items, field)
  if (!values.length) return null
  return mode === 'min' ? Math.min(...values) : Math.max(...values)
}
