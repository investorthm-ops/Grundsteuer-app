import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <AppShell
      eyebrow="404"
      title="Seite nicht gefunden"
      description="Die aufgerufene Adresse existiert nicht. Vielleicht hat sich ein Tippfehler eingeschlichen, oder die Gemeinde ist noch nicht in unserer Datenbank gepflegt."
    >
      <section className="rounded-lg border bg-white p-6 sm:p-8">
        <div className="mx-auto max-w-2xl space-y-5">
          <p className="text-base leading-7 text-zinc-700">
            Was du jetzt tun kannst:
          </p>
          <ul className="space-y-3 text-sm leading-6 text-zinc-600">
            <li>
              <strong className="font-semibold text-zinc-950">Gemeinde suchen.</strong>{' '}
              Auf der Startseite ist eine zentrale Such-Box — tippe den Namen einer
              Gemeinde, du landest direkt auf der Stadtseite.
            </li>
            <li>
              <strong className="font-semibold text-zinc-950">Datenbank durchsuchen.</strong>{' '}
              In der vollstaendigen Datenbank kannst du nach Bundesland und Kreis
              filtern (Login erforderlich).
            </li>
            <li>
              <strong className="font-semibold text-zinc-950">Gemeinde fehlt?</strong>{' '}
              Die Datenpflege laeuft schrittweise. Derzeit sind 818 Kommunen aus
              Nordrhein-Westfalen und Hessen erfasst, weitere Bundeslaender folgen.
            </li>
          </ul>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button asChild>
              <Link href="/">
                <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                Zur Suche
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/datenbank">
                Datenbank oeffnen
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </AppShell>
  )
}
