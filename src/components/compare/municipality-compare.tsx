'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowDownUp, FileDown, Plus, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BUNDESLAENDER } from '@/lib/validation/municipality'
import {
  average,
  COMPARISON_FIELDS,
  extreme,
  TAX_FIELDS,
  type TaxField,
} from '@/lib/reports/aggregate'
import { formatDate, formatRate } from '@/lib/reports/format'
import type { Municipality, MunicipalityListResponse } from '@/lib/types/municipality'

const ALL_STATES = 'alle'

type SortDir = 'asc' | 'desc'

function fieldLabel(field: TaxField) {
  return TAX_FIELDS.find((item) => item.value === field)?.label ?? 'Hebesatz'
}

function toneFor(value: number | null, min: number | null, max: number | null) {
  if (typeof value !== 'number') return 'text-zinc-400'
  if (min !== null && value === min) return 'font-semibold text-emerald-700'
  if (max !== null && value === max) return 'font-semibold text-red-700'
  return 'text-zinc-900'
}

function differenceLabel(value: number | null, avg: number | null) {
  if (typeof value !== 'number' || avg === null) return '-'
  const diff = value - avg
  if (diff > 0) return `+${diff}`
  return String(diff)
}

export function MunicipalityCompare() {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('Aachen')
  const [bundesland, setBundesland] = useState(ALL_STATES)
  const [searchResults, setSearchResults] = useState<Municipality[]>([])
  const [selected, setSelected] = useState<Municipality[]>([])
  const [rankingField, setRankingField] = useState<TaxField>('hebesatz_b')
  const [rankingState, setRankingState] = useState(ALL_STATES)
  const [rankingSort, setRankingSort] = useState<SortDir>('asc')
  const [rankingItems, setRankingItems] = useState<Municipality[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [isRankingLoading, setIsRankingLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedIds = useMemo(() => new Set(selected.map((item) => item.id)), [selected])
  const exportUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (rankingState !== ALL_STATES) params.set('bundesland', rankingState)
    return `/api/exports/municipalities${params.size ? `?${params.toString()}` : ''}`
  }, [rankingState])

  useEffect(() => {
    let isCurrent = true
    const params = new URLSearchParams({ page: '1', pageSize: '10' })
    if (submittedQuery) params.set('q', submittedQuery)
    if (bundesland !== ALL_STATES) params.set('bundesland', bundesland)

    setIsSearchLoading(true)
    setError(null)

    fetch(`/api/municipalities?${params.toString()}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Kommunen konnten nicht geladen werden.')
        return (await response.json()) as MunicipalityListResponse
      })
      .then((payload) => {
        if (isCurrent) setSearchResults(payload.data)
      })
      .catch((err: Error) => {
        if (!isCurrent) return
        setSearchResults([])
        setError(err.message)
      })
      .finally(() => {
        if (isCurrent) setIsSearchLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [bundesland, submittedQuery])

  useEffect(() => {
    let isCurrent = true
    const params = new URLSearchParams({
      page: '1',
      pageSize: '25',
      sortBy: rankingField,
      sortDir: rankingSort,
    })
    if (rankingState !== ALL_STATES) params.set('bundesland', rankingState)

    setIsRankingLoading(true)
    setError(null)

    fetch(`/api/municipalities?${params.toString()}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Rangliste konnte nicht geladen werden.')
        return (await response.json()) as MunicipalityListResponse
      })
      .then((payload) => {
        if (isCurrent) setRankingItems(payload.data)
      })
      .catch((err: Error) => {
        if (!isCurrent) return
        setRankingItems([])
        setError(err.message)
      })
      .finally(() => {
        if (isCurrent) setIsRankingLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [rankingField, rankingSort, rankingState])

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittedQuery(query.trim())
  }

  function addMunicipality(item: Municipality) {
    if (selectedIds.has(item.id) || selected.length >= 5) return
    setSelected((current) => [...current, item])
  }

  function removeMunicipality(id: string) {
    setSelected((current) => current.filter((item) => item.id !== id))
  }

  function renderRateCell(item: Municipality, field: TaxField) {
    const min = extreme(selected, field, 'min')
    const max = extreme(selected, field, 'max')
    const avg = average(selected, field)
    const value = item[field]
    return (
      <div className="space-y-1">
        <div className={toneFor(value, min, max)}>{formatRate(value)}</div>
        <div className="text-xs text-zinc-500">zum Schnitt: {differenceLabel(value, avg)}</div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="vergleich" className="space-y-4">
      <TabsList>
        <TabsTrigger value="vergleich">Direktvergleich</TabsTrigger>
        <TabsTrigger value="ranking">Rangliste</TabsTrigger>
      </TabsList>

      <TabsContent value="vergleich" className="space-y-4">
        <section className="rounded-lg border bg-white p-4">
          <form className="grid gap-3 lg:grid-cols-[1fr_260px_auto]" onSubmit={submitSearch}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" aria-hidden="true" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Gemeinde für Vergleich suchen"
                className="pl-9"
              />
            </div>
            <Select
              value={bundesland}
              onValueChange={(value) => {
                setBundesland(value)
                setSubmittedQuery(query.trim())
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
          </form>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-lg border bg-white">
            <div className="border-b px-4 py-3">
              <p className="font-medium">Suchergebnisse</p>
              <p className="text-sm text-zinc-500">Bis zu 5 Kommunen für den Vergleich auswählen.</p>
            </div>
            <div className="divide-y">
              {searchResults.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="truncate text-sm text-zinc-500">
                      {item.kreis ? `${item.kreis}, ` : ''}
                      {item.bundesland}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={selectedIds.has(item.id) || selected.length >= 5}
                    onClick={() => addMunicipality(item)}
                  >
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Hinzufügen
                  </Button>
                </div>
              ))}
              {isSearchLoading ? (
                <div className="px-4 py-8 text-center text-sm text-zinc-500">Daten werden geladen.</div>
              ) : null}
              {!isSearchLoading && searchResults.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-zinc-500">Keine passenden Kommunen gefunden.</div>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border bg-white">
            <div className="border-b px-4 py-3">
              <p className="font-medium">Ausgewählt</p>
              <p className="text-sm text-zinc-500">{selected.length} von 5 Kommunen</p>
            </div>
            <div className="flex flex-wrap gap-2 p-4">
              {selected.map((item) => (
                <Badge key={item.id} variant="secondary" className="gap-2 px-3 py-2">
                  {item.name}
                  <button type="button" onClick={() => removeMunicipality(item.id)} aria-label={`${item.name} entfernen`}>
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </Badge>
              ))}
              {selected.length === 0 ? (
                <p className="text-sm text-zinc-500">Noch keine Kommune ausgewählt.</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-white">
          <div className="border-b px-4 py-3">
            <p className="font-medium">Vergleichstabelle</p>
            <p className="text-sm text-zinc-500">
              Grün markiert den niedrigsten Wert, rot den höchsten Wert je Steuerart.
            </p>
          </div>
          {selected.length < 2 ? (
            <div className="px-4 py-10 text-center text-sm text-zinc-500">
              Bitte mindestens zwei Kommunen auswählen, um den Vergleich zu starten.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-56">Kommune</TableHead>
                    <TableHead>Grundsteuer A</TableHead>
                    <TableHead>Grundsteuer B</TableHead>
                    <TableHead>B Wohnen</TableHead>
                    <TableHead>B Nichtwohnen</TableHead>
                    <TableHead>Gewerbesteuer</TableHead>
                    <TableHead>Stand & Quelle</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selected.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div>{item.name}</div>
                        <div className="text-xs text-zinc-500">
                          {item.kreis ? `${item.kreis}, ` : ''}
                          {item.bundesland}
                        </div>
                      </TableCell>
                      <TableCell>{renderRateCell(item, 'hebesatz_a')}</TableCell>
                      <TableCell>{renderRateCell(item, 'hebesatz_b')}</TableCell>
                      <TableCell>{renderRateCell(item, 'hebesatz_b_wohnen')}</TableCell>
                      <TableCell>{renderRateCell(item, 'hebesatz_b_nichtwohnen')}</TableCell>
                      <TableCell>{renderRateCell(item, 'hebesatz_gewerbe')}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{formatDate(item.datenstand)}</div>
                          <div className="max-w-56 truncate text-xs text-zinc-500">
                            {item.quellenname || 'Quelle offen'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.quellenstatus === 'bestaetigt' ? 'default' : 'secondary'}>
                          {item.quellenstatus === 'bestaetigt' ? 'bestätigt' : 'offen'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-zinc-50">
                    <TableCell className="font-medium">Durchschnitt</TableCell>
                    {COMPARISON_FIELDS.map((field) => (
                      <TableCell key={field}>{formatRate(average(selected, field))}</TableCell>
                    ))}
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </TabsContent>

      <TabsContent value="ranking" className="space-y-4">
        <section className="rounded-lg border bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[240px_260px_180px_auto]">
            <Select value={rankingField} onValueChange={(value) => setRankingField(value as TaxField)}>
              <SelectTrigger>
                <SelectValue placeholder="Steuerart" />
              </SelectTrigger>
              <SelectContent>
                {TAX_FIELDS.map((field) => (
                  <SelectItem key={field.value} value={field.value}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={rankingState} onValueChange={setRankingState}>
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
            <Select value={rankingSort} onValueChange={(value) => setRankingSort(value as SortDir)}>
              <SelectTrigger>
                <SelectValue placeholder="Sortierung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Niedrig zuerst</SelectItem>
                <SelectItem value="desc">Hoch zuerst</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild variant="outline">
              <a href={exportUrl}>
                <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
                Export
              </a>
            </Button>
          </div>
        </section>

        <section className="rounded-lg border bg-white">
          <div className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Rangliste: {fieldLabel(rankingField)}</p>
              <p className="text-sm text-zinc-500">Top 25 passend zur aktuellen Auswahl.</p>
            </div>
            <Badge variant="secondary" className="w-fit gap-2">
              <ArrowDownUp className="h-3.5 w-3.5" aria-hidden="true" />
              {rankingSort === 'asc' ? 'niedrig zuerst' : 'hoch zuerst'}
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rang</TableHead>
                  <TableHead className="min-w-56">Kommune</TableHead>
                  <TableHead>Bundesland</TableHead>
                  <TableHead>{fieldLabel(rankingField)}</TableHead>
                  <TableHead>Stand & Quelle</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      <div>{item.name}</div>
                      {item.kreis ? <div className="text-xs text-zinc-500">{item.kreis}</div> : null}
                    </TableCell>
                    <TableCell>{item.bundesland}</TableCell>
                    <TableCell>{formatRate(item[rankingField])}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{formatDate(item.datenstand)}</div>
                        <div className="max-w-56 truncate text-xs text-zinc-500">
                          {item.quellenname || 'Quelle offen'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.quellenstatus === 'bestaetigt' ? 'default' : 'secondary'}>
                        {item.quellenstatus === 'bestaetigt' ? 'bestätigt' : 'offen'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {isRankingLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                      Rangliste wird geladen.
                    </TableCell>
                  </TableRow>
                ) : null}
                {!isRankingLoading && rankingItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                      Keine Daten für diese Auswahl verfügbar.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </section>
      </TabsContent>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
    </Tabs>
  )
}
