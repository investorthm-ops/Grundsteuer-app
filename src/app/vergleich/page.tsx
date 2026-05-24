import { AppShell } from '@/components/app-shell'
import { MunicipalityCompare } from '@/components/compare/municipality-compare'

export default function VergleichPage() {
  return (
    <AppShell
      eyebrow="PROJ-7"
      title="Vergleich und Benchmarking"
      description="Vergleiche mehrere Kommunen nebeneinander und finde auffällige Hebesätze in einfachen Ranglisten."
    >
      <MunicipalityCompare />
    </AppShell>
  )
}
