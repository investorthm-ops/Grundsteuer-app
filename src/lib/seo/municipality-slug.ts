import type { Municipality } from '@/lib/types/municipality'

const UMLAUT_MAP: Record<string, string> = {
  ae: 'a',
  oe: 'o',
  ue: 'u',
  ss: 'ss',
}

export function municipalitySlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\u00e4/g, 'ae')
    .replace(/\u00f6/g, 'oe')
    .replace(/\u00fc/g, 'ue')
    .replace(/\u00df/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function relaxedMunicipalityKey(value: string) {
  let normalized = municipalitySlug(value)
  for (const [search, replacement] of Object.entries(UMLAUT_MAP)) {
    normalized = normalized.replaceAll(search, replacement)
  }
  return normalized
}

export function findMunicipalityBySlug(items: Municipality[], slug: string) {
  const target = relaxedMunicipalityKey(slug)
  return items.find((item) => relaxedMunicipalityKey(item.name) === target) ?? null
}

