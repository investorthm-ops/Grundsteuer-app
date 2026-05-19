'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Copy, FileUp, History, RefreshCw, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ImportDetailResponse, ImportListResponse, ImportRow, ImportRun } from '@/lib/types/imports'

type ImportDetail = {
  run: ImportRun
  rows: ImportRow[]
}

const statusLabels: Record<string, string> = {
  validated: 'gepr\u00fcft',
  partially_approved: 'teilweise freigegeben',
  approved: 'freigegeben',
  discarded: 'verworfen',
  failed: 'fehlgeschlagen',
  valid: 'g\u00fcltig',
  warning: 'Warnung',
  error: 'Fehler',
  conflict: 'Konflikt',
  skipped: 'ausgelassen',
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function statusVariant(status: string) {
  if (status === 'approved' || status === 'valid') return 'default'
  if (status === 'error' || status === 'failed') return 'destructive'
  return 'secondary'
}

function numberCell(value: number | null) {
  return value === null ? '-' : `${value} %`
}

function existingNumberCell(row: ImportRow, key: 'hebesatz_a' | 'hebesatz_b' | 'hebesatz_gewerbe') {
  const value = row.existing_snapshot?.[key]
  return typeof value === 'number' ? `${value} %` : null
}

function rowHints(row: ImportRow) {
  const hints = [...row.errors, ...row.warnings]
  if (row.action === 'update') {
    hints.unshift('Bestehender Datensatz wird aktualisiert')
  }
  return hints
}

export function ImportManager() {
  const [file, setFile] = useState<File | null>(null)
  const [sourceName, setSourceName] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [dataStand, setDataStand] = useState(todayIso())
  const [history, setHistory] = useState<ImportRun[]>([])
  const [detail, setDetail] = useState<ImportDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const approvableRows = useMemo(
    () => detail?.rows.filter((row) => ['valid', 'warning', 'conflict'].includes(row.status)) ?? [],
    [detail]
  )

  async function loadHistory() {
    const response = await fetch('/api/imports')
    if (!response.ok) return
    const payload = (await response.json()) as ImportListResponse
    setHistory(payload.data)
  }

  async function loadDetail(id: string) {
    setError(null)
    const response = await fetch(`/api/imports/${id}`)
    if (!response.ok) {
      setError('Import konnte nicht geladen werden.')
      return
    }
    const payload = (await response.json()) as ImportDetailResponse
    setDetail(payload.data)
  }

  useEffect(() => {
    loadHistory()
  }, [])

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) {
      setError('Bitte eine CSV-Datei ausw\u00e4hlen.')
      return
    }

    setIsLoading(true)
    setMessage(null)
    setError(null)

    const formData = new FormData()
    formData.set('file', file)
    formData.set('sourceName', sourceName)
    formData.set('sourceUrl', sourceUrl)
    formData.set('dataStand', dataStand)

    try {
      const response = await fetch('/api/imports', {
        method: 'POST',
        body: formData,
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Import fehlgeschlagen.')
      setDetail(payload.data)
      setMessage('Import wurde gepr\u00fcft. Bitte Vorschau kontrollieren.')
      await loadHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler.')
    } finally {
      setIsLoading(false)
    }
  }

  async function approveAll() {
    if (!detail) return
    setIsLoading(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/imports/${detail.run.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIds: approvableRows.map((row) => row.id) }),
      })
      if (!response.ok) throw new Error('Freigabe fehlgeschlagen.')
      await loadDetail(detail.run.id)
      await loadHistory()
      setMessage('G\u00fcltige Importzeilen wurden freigegeben.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler.')
    } finally {
      setIsLoading(false)
    }
  }

  async function discardImport() {
    if (!detail) return
    setIsLoading(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/imports/${detail.run.id}/discard`, { method: 'POST' })
      if (!response.ok) throw new Error('Verwerfen fehlgeschlagen.')
      await loadDetail(detail.run.id)
      await loadHistory()
      setMessage('Import wurde verworfen.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler.')
    } finally {
      setIsLoading(false)
    }
  }

  async function copyErrorRows() {
    const lines =
      detail?.rows
        .filter((row) => row.status === 'error')
        .map((row) => `Zeile ${row.row_number}: ${row.errors.join(', ')}`)
        .join('\n') || ''
    await navigator.clipboard.writeText(lines)
    setMessage('Fehlerliste kopiert.')
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <div className="space-y-5">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">CSV importieren</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="sourceName">Quellenname</Label>
                <Input
                  id="sourceName"
                  value={sourceName}
                  onChange={(event) => setSourceName(event.target.value)}
                  placeholder="z. B. Amtsblatt Koeln"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sourceUrl">Quellen-URL</Label>
                <Input
                  id="sourceUrl"
                  value={sourceUrl}
                  onChange={(event) => setSourceUrl(event.target.value)}
                  placeholder="https://..."
                  type="url"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dataStand">Datenstand</Label>
                <Input
                  id="dataStand"
                  value={dataStand}
                  onChange={(event) => setDataStand(event.target.value)}
                  type="date"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="file">CSV-Datei</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                <FileUp className="mr-2 h-4 w-4" aria-hidden="true" />
                {isLoading ? 'Pr\u00fcfung l\u00e4uft' : 'Import pr\u00fcfen'}
              </Button>
            </form>
            {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
            {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Importhistorie</CardTitle>
            <Button variant="ghost" size="sm" onClick={loadHistory}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.map((run) => (
              <button
                key={run.id}
                type="button"
                onClick={() => loadDetail(run.id)}
                className="w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-zinc-50"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-medium">{run.source_name}</span>
                  <Badge variant={statusVariant(run.status)}>{statusLabels[run.status] ?? run.status}</Badge>
                </span>
                <span className="mt-1 block text-zinc-500">
                  {run.total_rows} Zeilen - {new Date(run.created_at).toLocaleDateString('de-DE')}
                </span>
              </button>
            ))}
            {history.length === 0 ? (
              <p className="text-sm text-zinc-500">{'Noch keine Importl\u00e4ufe vorhanden.'}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-5">
        {detail ? (
          <>
            <Card>
              <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-lg">{detail.run.source_name}</CardTitle>
                  <p className="mt-1 text-sm text-zinc-500">
                    Datenstand {detail.run.data_stand} - {detail.run.total_rows} Zeilen
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={approveAll} disabled={isLoading || approvableRows.length === 0}>
                    <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
                    {'Pr\u00fcfbare Zeilen freigeben'}
                  </Button>
                  <Button variant="outline" onClick={copyErrorRows} disabled={!detail.rows.some((row) => row.status === 'error')}>
                    <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                    Fehler kopieren
                  </Button>
                  <Button variant="outline" onClick={discardImport} disabled={isLoading || detail.run.status === 'discarded'}>
                    <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                    Verwerfen
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <Summary label={'G\u00fcltig'} value={detail.run.valid_rows} />
                  <Summary label="Warnungen" value={detail.run.warning_rows} />
                  <Summary label="Konflikte" value={detail.run.conflict_rows} />
                  <Summary label="Fehler" value={detail.run.error_rows} />
                  <Summary label="Freigegeben" value={detail.run.approved_rows} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Zeile</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Gemeinde</TableHead>
                        <TableHead>Bundesland</TableHead>
                        <TableHead>GrSt B</TableHead>
                        <TableHead>Delta</TableHead>
                        <TableHead>Hinweise</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.rows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.row_number}</TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(row.status)}>
                              {statusLabels[row.status] ?? row.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{row.name ?? '-'}</TableCell>
                          <TableCell>{row.bundesland ?? '-'}</TableCell>
                          <TableCell>
                            <div>{numberCell(row.hebesatz_b)}</div>
                            {existingNumberCell(row, 'hebesatz_b') ? (
                              <div className="text-xs text-zinc-500">
                                Bestand: {existingNumberCell(row, 'hebesatz_b')}
                              </div>
                            ) : null}
                          </TableCell>
                          <TableCell>{row.delta_b ?? '-'}</TableCell>
                          <TableCell className="min-w-[260px] text-sm text-zinc-600">
                            {rowHints(row).join(' - ') || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <History className="mb-3 h-9 w-9 text-zinc-400" aria-hidden="true" />
              <p className="text-base font-medium">{'Noch kein Import ausgew\u00e4hlt'}</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                {'Lade eine CSV hoch oder w\u00e4hle einen bestehenden Importlauf aus der Historie.'}
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-zinc-50 px-3 py-3">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}
