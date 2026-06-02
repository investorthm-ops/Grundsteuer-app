import type { Metadata } from 'next'
import { AppShell } from '@/components/app-shell'
import { PricingPlans } from '@/components/pricing/pricing-plans'

export const metadata: Metadata = {
  title: 'Preise | GrundsteuerMonitor',
  description:
    'Tarife des GrundsteuerMonitor im Überblick: Solo und Kanzlei. Monatlich oder jährlich mit 2 Monaten gratis. Hebesätze suchen, vergleichen, beobachten und exportieren.',
}

export default function PreisePage() {
  return (
    <AppShell
      eyebrow="Tarife"
      title="Preise"
      description="Zwei Tarife für unterschiedliche Bedürfnisse. Solo für Recherche und Vergleich, Kanzlei zusätzlich mit Renditerechner, unbegrenzter Watchlist und PDF-Reports für Mandantengespräche. Jährlich zahlen und zwei Monate sparen."
    >
      <section aria-labelledby="tarife-heading">
        <h2 id="tarife-heading" className="sr-only">
          Tarifübersicht
        </h2>
        <PricingPlans />
      </section>

      <p className="mx-auto mt-8 max-w-4xl text-center text-sm leading-6 text-zinc-500">
        Alle Preise verstehen sich zzgl. gesetzlicher Umsatzsteuer. Der GrundsteuerMonitor ist
        eine Recherche- und Vergleichshilfe und ersetzt keine Steuer- oder Rechtsberatung. Der
        Zugang wird derzeit individuell freigeschaltet – wir melden uns nach Ihrer Kontaktaufnahme.
      </p>
    </AppShell>
  )
}
