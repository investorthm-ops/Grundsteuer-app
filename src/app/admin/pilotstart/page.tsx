import { AppShell } from '@/components/app-shell'
import { AdminTabs } from '@/components/admin/admin-tabs'
import { PilotReadinessDashboard } from '@/components/admin/pilot-readiness-dashboard'

export default function AdminPilotstartPage() {
  return (
    <AppShell
      eyebrow="Admin"
      title="Pilotstart"
      description="Prüfe Kunden-Onboarding, Zugriffslaufzeiten und Datenqualität vor echten Pilotkundentests."
    >
      <AdminTabs />
      <PilotReadinessDashboard />
    </AppShell>
  )
}
