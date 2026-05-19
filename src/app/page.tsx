import Link from 'next/link'
import { ArrowRight, Bell, FileDown, Search } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <AppShell
      eyebrow="MVP"
      title="Frühwarnsystem für kommunale Steuererhöhungen"
      description="Der GrundsteuerMonitor macht Hebesatz-Änderungen sichtbar, damit Investoren, Berater und Bestandshalter früher reagieren können."
      actions={
        <Button asChild>
          <Link href="/datenbank">
            Datenbank öffnen
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      }
    >
      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Search,
            title: 'Suchen',
            text: 'Gemeinden nach Bundesland und Name finden.',
          },
          {
            icon: Bell,
            title: 'Änderungen erkennen',
            text: 'Aktuelle Werte mit dem Vorjahr vergleichen.',
          },
          {
            icon: FileDown,
            title: 'Weiterverarbeiten',
            text: 'Export und Watchlist folgen als nächste MVP-Schritte.',
          },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border bg-white p-5">
            <item.icon className="h-5 w-5 text-zinc-700" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{item.text}</p>
          </div>
        ))}
      </section>
    </AppShell>
  )
}
