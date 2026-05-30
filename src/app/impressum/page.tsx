import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Impressum | GrundsteuerMonitor',
  description: 'Anbieterkennzeichnung für den GrundsteuerMonitor.',
}

const providerRows = [
  ['Betreiber', 'Markus Brand'],
  ['Anschrift', 'Mustermannstr. 1, 58511 Lüdenscheid, Deutschland'],
  ['E-Mail', 'investorthm@gmail.com'],
  ['Telefon', '0152 04871153'],
]

const businessRows = [
  ['Rechtsform', 'Einzelunternehmen'],
  ['Steuernummer', 'wird nachgetragen'],
]

export default function ImpressumPage() {
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
          <p className="text-sm font-medium text-zinc-500">Anbieterkennzeichnung</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Impressum</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600">
            Pflichtangaben gemäß § 5 DDG.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
        <InfoCard title="Angaben zum Anbieter" rows={providerRows} />
        <InfoCard title="Geschäftliche Angaben" rows={businessRows} />

        <article className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Verantwortlich für den Inhalt</h2>
          <div className="mt-3 space-y-3 text-sm leading-6 text-zinc-600">
            <p>Verantwortlich gemäß § 18 Abs. 2 MStV:</p>
            <p>Markus Brand, Mustermannstr. 1, 58511 Lüdenscheid</p>
          </div>
        </article>

        <article className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Haftung für Inhalte</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Die Inhalte dieser Website werden mit Sorgfalt erstellt. Für Richtigkeit,
            Vollständigkeit und Aktualität der Inhalte wird jedoch keine Gewähr übernommen.
            Maßgeblich sind die amtlichen Veröffentlichungen der jeweiligen Kommunen und
            Behörden.
          </p>
        </article>

        <article className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Haftung für externe Links</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Diese Website kann Links zu externen Websites enthalten. Auf deren Inhalte hat der
            Betreiber keinen Einfluss. Für fremde Inhalte wird keine Gewähr übernommen.
          </p>
        </article>

        <article className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Urheberrecht</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Die auf dieser Website erstellten Inhalte und Werke unterliegen dem deutschen
            Urheberrecht. Vervielfältigung, Bearbeitung und Verwertung außerhalb der Grenzen
            des Urheberrechts bedürfen der Zustimmung des jeweiligen Rechteinhabers.
          </p>
        </article>
      </section>
    </main>
  )
}

function InfoCard({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <article className="rounded-lg border bg-white p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <dl className="mt-4 divide-y">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 py-3 sm:grid-cols-[220px_1fr]">
            <dt className="text-sm text-zinc-500">{label}</dt>
            <dd className="text-sm font-medium text-zinc-800">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}

