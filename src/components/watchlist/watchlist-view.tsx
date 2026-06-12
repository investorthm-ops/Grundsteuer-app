'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Star, Trash2 } from 'lucide-react'
import { isStale } from '@/lib/staleness'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate, formatRate } from '@/lib/reports/format'
import type { WatchlistItem, WatchlistListResponse } from '@/lib/types/watchlist'

const DISPLAY_REPLACEMENTS: Record<string, string> = {
  Koeln: 'Köln',
  Muenster: 'Münster',
  Staedteregion: 'Städteregion',
  bestaetigt: 'bestätigt',
}

function displayText(value: string) {
  return Object.entries(DISPLAY_REPLACEMENTS).reduce(
    (text, [search, replacement]) => text.replaceAll(search, replacement),
    value
  )
}

function delta(current: number, previous: number | null) {
  if (typeof previous !== 'number') return null
  // Auf zwei Nachkommastellen runden (vermeidet Float-Artefakte bei Dezimal-Hebesaetzen).
  return Math.round((current - previous) * 100) / 100
}

function alertLabel(change: number | null) {
  if (change === null) return { label: 'kein Vorjahr', variant: 'secondary' as const }
  if (change >= 100) return { label: 'auffällig', variant: 'destructive' as const }
  if (change > 0) return { label: 'erhöht', variant: 'secondary' as const }
  return { label: 'stabil', variant: 'default' as const }
}

export function WatchlistView() {
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const aDelta = delta(a.municipality.hebesatz_b, a.municipality.vorjahr_b) ?? -9999
        const bDelta = delta(b.municipality.hebesatz_b, b.municipality.vorjahr_b) ?? -9999
        return bDelta - aDelta || a.municipality.name.localeCompare(b.municipality.name)
      }),
    [items]
  )

  async function loadWatchlist() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/watchlist')
      if (!response.ok) throw new Error('Watchlist konnte nicht geladen werden.')
      const payload = (await response.json()) as WatchlistListResponse
      setItems(payload.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler.')
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }

  async function removeItem(municipalityId: string) {
    setPendingId(municipalityId)
    setError(null)
    try {
      const response = await fetch(`/api/watchlist/${municipalityId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Eintrag konnte nicht entfernt werden.')
      setItems((current) => current.filter((item) => item.municipality_id !== municipalityId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler.')
    } finally {
      setPendingId(null)
    }
  }

  useEffect(() => {
    loadWatchlist()
  }, [])

  const notableCount = sortedItems.filter((item) => {
    const change = delta(item.municipality.hebesatz_b, item.municipality.vorjahr_b)
    return typeof change === 'number' && change >= 100
  }).length

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Gemerkte Gemeinden</p>
          <p className="mt-1 text-2xl font-semibold">{items.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Auffällige Erhöhungen</p>
          <p className="mt-1 text-2xl font-semibold">{notableCount}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Alert-Schwelle</p>
          <p className="mt-1 text-2xl font-semibold">100</p>
        </div>
      </section>

      {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <section className="rounded-lg border bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-base font-semibold">Beobachtete Gemeinden</h2>
            <p className="text-sm text-zinc-500">Sortiert nach größter Änderung von Grundsteuer B.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={loadWatchlist} disabled={isLoading}>
            Aktualisieren
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-56">Gemeinde</TableHead>
                <TableHead>Bundesland</TableHead>
                <TableHead>GrSt B</TableHead>
                <TableHead>Vorjahr B</TableHead>
                <TableHead>Delta</TableHead>
                <TableHead>Hinweis</TableHead>
                <TableHead>Stand</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((item) => {
                const municipality = item.municipality
                const change = delta(municipality.hebesatz_b, municipality.vorjahr_b)
                const alert = alertLabel(change)
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {change !== null && change >= 100 ? (
                          <AlertTriangle className="h-4 w-4 text-red-700" aria-hidden="true" />
                        ) : (
                          <Star className="h-4 w-4 fill-zinc-900 text-zinc-900" aria-hidden="true" />
                        )}
                        <span>{displayText(municipality.name)}</span>
                      </div>
                      {municipality.kreis ? (
                        <div className="text-xs text-zinc-500">{displayText(municipality.kreis)}</div>
                      ) : null}
                    </TableCell>
                    <TableCell>{municipality.bundesland}</TableCell>
                    <TableCell>{formatRate(municipality.hebesatz_b)}</TableCell>
                    <TableCell>{formatRate(municipality.vorjahr_b)}</TableCell>
                    <TableCell className={change !== null && change > 0 ? 'font-medium text-red-700' : 'text-zinc-600'}>
                      {change === null ? '-' : change > 0 ? `+${change}` : String(change)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={alert.variant}>{alert.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(municipality.datenstand)}
                      {isStale(municipality.datenstand) ? (
                        <span className="ml-2 text-xs text-amber-700">Aktualität prüfen</span>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant={municipality.quellenstatus === 'bestaetigt' ? 'default' : 'secondary'}>
                        {municipality.quellenstatus === 'bestaetigt' ? 'bestätigt' : 'offen'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(municipality.id)}
                        disabled={pendingId === municipality.id}
                        aria-label={`${displayText(municipality.name)} aus Watchlist entfernen`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {!isLoading && sortedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-zinc-500">
                    Noch keine Gemeinden gemerkt. Füge Gemeinden über die Datenbank hinzu.
                  </TableCell>
                </TableRow>
              ) : null}
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-zinc-500">
                    Watchlist wird geladen.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
