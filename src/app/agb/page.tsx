import { AppShell } from '@/components/app-shell'

export default function AgbPage() {
  return (
    <AppShell
      eyebrow="Rechtliches"
      title="Allgemeine Geschaeftsbedingungen"
      description="Die AGB werden derzeit ausgearbeitet."
    >
      <div className="max-w-2xl space-y-4 rounded-lg border bg-white p-5">
        <p className="text-sm leading-7 text-zinc-600">
          An dieser Stelle erscheinen in Kuerze die Allgemeinen Geschaeftsbedingungen
          des GrundsteuerMonitor: Leistungsumfang, Nutzungsrechte, Datenstand und
          Haftung, Verfuegbarkeit, Vertragslaufzeit, Kuendigung und Datenschutz-
          Verweise.
        </p>
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          Platzhalter. Die AGB werden vor dem ersten zahlenden Pilotkunden
          finalisiert.
        </p>
      </div>
    </AppShell>
  )
}
