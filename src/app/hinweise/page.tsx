import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Hinweise | GrundsteuerMonitor',
  description: 'Hinweise zu Daten, Quellen und Haftung beim GrundsteuerMonitor.',
}

const sections = [
  {
    title: 'Keine Steuer- oder Rechtsberatung',
    body:
      'Der GrundsteuerMonitor stellt allgemeine Informationen zu kommunalen Hebesätzen bereit. Die Inhalte sind keine Steuerberatung, Rechtsberatung, Anlageberatung oder amtliche Auskunft.',
  },
  {
    title: 'Daten und Quellen',
    body:
      'Hebesatzdaten können aus amtlichen Statistiken, kommunalen Satzungen, Behördenveröffentlichungen und weiteren öffentlichen Quellen stammen. Maßgeblich bleibt immer die jeweilige amtliche Quelle.',
  },
  {
    title: 'Aktualität und Richtigkeit',
    body:
      'Trotz sorgfältiger Pflege können Daten unvollständig, veraltet oder fehlerhaft sein. Nutzer sollten Werte vor Entscheidungen anhand der amtlichen Veröffentlichung prüfen.',
  },
  {
    title: 'Rechner und Auswertungen',
    body:
      'Berechnungen, Vergleiche und Renditeauswirkungen sind vereinfachte Arbeitshilfen. Sie ersetzen keine individuelle Prüfung des Einzelfalls.',
  },
  {
    title: 'Keine Gewähr',
    body:
      'Für Schäden, die aus der Nutzung oder Nichtnutzung der bereitgestellten Informationen entstehen, wird im gesetzlich zulässigen Umfang keine Haftung übernommen.',
  },
]

export default function HinweisePage() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" className="-ml-3 mb-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Zurück
            </Link>
          </Button>
          <p className="text-sm font-medium text-zinc-500">Daten und Haftung</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Hinweise</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600">
            Diese Hinweise erklären, wie die Daten und Auswertungen im GrundsteuerMonitor zu
            verstehen sind.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-lg border bg-white p-5">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

