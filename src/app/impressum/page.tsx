import { AppShell } from '@/components/app-shell'

export default function ImpressumPage() {
  return (
    <AppShell
      eyebrow="Rechtliches"
      title="Impressum"
      description="Die Pflichtangaben werden derzeit ausgearbeitet."
    >
      <div className="max-w-2xl space-y-4 rounded-lg border bg-white p-5">
        <p className="text-sm leading-7 text-zinc-600">
          Diese Seite enthaelt in Kuerze die nach § 5 TMG erforderlichen Angaben:
          Name und Anschrift des Betreibers, Kontakt, Vertretungsberechtigte,
          Umsatzsteuer-Identifikationsnummer und Verantwortlich i.S.d. Presserechts.
        </p>
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          Platzhalter. Diese Pflichtangaben werden vor dem ersten zahlenden
          Pilotkunden ergaenzt.
        </p>
      </div>
    </AppShell>
  )
}
