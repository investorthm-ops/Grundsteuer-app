import { AppShell } from '@/components/app-shell'
import { CustomerManager } from '@/components/admin/customer-manager'

export default function AdminKundenPage() {
  return (
    <AppShell
      eyebrow="Admin"
      title="Kundenverwaltung"
      description="Lege Kundenorganisationen an, steuere Laufzeiten und ordne freigeschaltete Nutzer zu."
    >
      <CustomerManager />
    </AppShell>
  )
}
