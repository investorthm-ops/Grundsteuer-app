import { AppShell } from '@/components/app-shell'

export default function DatenschutzPage() {
  return (
    <AppShell
      eyebrow="Rechtliches"
      title="Datenschutzerklaerung"
      description="Die Datenschutzerklaerung wird derzeit ausgearbeitet."
    >
      <div className="max-w-2xl space-y-4 rounded-lg border bg-white p-5">
        <p className="text-sm leading-7 text-zinc-600">
          An dieser Stelle erscheint in Kuerze die vollstaendige Datenschutzerklaerung
          gemaess DSGVO und BDSG: Verantwortlicher, Art der verarbeiteten Daten,
          Zwecke der Verarbeitung, Rechtsgrundlagen, Empfaenger, Speicherdauer,
          Betroffenenrechte sowie Hinweise zu Cookies und eingesetzten Dienstleistern
          (Supabase, Vercel).
        </p>
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          Platzhalter. Die Datenschutzerklaerung wird vor dem ersten zahlenden
          Pilotkunden veroeffentlicht.
        </p>
      </div>
    </AppShell>
  )
}
