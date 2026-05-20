import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Database, ExternalLink, LineChart, ShieldCheck } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Municipality } from '@/lib/types/municipality'
import { findMunicipalityBySlug, municipalitySlug } from '@/lib/seo/municipality-slug'

type PageProps = {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

function formatRate(value: number | null) {
  return typeof value === 'number' ? `${value} %` : '-'
}

function formatDate(value: string | null) {
  if (!value) return 'noch offen'
  return new Intl.DateTimeFormat('de-DE').format(new Date(value))
}

function delta(current: number, previous: number | null) {
  if (typeof previous !== 'number') return null
  return current - previous
}

function locationText(municipality: Municipality) {
  if (!municipality.kreis) return municipality.name
  return `${municipality.name}, ${municipality.kreis}`
}

async function getMunicipalities() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('municipalities')
    .select('*')
    .order('name', { ascending: true })
    .limit(12000)

  if (error) return []
  return (data ?? []) as Municipality[]
}

async function getMunicipality(slug: string) {
  const items = await getMunicipalities()
  return findMunicipalityBySlug(items, slug)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const municipality = await getMunicipality(slug)
  if (!municipality) {
    return {
      title: 'Grundsteuer Hebesatz suchen | GrundsteuerMonitor',
    }
  }

  return {
    title: `Grundsteuer Hebesatz ${municipality.name} | GrundsteuerMonitor`,
    description: `Aktueller Grundsteuer-B-Hebesatz, Vorjahresvergleich und Datenstand fuer ${municipality.name}.`,
  }
}

export default async function MunicipalitySeoPage({ params }: PageProps) {
  const { slug } = await params
  const municipality = await getMunicipality(slug)
  if (!municipality) notFound()

  const change = delta(municipality.hebesatz_b, municipality.vorjahr_b)
  const changeLabel = change === null ? 'kein Vorjahr' : change > 0 ? `+${change}` : String(change)
  const isNotable = typeof change === 'number' && change >= 100
  const canonicalSlug = municipalitySlug(municipality.name)

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <section className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              GrundsteuerMonitor
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link href={`/datenbank?q=${encodeURIComponent(municipality.name)}`}>
                In Datenbank oeffnen
              </Link>
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-normal text-zinc-500">
                Grundsteuer Hebesatz
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-normal text-zinc-950">
                Grundsteuer Hebesatz {municipality.name}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
                Aktuelle Hebesaetze, Vorjahresvergleich und Datenstand fuer {locationText(municipality)}.
                Die Werte dienen als Arbeitsgrundlage fuer Standortvergleich, Watchlist und Renditepruefung.
              </p>
            </div>
            <div className="rounded-lg border bg-zinc-950 p-5 text-white">
              <p className="text-sm text-zinc-300">Grundsteuer B</p>
              <p className="mt-2 text-5xl font-semibold">{formatRate(municipality.hebesatz_b)}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-zinc-300">
                <span>Veraenderung</span>
                <span className={isNotable ? 'font-semibold text-red-300' : 'font-semibold text-white'}>
                  {changeLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="rounded-lg border bg-white p-5">
          <Database className="h-5 w-5 text-zinc-700" aria-hidden="true" />
          <p className="mt-4 text-sm text-zinc-500">Grundsteuer A</p>
          <p className="mt-1 text-2xl font-semibold">{formatRate(municipality.hebesatz_a)}</p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <LineChart className="h-5 w-5 text-zinc-700" aria-hidden="true" />
          <p className="mt-4 text-sm text-zinc-500">Gewerbesteuer</p>
          <p className="mt-1 text-2xl font-semibold">{formatRate(municipality.hebesatz_gewerbe)}</p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <ShieldCheck className="h-5 w-5 text-zinc-700" aria-hidden="true" />
          <p className="mt-4 text-sm text-zinc-500">Quellenstatus</p>
          <div className="mt-2">
            <Badge variant={municipality.quellenstatus === 'bestaetigt' ? 'default' : 'secondary'}>
              {municipality.quellenstatus === 'bestaetigt' ? 'bestaetigt' : 'offen'}
            </Badge>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="rounded-lg border bg-white">
          <div className="border-b px-5 py-4">
            <h2 className="text-lg font-semibold">Hebesatz-Uebersicht</h2>
          </div>
          <dl className="divide-y">
            {[
              ['Gemeinde', municipality.name],
              ['Bundesland', municipality.bundesland],
              ['Kreis', municipality.kreis ?? '-'],
              ['Grundsteuer B Vorjahr', formatRate(municipality.vorjahr_b)],
              ['Delta zum Vorjahr', changeLabel],
              ['Datenstand', formatDate(municipality.datenstand)],
            ].map(([label, value]) => (
              <div key={label} className="grid gap-1 px-5 py-3 sm:grid-cols-2">
                <dt className="text-sm text-zinc-500">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Monitoring starten</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Merke {municipality.name} in der Datenbank, um die Gemeinde auf deine Watchlist zu setzen
            und Veraenderungen direkt im Dashboard zu sehen.
          </p>
          <Button asChild className="mt-5 w-full">
            <Link href={`/datenbank?q=${encodeURIComponent(municipality.name)}`}>
              Gemeinde merken
            </Link>
          </Button>
          {municipality.quellen_url ? (
            <Button asChild variant="ghost" className="mt-2 w-full">
              <a href={municipality.quellen_url} target="_blank" rel="noreferrer">
                Quelle oeffnen
                <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          ) : null}
          <p className="mt-4 text-xs text-zinc-500">SEO-Link: /grundsteuer-hebesatz/{canonicalSlug}</p>
        </aside>
      </section>
    </main>
  )
}
