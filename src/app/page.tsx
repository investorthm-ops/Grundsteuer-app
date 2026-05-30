import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  Database,
  FileDown,
  LineChart,
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const benefitItems = [
  {
    icon: Search,
    title: 'Suchen',
    text: 'Gemeinde eingeben und Hebesätze mit Datenstand und Quelle prüfen.',
  },
  {
    icon: LineChart,
    title: 'Vergleichen',
    text: 'Standorte, Vorjahreswerte und auffällige Veränderungen nebeneinander sehen.',
  },
  {
    icon: Star,
    title: 'Merken',
    text: 'Relevante Gemeinden auf die Watchlist setzen und später schneller wiederfinden.',
  },
  {
    icon: FileDown,
    title: 'Exportieren',
    text: 'Gefilterte Daten als CSV für Beratung, Analyse oder Portfolio-Checks nutzen.',
  },
]

const previewRows = [
  { city: 'Lüdenscheid', state: 'Nordrhein-Westfalen', value: '766 %', status: 'bestätigt' },
  { city: 'Dortmund', state: 'Nordrhein-Westfalen', value: '610 %', status: 'bestätigt' },
  { city: 'Altena', state: 'Nordrhein-Westfalen', value: 'differenziert', status: 'PROJ-10' },
]

export default function Home() {
  return (
    <AppShell
      eyebrow="MVP live"
      title="Grundsteuer-Hebesätze zentral prüfen"
      description="Der GrundsteuerMonitor bündelt kommunale Hebesätze, Datenstände und Quellen an einem Ort. So werden Suche, Vergleich, Watchlist und Export für Investoren, Steuerberater und Kommunen einfacher."
      actions={
        <>
          <Button asChild>
            <Link href="/datenbank">
              Datenbank öffnen
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/grundsteuer-hebesatz/dortmund">Beispiel Dortmund ansehen</Link>
          </Button>
        </>
      }
    >
      <section className="overflow-hidden rounded-lg border bg-zinc-950 text-white">
        <div className="grid gap-8 lg:grid-cols-[1fr_460px] lg:items-stretch">
          <div className="p-6 sm:p-8 lg:p-10">
            <Badge className="bg-white text-zinc-950 hover:bg-white">Willkommen</Badge>
            <h2 className="mt-6 max-w-3xl text-4xl font-semibold tracking-normal sm:text-5xl">
              Hebesätze finden, Quellen prüfen, Standorte besser einschätzen.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
              Starte über die Suche oben rechts oder öffne direkt die Datenbank. Die Anwendung
              zeigt Werte, Datenstand und Quellenstatus transparent an.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-zinc-950 hover:bg-zinc-100">
                <Link href="/datenbank">
                  Jetzt suchen
                  <Search className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link href="/preise">Preise ansehen</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link href="/login">Zum Nutzerkonto</Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[360px] border-t border-white/10 bg-zinc-900 p-6 lg:border-l lg:border-t-0">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:42px_42px]" />
            <div className="relative rounded-lg border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <p className="text-sm text-zinc-300">Live-Vorschau</p>
                  <p className="text-lg font-semibold">Hebesatz-Datenbank</p>
                </div>
                <ShieldCheck className="h-5 w-5 text-emerald-300" aria-hidden="true" />
              </div>
              <div className="mt-4 space-y-3">
                {previewRows.map((row) => (
                  <div key={row.city} className="rounded-md border border-white/10 bg-zinc-950/50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{row.city}</p>
                        <p className="text-xs text-zinc-400">{row.state}</p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-zinc-950">
                        {row.value}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-zinc-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                      {row.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {benefitItems.map((item) => (
          <article key={item.title} className="rounded-lg border bg-white p-5">
            <item.icon className="h-5 w-5 text-zinc-700" aria-hidden="true" />
            <h2 className="mt-4 text-base font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_360px]">
        <article className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-zinc-700" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Für den MVP bewusst transparent</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Jede Gemeinde zeigt Datenstand, Quellenstatus und Quelle, sofern vorhanden. Werte
            dienen der Recherche und müssen bei verbindlichen Entscheidungen mit den amtlichen
            Veröffentlichungen abgeglichen werden.
          </p>
        </article>

        <article className="rounded-lg border bg-white p-5">
          <Bell className="h-5 w-5 text-zinc-700" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold">Nächster Nutzen</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Watchlist und Vergleich machen relevante Kommunen schneller sichtbar, besonders für
            wiederkehrende Portfolio- und Mandantenprüfungen.
          </p>
        </article>
      </section>
    </AppShell>
  )
}
