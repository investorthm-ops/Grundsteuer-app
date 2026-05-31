// Bewertet, ob ein Datenstand als veraltet gilt.
// Schwelle bewusst als einzelne Konstante, damit sie leicht angepasst werden kann.
// Default 18 Monate: markiert echte Alt-Daten (z. B. 2022/2023), laesst den
// aktuellen 2024er-GENESIS-Bestand in Ruhe. Fuer strengere Aktualitaet auf 12 setzen.
export const STALENESS_MONTHS = 18

export function isStale(datenstand: string | null, now: Date = new Date()): boolean {
  if (!datenstand) return false
  const stand = new Date(datenstand)
  if (Number.isNaN(stand.getTime())) return false
  const threshold = new Date(now)
  threshold.setMonth(threshold.getMonth() - STALENESS_MONTHS)
  return stand < threshold
}
