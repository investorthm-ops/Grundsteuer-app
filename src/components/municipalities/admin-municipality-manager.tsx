'use client'

import { useEffect, useState } from 'react'
import { Pencil, Plus, RefreshCw, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { BUNDESLAENDER, QUELLENSTATUS } from '@/lib/validation/municipality'
import type { Municipality, MunicipalityListResponse } from '@/lib/types/municipality'

type FormState = {
  id?: string
  name: string
  bundesland: string
  kreis: string
  hebesatz_a: string
  hebesatz_b: string
  hebesatz_b_wohnen: string
  hebesatz_b_nichtwohnen: string
  hebesatz_gewerbe: string
  vorjahr_b: string
  datenstand: string
  quellenstatus: 'bestaetigt' | 'offen'
  quellenname: string
  quellen_url: string
}

const emptyForm: FormState = {
  name: '',
  bundesland: 'Nordrhein-Westfalen',
  kreis: '',
  hebesatz_a: '',
  hebesatz_b: '',
  hebesatz_b_wohnen: '',
  hebesatz_b_nichtwohnen: '',
  hebesatz_gewerbe: '',
  vorjahr_b: '',
  datenstand: '',
  quellenstatus: 'offen',
  quellenname: '',
  quellen_url: '',
}

const DISPLAY_REPLACEMENTS: Record<string, string> = {
  Koeln: 'Köln',
  Muenster: 'Münster',
}

function displayText(value: string) {
  return Object.entries(DISPLAY_REPLACEMENTS).reduce(
    (text, [search, replacement]) => text.replaceAll(search, replacement),
    value
  )
}

function toPayload(form: FormState) {
  const optionalNumber = (value: string) => (value.trim() ? Number(value) : null)
  return {
    name: form.name.trim(),
    bundesland: form.bundesland,
    kreis: form.kreis.trim() || null,
    hebesatz_a: optionalNumber(form.hebesatz_a),
    hebesatz_b: Number(form.hebesatz_b),
    hebesatz_b_wohnen: optionalNumber(form.hebesatz_b_wohnen),
    hebesatz_b_nichtwohnen: optionalNumber(form.hebesatz_b_nichtwohnen),
    hebesatz_gewerbe: optionalNumber(form.hebesatz_gewerbe),
    vorjahr_b: optionalNumber(form.vorjahr_b),
    datenstand: form.datenstand || null,
    quellenstatus: form.quellenstatus,
    quellenname: form.quellenname.trim() || null,
    quellen_url: form.quellen_url.trim() || null,
  }
}

function fromMunicipality(item: Municipality): FormState {
  return {
    id: item.id,
    name: item.name,
    bundesland: item.bundesland,
    kreis: item.kreis ?? '',
    hebesatz_a: item.hebesatz_a?.toString() ?? '',
    hebesatz_b: item.hebesatz_b.toString(),
    hebesatz_b_wohnen: item.hebesatz_b_wohnen?.toString() ?? '',
    hebesatz_b_nichtwohnen: item.hebesatz_b_nichtwohnen?.toString() ?? '',
    hebesatz_gewerbe: item.hebesatz_gewerbe?.toString() ?? '',
    vorjahr_b: item.vorjahr_b?.toString() ?? '',
    datenstand: item.datenstand ?? '',
    quellenstatus: item.quellenstatus,
    quellenname: item.quellenname ?? '',
    quellen_url: item.quellen_url ?? '',
  }
}

export function AdminMunicipalityManager() {
  const [items, setItems] = useState<Municipality[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadItems() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/municipalities?page=1&pageSize=100')
      if (!response.ok) throw new Error('Daten konnten nicht geladen werden.')
      const payload = (await response.json()) as MunicipalityListResponse
      setItems(payload.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch(
        form.id ? `/api/municipalities/${form.id}` : '/api/municipalities',
        {
          method: form.id ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toPayload(form)),
        }
      )
      if (!response.ok) throw new Error('Speichern fehlgeschlagen.')
      setMessage(form.id ? 'Datensatz aktualisiert.' : 'Datensatz angelegt.')
      setForm(emptyForm)
      await loadItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler.')
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteItem(id: string) {
    setError(null)
    setMessage(null)
    const response = await fetch(`/api/municipalities/${id}`, { method: 'DELETE' })
    if (!response.ok) {
      setError('Löschen fehlgeschlagen.')
      return
    }
    setMessage('Datensatz gelöscht.')
    if (form.id === id) setForm(emptyForm)
    await loadItems()
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              {form.id ? 'Datensatz bearbeiten' : 'Datensatz anlegen'}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">Pflichtfelder: Gemeinde, Bundesland, Grundsteuer B.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setForm(emptyForm)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Neu
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Gemeinde</Label>
            <Input id="name" value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Bundesland</Label>
            <Select value={form.bundesland} onValueChange={(value) => updateField('bundesland', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUNDESLAENDER.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="kreis">Kreis</Label>
            <Input id="kreis" value={form.kreis} onChange={(event) => updateField('kreis', event.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hebesatz_a">Grundsteuer A</Label>
              <Input id="hebesatz_a" type="number" min="0" max="2000" value={form.hebesatz_a} onChange={(event) => updateField('hebesatz_a', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hebesatz_b">Grundsteuer B</Label>
              <Input id="hebesatz_b" type="number" min="0" max="2000" value={form.hebesatz_b} onChange={(event) => updateField('hebesatz_b', event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hebesatz_b_wohnen">B Wohnen</Label>
              <Input id="hebesatz_b_wohnen" type="number" min="0" max="3000" value={form.hebesatz_b_wohnen} onChange={(event) => updateField('hebesatz_b_wohnen', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hebesatz_b_nichtwohnen">B Nichtwohnen</Label>
              <Input id="hebesatz_b_nichtwohnen" type="number" min="0" max="3000" value={form.hebesatz_b_nichtwohnen} onChange={(event) => updateField('hebesatz_b_nichtwohnen', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vorjahr_b">Vorjahr B</Label>
              <Input id="vorjahr_b" type="number" min="0" max="2000" value={form.vorjahr_b} onChange={(event) => updateField('vorjahr_b', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hebesatz_gewerbe">Gewerbesteuer</Label>
              <Input id="hebesatz_gewerbe" type="number" min="0" max="2000" value={form.hebesatz_gewerbe} onChange={(event) => updateField('hebesatz_gewerbe', event.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="datenstand">Datenstand</Label>
              <Input id="datenstand" type="date" value={form.datenstand} onChange={(event) => updateField('datenstand', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Quellenstatus</Label>
              <Select value={form.quellenstatus} onValueChange={(value) => updateField('quellenstatus', value as FormState['quellenstatus'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUELLENSTATUS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quellenname">Quellenname</Label>
            <Input
              id="quellenname"
              value={form.quellenname}
              onChange={(event) => updateField('quellenname', event.target.value)}
              placeholder="z. B. Statistische Ämter des Bundes und der Länder"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quellen_url">Quellen-URL</Label>
            <Input
              id="quellen_url"
              type="url"
              value={form.quellen_url}
              onChange={(event) => updateField('quellen_url', event.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        <Button type="submit" className="mt-5 w-full" disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" aria-hidden="true" />
          {isSaving ? 'Speichern läuft' : 'Speichern'}
        </Button>
      </form>

      <section className="rounded-lg border bg-white">
        <div className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-600">{isLoading ? 'Daten werden geladen' : `${items.length} Einträge geladen`}</p>
          <Button variant="ghost" size="sm" onClick={loadItems}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Aktualisieren
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gemeinde</TableHead>
                <TableHead>Bundesland</TableHead>
                <TableHead>GrSt B</TableHead>
                <TableHead>B Wohnen</TableHead>
                <TableHead>B Nichtwohnen</TableHead>
                <TableHead>Stand</TableHead>
                <TableHead>Quelle</TableHead>
                <TableHead className="text-right">Aktion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{displayText(item.name)}</TableCell>
                  <TableCell>{item.bundesland}</TableCell>
                  <TableCell>{item.hebesatz_b} %</TableCell>
                  <TableCell>{item.hebesatz_b_wohnen ? `${item.hebesatz_b_wohnen} %` : '-'}</TableCell>
                  <TableCell>{item.hebesatz_b_nichtwohnen ? `${item.hebesatz_b_nichtwohnen} %` : '-'}</TableCell>
                  <TableCell>{item.datenstand || '-'}</TableCell>
                  <TableCell className="max-w-64 truncate">{item.quellenname || '-'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setForm(fromMunicipality(item))}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteItem(item.id)}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-28 text-center text-zinc-500">
                    Noch keine Daten vorhanden. Lege links den ersten Datensatz an.
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
