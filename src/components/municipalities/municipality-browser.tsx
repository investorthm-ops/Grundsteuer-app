'use client'

import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, FileDown, Info, RefreshCw, Search, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BUNDESLAENDER } from '@/lib/validation/municipality'
import type { Municipality, MunicipalityListResponse } from '@/lib/types/municipality'
import type { WatchlistListResponse } from '@/lib/types/watchlist'

const ALL_STATES = 'alle'

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

function formatRate(value: number | null) {
  return typeof value === 'number' ? `${value} %` : '-'
}

function hasDifferentiatedB(item: Municipality) {
  return typeof item.hebesatz_b_wohnen === 'number' || typeof item.hebesatz_b_nichtwohnen === 'number'
}

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('de-DE').format(new Date(value))
}

function delta(current: number, previous: number | null) {
  if (typeof previous !== 'number') return { label: '-', tone: 'neutral' as const }
  const change = current - previous
  if (change > 0) return { label: `+${change}`, tone: 'up' as const }
  if (change < 0) return { label: `${change}`, tone: 'down' as const }
  return { label: '0', tone: 'neutral' as const }
}

type MunicipalityBrowserProps = {
  initialQuery?: string
}

export function MunicipalityBrowser({ initialQuery = '' }: MunicipalityBrowserProps) {
  const [items, setItems] = useState<Municipality[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState(initialQuery)
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery)
  const [bundesland, setBundesland] = useState(ALL_STATES)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set())
  const [pendingWatchlistId, setPendingWatchlistId] = useState<string | null>(null)

  const pageSize = 50
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const requestUrl = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    })
    if (submittedQuery) params.set('q', submittedQuery)
    if (bundesland !== ALL_STATES) params.set('bundesland', bundesland)
    return `/api/municipalities?${params.toString()}`
  }, [bundesland, page, submittedQuery])

  const exportUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (submittedQuery) params.set('q', submittedQuery)
    if (bundesland !== ALL_STATES) params.set('bundesland', bundesland)
    const queryString = params.toString()
    return `/api/exports/municipalities${queryString ? `?${queryString}` : ''}`
  }, [bundesland, submittedQuery])

  useEffect(() => {
    let isCurrent = true
    setIsLoading(true)
    setError(null)

    Promise.all([
      fetch(requestUrl).then(async (response) => {
        if (!response.ok) throw new Error('Daten konnten nicht geladen werden.')
        return (await response.json()) as MunicipalityListResponse
      }),
      fetch('/api/watchlist').then(async (response) => {
        if (!response.ok) return { data: [] } as WatchlistListResponse
        return (await response.json()) as WatchlistListResponse
      }),
    ])
      .then(([municipalitiesPayload, watchlistPayload]) => {
        if (!isCurrent) return
        setItems(municipalitiesPayload.data)
        setTotal(municipalitiesPayload.total)
        setWatchlistIds(new Set(watchlistPayload.data.map((item) => item.municipality_id)))
      })
      .catch((err: Error) => {
        if (!isCurrent) return
        setError(err.message)
        setItems([])
        setTotal(0)
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [requestUrl, refreshKey])

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPage(1)
    setSubmittedQuery(query.trim())
  }

  function resetFilters() {
    setQuery('')
    setSubmittedQuery('')
    setBundesland(ALL_STATES)
    setPage(1)
  }

  async function toggleWatchlist(municipalityId: string) {
    const isListed = watchlistIds.has(municipalityId)
    setPendingWatchlistId(municipalityId)
    setError(null)

    try {
      const response = await fetch(
        isListed ? `/api/watchlist/${municipalityId}` : '/api/watchlist',
        {
          method: isListed ? 'DELETE' : 'POST',
          headers: isListed ? undefined : { 'Content-Type': 'application/json' },
          body: isListed ? undefined : JSON.stringify({ municipalityId }),
        }
      )
      if (!response.ok) throw new Error('Watchlist konnte nicht aktualisiert werden.')
      setWatchlistIds((current) => {
        const next = new Set(current)
        if (isListed) next.delete(municipalityId)
        else next.add(municipalityId)
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler.')
    } finally {
      setPendingWatchlistId(null)
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border bg-white p-4">
        <form className="grid gap-3 lg:grid-cols-[1fr_260px_auto_auto_auto]" onSubmit={submitSearch}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Gemeinde suchen"
              className="pl-9"
            />
          </div>
          <Select
            value={bundesland}
            onValueChange={(value) => {
              setBundesland(value)
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Bundesland" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATES}>Alle Bundesländer</SelectItem>
              {BUNDESLAENDER.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">Suchen</Button>
          <Button asChild variant="outline">
            <a href={exportUrl}>
              <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
              CSV exportieren
            </a>
          </Button>
          <Button type="button" variant="outline" onClick={resetFilters}>
            Zurücksetzen
          </Button>
        </form>
      </section>

      <section className="rounded-lg border bg-white">
        <div className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-600">
            {isLoading ? 'Daten werden geladen' : `${total} Einträge gefunden`}
          </p>
          <Button variant="ghost" size="sm" onClick={() => setRefreshKey((current) => current + 1)}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Aktualisieren
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-56">Gemeinde</TableHead>
                <TableHead>Merken</TableHead>
                <TableHead>Bundesland</TableHead>
                <TableHead>GrSt A</TableHead>
                <TableHead>GrSt B Standard</TableHead>
                <TableHead>B Wohnen</TableHead>
                <TableHead>B Nichtwohnen</TableHead>
                <TableHead>Vorjahr B</TableHead>
                <TableHead>Delta</TableHead>
                <TableHead>GewSt</TableHead>
                <TableHead>Stand & Quelle</TableHead>
                <TableHead>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="inline-flex items-center gap-1">
                        Status
                        <Info className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                        <span className="sr-only">Bedeutung der Statuswerte anzeigen</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs space-y-1">
                        <p>
                          <strong>bestätigt</strong> – Wert aus einer dokumentierten Quelle importiert oder manuell geprüft.
                        </p>
                        <p>
                          <strong>offen</strong> – Quelle noch nicht bestätigt, nur Arbeitsstand.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const change = delta(item.hebesatz_b, item.vorjahr_b)
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div>{displayText(item.name)}</div>
                      {item.kreis ? <div className="text-xs text-zinc-500">{displayText(item.kreis)}</div> : null}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleWatchlist(item.id)}
                        disabled={pendingWatchlistId === item.id}
                        aria-label={watchlistIds.has(item.id) ? 'Von Watchlist entfernen' : 'Zur Watchlist hinzufügen'}
                      >
                        <Star
                          className={watchlistIds.has(item.id) ? 'h-4 w-4 fill-zinc-900 text-zinc-900' : 'h-4 w-4'}
                          aria-hidden="true"
                        />
                      </Button>
                    </TableCell>
                    <TableCell>{item.bundesland}</TableCell>
                    <TableCell>{formatRate(item.hebesatz_a)}</TableCell>
                    <TableCell>{formatRate(item.hebesatz_b)}</TableCell>
                    <TableCell>
                      <div>{formatRate(item.hebesatz_b_wohnen)}</div>
                      {hasDifferentiatedB(item) ? <div className="text-xs text-zinc-500">differenziert</div> : null}
                    </TableCell>
                    <TableCell>{formatRate(item.hebesatz_b_nichtwohnen)}</TableCell>
                    <TableCell>{formatRate(item.vorjahr_b)}</TableCell>
                    <TableCell>
                      <span
                        className={
                          change.tone === 'up'
                            ? 'font-medium text-red-700'
                            : change.tone === 'down'
                              ? 'font-medium text-emerald-700'
                              : 'text-zinc-600'
                        }
                      >
                        {change.label}
                      </span>
                    </TableCell>
                    <TableCell>{formatRate(item.hebesatz_gewerbe)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{formatDate(item.datenstand)}</div>
                        <div className="text-xs text-zinc-500">
                          aktualisiert: {formatDate(item.updated_at)}
                        </div>
                        {item.quellenname ? (
                          item.quellen_url ? (
                            <a
                              href={item.quellen_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex max-w-64 items-center gap-1 truncate text-xs font-medium text-zinc-700 underline-offset-2 hover:underline"
                            >
                              <span className="truncate">{item.quellenname}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                            </a>
                          ) : (
                            <div className="max-w-64 truncate text-xs text-zinc-500">{item.quellenname}</div>
                          )
                        ) : (
                          <div className="text-xs text-zinc-500">Quelle offen</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.quellenstatus === 'bestaetigt' ? 'default' : 'secondary'}>
                        {item.quellenstatus === 'bestaetigt' ? 'bestätigt' : 'offen'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
              {!isLoading && !error && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-28 text-center text-zinc-500">
                    Für diese Auswahl sind noch keine Daten verfügbar.
                  </TableCell>
                </TableRow>
              ) : null}
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-28 text-center text-zinc-500">
                    Daten werden geladen.
                  </TableCell>
                </TableRow>
              ) : null}
              {error ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-28 text-center text-red-700">
                    {error}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-600">
            Seite {page} von {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Zurück
            </Button>
            <Button
              variant="outline"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((current) => current + 1)}
            >
              Weiter
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
