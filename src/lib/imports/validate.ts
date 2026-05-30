import { BUNDESLAENDER } from '@/lib/validation/municipality'
import type { Municipality } from '@/lib/types/municipality'

type ExistingMunicipality = Pick<
  Municipality,
  | 'id'
  | 'name'
  | 'bundesland'
  | 'kreis'
  | 'hebesatz_a'
  | 'hebesatz_b'
  | 'hebesatz_gewerbe'
  | 'vorjahr_b'
  | 'datenstand'
  | 'quellenstatus'
>

export type ValidatedImportRow = {
  row_number: number
  status: 'valid' | 'warning' | 'error' | 'conflict'
  action: 'create' | 'update' | 'skip'
  municipality_id: string | null
  raw_data: Record<string, string>
  errors: string[]
  warnings: string[]
  existing_snapshot: Record<string, unknown> | null
  name: string | null
  bundesland: string | null
  kreis: string | null
  hebesatz_a: number | null
  hebesatz_b: number | null
  hebesatz_gewerbe: number | null
  vorjahr_b: number | null
  datenstand: string | null
  quellenname: string | null
  quellen_url: string | null
  delta_b: number | null
}

function normalizeKey(value: string | null | undefined) {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replaceAll('\u00e4', 'ae')
    .replaceAll('\u00f6', 'oe')
    .replaceAll('\u00fc', 'ue')
    .replaceAll('\u00df', 'ss')
}

function parseOptionalRate(value: string | undefined, label: string, errors: string[]) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return null
  // Prozentzeichen weg. Deutsches Dezimalkomma zulassen
  // (Hebesaetze koennen zwei Nachkommastellen haben, z. B. Hessen 854,69).
  // Nur wenn ein Komma vorhanden ist, gelten Punkte als Tausendertrennzeichen;
  // sonst bleibt ein Punkt als Dezimalpunkt erhalten ("854.69" -> 854.69).
  const cleaned = trimmed.replace('%', '').trim()
  const normalized = cleaned.includes(',')
    ? cleaned.replaceAll('.', '').replace(',', '.')
    : cleaned
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) {
    errors.push(`${label} ist keine gueltige Zahl.`)
    return null
  }
  if (parsed < 0 || parsed > 2000) {
    errors.push(`${label} muss zwischen 0 und 2000 liegen.`)
    return null
  }
  // Auf zwei Nachkommastellen runden (Hebesaetze haben max. zwei).
  return Math.round(parsed * 100) / 100
}

function parseRequiredRate(value: string | undefined, label: string, errors: string[]) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    errors.push(`${label} fehlt.`)
    return null
  }
  return parseOptionalRate(trimmed, label, errors)
}

function normalizeDate(value: string | undefined, errors: string[]) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    errors.push('Datenstand fehlt.')
    return null
  }
  if (/^\d{4}$/.test(trimmed)) return `${trimmed}-01-01`
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('.')
    return `${year}-${month}-${day}`
  }
  errors.push('Datenstand muss Jahr, YYYY-MM-DD oder DD.MM.YYYY sein.')
  return null
}

function pickExisting(
  existingByKey: Map<string, ExistingMunicipality>,
  name: string,
  bundesland: string
) {
  return existingByKey.get(`${normalizeKey(bundesland)}|${normalizeKey(name)}`) ?? null
}

export function validateImportRows(
  rows: Record<string, string>[],
  existing: ExistingMunicipality[],
  fallbackSourceName: string,
  fallbackSourceUrl: string | null,
  fallbackDataStand: string
) {
  const existingByKey = new Map(
    existing.map((item) => [`${normalizeKey(item.bundesland)}|${normalizeKey(item.name)}`, item])
  )
  const duplicateCounts = rows.reduce((counts, raw) => {
    const name = raw.name?.trim()
    const bundesland = raw.bundesland?.trim()
    if (!name || !bundesland) return counts

    const key = `${normalizeKey(bundesland)}|${normalizeKey(name)}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
    return counts
  }, new Map<string, number>())

  return rows.map<ValidatedImportRow>((raw, index) => {
    const errors: string[] = []
    const warnings: string[] = []
    const name = raw.name?.trim() || null
    const bundesland = raw.bundesland?.trim() || null
    const kreis = raw.kreis?.trim() || null
    const quellenname = raw.quellenname?.trim() || fallbackSourceName
    const quellenUrl = raw.quellen_url?.trim() || fallbackSourceUrl
    const datenstand = normalizeDate(raw.datenstand || fallbackDataStand, errors)
    const hebesatzA = parseOptionalRate(raw.grundsteuer_a, 'Grundsteuer A', errors)
    const hebesatzB = parseRequiredRate(raw.grundsteuer_b, 'Grundsteuer B', errors)
    const hebesatzGewerbe = parseOptionalRate(raw.gewerbesteuer, 'Gewerbesteuer', errors)
    const vorjahrB = parseOptionalRate(raw.vorjahr_b, 'Vorjahr B', errors)

    if (!name) errors.push('Gemeindename fehlt.')
    if (!bundesland) {
      errors.push('Bundesland fehlt.')
    } else if (!BUNDESLAENDER.includes(bundesland as (typeof BUNDESLAENDER)[number])) {
      errors.push('Bundesland ung\u00fcltig.')
    }
    if (!quellenname) errors.push('Quellenname fehlt.')

    let duplicateKey: string | null = null
    if (name && bundesland) {
      duplicateKey = `${normalizeKey(bundesland)}|${normalizeKey(name)}`
      if ((duplicateCounts.get(duplicateKey) ?? 0) > 1) {
        errors.push('Doppelte Gemeinde in dieser CSV. Bitte vor dem Import bereinigen.')
      }
    }

    const existingItem = name && bundesland ? pickExisting(existingByKey, name, bundesland) : null
    const deltaB =
      hebesatzB !== null && vorjahrB !== null
        ? Math.round((hebesatzB - vorjahrB) * 100) / 100
        : null
    if (deltaB !== null && Math.abs(deltaB) >= 100) {
      warnings.push('Auff\u00e4llige \u00c4nderung von mindestens 100 Punkten.')
    }

    if (existingItem?.datenstand && datenstand && datenstand < existingItem.datenstand) {
      warnings.push('Datenstand ist \u00e4lter als der bestehende Datensatz.')
    }

    const hasConflict =
      existingItem &&
      ((hebesatzB !== null && existingItem.hebesatz_b !== hebesatzB) ||
        (hebesatzA !== null && existingItem.hebesatz_a !== hebesatzA) ||
        (hebesatzGewerbe !== null && existingItem.hebesatz_gewerbe !== hebesatzGewerbe))

    const status =
      errors.length > 0 ? 'error' : hasConflict ? 'conflict' : warnings.length > 0 ? 'warning' : 'valid'

    return {
      row_number: index + 2,
      status,
      action: existingItem ? 'update' : 'create',
      municipality_id: existingItem?.id ?? null,
      raw_data: raw,
      errors,
      warnings,
      existing_snapshot: existingItem ?? null,
      name,
      bundesland,
      kreis,
      hebesatz_a: hebesatzA,
      hebesatz_b: hebesatzB,
      hebesatz_gewerbe: hebesatzGewerbe,
      vorjahr_b: vorjahrB,
      datenstand,
      quellenname,
      quellen_url: quellenUrl,
      delta_b: deltaB,
    }
  })
}
