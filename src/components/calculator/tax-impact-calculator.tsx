'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calculator, Euro, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import type { Municipality, MunicipalityListResponse } from '@/lib/types/municipality'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatRate(value: number | null) {
  return typeof value === 'number' ? `${value} %` : '-'
}

function parseNumber(value: string) {
  const normalized = value.replace(/\./g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function taxFromMessbetrag(messbetrag: number, hebesatz: number) {
  return messbetrag * (hebesatz / 100)
}

export function TaxImpactCalculator() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [messbetrag, setMessbetrag] = useState('100')
  const [annualRent, setAnnualRent] = useState('20000')
  const [manualPreviousTax, setManualPreviousTax] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true
    setIsLoading(true)
    setError(null)

    fetch('/api/municipalities?page=1&pageSize=100')
      .then(async (response) => {
        if (!response.ok) throw new Error('Gemeindedaten konnten nicht geladen werden.')
        return (await response.json()) as MunicipalityListResponse
      })
      .then((payload) => {
        if (!isCurrent) return
        setMunicipalities(payload.data)
        setSelectedId(payload.data[0]?.id ?? '')
      })
      .catch((err) => {
        if (!isCurrent) return
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler.')
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const selected = useMemo(
    () => municipalities.find((municipality) => municipality.id === selectedId) ?? null,
    [municipalities, selectedId]
  )

  const calculation = useMemo(() => {
    if (!selected) return null

    const messbetragValue = Math.max(0, parseNumber(messbetrag))
    const rentValue = Math.max(0, parseNumber(annualRent))
    const manualPreviousTaxValue = Math.max(0, parseNumber(manualPreviousTax))
    const currentTax = taxFromMessbetrag(messbetragValue, selected.hebesatz_b)
    const previousTax =
      typeof selected.vorjahr_b === 'number'
        ? taxFromMessbetrag(messbetragValue, selected.vorjahr_b)
        : manualPreviousTaxValue
    const yearlyDelta = currentTax - previousTax

    return {
      currentTax,
      previousTax,
      yearlyDelta,
      monthlyDelta: yearlyDelta / 12,
      rentShare: rentValue > 0 ? (currentTax / rentValue) * 100 : 0,
    }
  }, [annualRent, manualPreviousTax, messbetrag, selected])

  return (
    <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
      <section className="rounded-lg border bg-white p-5">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-zinc-700" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Eingaben</h2>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label>Gemeinde</Label>
            <Select value={selectedId} onValueChange={setSelectedId} disabled={isLoading || municipalities.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? 'Daten werden geladen' : 'Gemeinde auswaehlen'} />
              </SelectTrigger>
              <SelectContent>
                {municipalities.map((municipality) => (
                  <SelectItem key={municipality.id} value={municipality.id}>
                    {municipality.name} - {municipality.bundesland}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="messbetrag">Messbetrag in Euro</Label>
              <Input id="messbetrag" inputMode="decimal" value={messbetrag} onChange={(event) => setMessbetrag(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualRent">Jahresnettomiete</Label>
              <Input id="annualRent" inputMode="decimal" value={annualRent} onChange={(event) => setAnnualRent(event.target.value)} />
            </div>
          </div>

          {selected && typeof selected.vorjahr_b !== 'number' ? (
            <div className="space-y-2">
              <Label htmlFor="manualPreviousTax">Bisherige Jahresgrundsteuer</Label>
              <Input
                id="manualPreviousTax"
                inputMode="decimal"
                value={manualPreviousTax}
                onChange={(event) => setManualPreviousTax(event.target.value)}
                placeholder="Optional, wenn kein Vorjahreshebesatz vorliegt"
              />
            </div>
          ) : null}

          {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setMessbetrag('100')
              setAnnualRent('20000')
              setManualPreviousTax('')
            }}
          >
            Beispielwerte einsetzen
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-lg border bg-zinc-950 p-5 text-white">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-zinc-300">Auswirkung pro Jahr</p>
              <p className="mt-2 text-4xl font-semibold">{calculation ? formatCurrency(calculation.yearlyDelta) : '-'}</p>
            </div>
            {calculation ? (
              <Badge variant={calculation.yearlyDelta > 0 ? 'destructive' : 'secondary'}>
                {calculation.yearlyDelta > 0 ? 'Mehrbelastung' : calculation.yearlyDelta < 0 ? 'Entlastung' : 'neutral'}
              </Badge>
            ) : null}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ResultTile label="Aktuelle Grundsteuer" value={calculation ? formatCurrency(calculation.currentTax) : '-'} />
            <ResultTile label="Bisherige Grundsteuer" value={calculation ? formatCurrency(calculation.previousTax) : '-'} />
            <ResultTile label="Auswirkung pro Monat" value={calculation ? formatCurrency(calculation.monthlyDelta) : '-'} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-5">
            <Euro className="h-5 w-5 text-zinc-700" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">Cashflow-Effekt</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {calculation
                ? `Die aktuelle Grundsteuer entspricht etwa ${calculation.rentShare.toFixed(2).replace('.', ',')} % der angegebenen Jahresnettomiete.`
                : 'Waehle eine Gemeinde, um den Anteil an der Jahresnettomiete zu sehen.'}
            </p>
          </div>

          <div className="rounded-lg border bg-white p-5">
            {calculation && calculation.yearlyDelta > 0 ? (
              <TrendingDown className="h-5 w-5 text-red-700" aria-hidden="true" />
            ) : (
              <TrendingUp className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            )}
            <h2 className="mt-4 text-lg font-semibold">Hebesatz-Vergleich</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {selected
                ? `Aktuell ${formatRate(selected.hebesatz_b)}, Vorjahr ${formatRate(selected.vorjahr_b)}.`
                : 'Noch keine Gemeinde geladen.'}
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Hinweis</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Der Rechner ist eine einfache Arbeitsrechnung fuer den MVP. Er ersetzt keine Steuerberatung und nutzt nur den Grundsteuer-B-Hebesatz sowie den angegebenen Messbetrag.
          </p>
        </div>
      </section>
    </div>
  )
}

function ResultTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

