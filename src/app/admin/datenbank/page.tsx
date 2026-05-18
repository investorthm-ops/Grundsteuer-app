import { AppShell } from '@/components/app-shell'
import { AdminMunicipalityManager } from '@/components/municipalities/admin-municipality-manager'

export default function AdminDatenbankPage() {
  return (
    <AppShell
      eyebrow="Admin"
      title="Datenpflege"
      description="Lege Hebesatz-Datensätze an, bearbeite bestehende Gemeinden und pflege Datenstand sowie Quellenstatus."
    >
      <AdminMunicipalityManager />
    </AppShell>
  )
}
