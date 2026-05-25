import { AppShell } from '@/components/app-shell'
import { AdminTabs } from '@/components/admin/admin-tabs'
import { ImportManager } from '@/components/imports/import-manager'

export default function AdminImportePage() {
  return (
    <AppShell
      eyebrow="Admin"
      title="Import- und Quellenpipeline"
      description={'Pr\u00fcfe CSV-Dateien, kontrolliere Konflikte und gib belastbare Hebesatz-Daten gezielt frei.'}
    >
      <AdminTabs />
      <ImportManager />
    </AppShell>
  )
}
