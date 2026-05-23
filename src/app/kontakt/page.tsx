import { AppShell } from '@/components/app-shell'

export default function KontaktPage() {
  return (
    <AppShell
      eyebrow="Kontakt"
      title="So erreichst du uns"
      description="Kontaktdaten werden derzeit ausgearbeitet."
    >
      <div className="max-w-2xl space-y-4 rounded-lg border bg-white p-5">
        <p className="text-sm leading-7 text-zinc-600">
          An dieser Stelle erscheinen in Kuerze die Kontaktmoeglichkeiten zum
          GrundsteuerMonitor: E-Mail-Adresse fuer Anfragen, Antwortzeiten und
          ggf. ein Kontaktformular.
        </p>
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          Platzhalter. Die Kontaktdaten werden vor dem ersten zahlenden
          Pilotkunden veroeffentlicht.
        </p>
      </div>
    </AppShell>
  )
}
