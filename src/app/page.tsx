import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  Database,
  FileDown,
  Globe2,
  LineChart,
  Search,
  Star,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const featureCards = [
  {
    icon: Search,
    title: 'Gemeinden suchen',
    text: 'Hebesaetze nach Gemeinde und Bundesland finden, inklusive Grundsteuer A, Grundsteuer B und Gewerbesteuer.',
  },
  {
    icon: Star,
    title: 'Watchlist pflegen',
    text: 'Relevante Gemeinden per Stern merken und auf einer eigenen Watchlist gesammelt pruefen.',
  },
  {
    icon: Bell,
    title: 'Aenderungen sehen',
    text: 'Datenstand und Vorjahreswerte nebeneinander sehen und auffaellige Veraenderungen schneller erkennen.',
  },
  {
    icon: FileDown,
    title: 'CSV exportieren',
    text: 'Gefilterte Daten herunterladen und fuer Analysen, Beratung oder Portfolio-Checks weiterverwenden.',
  },
]

const valueProps = [
  {
    icon: Globe2,
    title: 'Alles an einem Ort',
    text: 'Statt verstreuter Amtsblaetter und Kommunal-Webseiten: Grundsteuer A, Grundsteuer B und Gewerbesteuer bundesweit zentral und gepflegt.',
  },
  {
    icon: Bell,
    title: 'Aenderungen kommen zu Ihnen',
    text: 'Die Watchlist buendelt relevante Standort-Kommunen, damit Aenderungen nach Datenupdates schneller auffallen.',
  },
  {
    icon: LineChart,
    title: 'Vergleichen mit Historie',
    text: 'Werte ueber Jahre und Kommunen hinweg benchmarken - historisierte Daten, die Sie anderswo nicht zusammen finden.',
  },
]

const cityLinks = [
  { name: 'Dortmund', href: '/grundsteuer-hebesatz/dortmund', value: '610 %' },
  { name: 'Koeln', href: '/grundsteuer-hebesatz/koeln', value: '895 %' },
  { name: 'Duesseldorf', href: '/grundsteuer-hebesatz/duesseldorf', value: '440 %' },
]

const statusItems = [
  'Hebesatz-Datenbank live',
  'Watchlist live getestet',
  'SEO-Stadtseiten erreichbar',
  'Quellen und Datenstand sichtbar',
  'Sitemap und robots.txt aktiv',
  'Renditerechner live',
]

export default function Home() {
  return (
    <AppShell
      eyebrow="MVP live"
      title="Keine Hebesatz-Aenderung mehr verpassen"
      description="Der GrundsteuerMonitor buendelt kommunale Hebesaetze an einem Ort, meldet jede Aenderung und macht Standorte vergleichbar - fuer Investoren, Steuerberater, Kommunen und Gewerbe."
      actions={
        <>
          <Button asChild>
            <Link href="/datenbank">
              Datenbank oeffnen
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/grundsteuer-hebesatz/dortmund">Dortmund ansehen</Link>
          </Button>
        </>
      }
    >
      <section className="rounded-lg border bg-white p-5">
        <Badge variant="secondary">Warum GrundsteuerMonitor</Badge>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {valueProps.map((item) => (
            <div key={item.title} className="rounded-lg border border-zinc-200 p-4">
              <item.icon className="h-5 w-5 text-zinc-700" aria-hidden="true" />
              <h2 className="mt-4 text-base font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Produktstand</Badge>
            <span className="text-sm text-zinc-500">Daten, Watchlist, Export und SEO sind testbar.</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {featureCards.map((item) => (
              <div key={item.title} className="rounded-lg border border-zinc-200 p-4">
                <item.icon className="h-5 w-5 text-zinc-700" aria-hidden="true" />
                <h2 className="mt-4 text-base font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border bg-zinc-950 p-5 text-white">
          <Globe2 className="h-5 w-5 text-zinc-300" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold">Oeffentliche Stadtseiten</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Erste SEO-Seiten sind erreichbar und in der Sitemap gelistet.
          </p>
          <div className="mt-5 divide-y divide-zinc-800 rounded-md border border-zinc-800">
            {cityLinks.map((city) => (
              <Link
                key={city.href}
                href={city.href}
                className="flex items-center justify-between px-3 py-3 text-sm hover:bg-zinc-900"
              >
                <span>{city.name}</span>
                <span className="font-semibold">{city.value}</span>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="rounded-lg border bg-white p-5">
          <LineChart className="h-5 w-5 text-zinc-700" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold">Naechster Produktwert</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Der naechste grosse Nutzen fuer Investoren ist ein einfacher Rechner, der zeigt,
            wie sich Hebesatz-Aenderungen auf Cashflow und Standortbewertung auswirken.
          </p>
          <Button asChild variant="outline" className="mt-5 w-full">
            <Link href="/rechner">Rechner oeffnen</Link>
          </Button>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-zinc-700" aria-hidden="true" />
            <h2 className="text-lg font-semibold">MVP-Checkliste</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {statusItems.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border bg-zinc-50 px-3 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                <span className="text-sm font-medium text-zinc-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  )
}
