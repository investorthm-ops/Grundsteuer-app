import { AppShell } from '@/components/app-shell'

export default function HaftungsausschlussPage() {
  return (
    <AppShell
      eyebrow="Rechtliches"
      title="Haftungsausschluss"
      description="Der Haftungsausschluss wird derzeit ausgearbeitet."
    >
      <div className="max-w-2xl space-y-4 rounded-lg border bg-white p-5">
        <p className="text-sm leading-7 text-zinc-600">
          An dieser Stelle erscheint in Kuerze der Haftungsausschluss zu Inhalten,
          Datenqualität und externen Links. Die im GrundsteuerMonitor gezeigten
          Hebesätze sind Recherche- und Vergleichsdaten. Maßgeblich sind die
          amtlichen Veröffentlichungen der jeweiligen Kommune oder Behörde.
        </p>
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          Platzhalter. Der vollständige Haftungstext wird vor dem ersten zahlenden
          Pilotkunden ergänzt.
        </p>
      </div>
    </AppShell>
  )
}
