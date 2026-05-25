import { AppShell } from '@/components/app-shell'
import { AdminTabs } from '@/components/admin/admin-tabs'
import { CustomerManager } from '@/components/admin/customer-manager'

export default function AdminKundenPage() {
  return (
    <AppShell
      eyebrow="Admin"
      title="Kundenverwaltung"
      description="Lege Kundenorganisationen an, steuere Laufzeiten und ordne freigeschaltete Nutzer zu."
    >
      <AdminTabs />
      <CustomerManager />
    </AppShell>
  )
}
