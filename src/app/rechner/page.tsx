import { AppShell } from '@/components/app-shell'
import { TaxImpactCalculator } from '@/components/calculator/tax-impact-calculator'

export default function RechnerPage() {
  return (
    <AppShell
      eyebrow="PROJ-6"
      title="Renditeauswirkungs-Rechner"
      description="Berechne, wie sich ein geänderter Grundsteuer-B-Hebesatz auf Jahreskosten, Monatskosten und Cashflow auswirkt."
    >
      <TaxImpactCalculator />
    </AppShell>
  )
}
