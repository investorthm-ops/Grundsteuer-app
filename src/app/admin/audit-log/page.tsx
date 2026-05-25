import { AppShell } from '@/components/app-shell'
import { AuditLogView } from '@/components/admin/audit-log-view'

export default function AdminAuditLogPage() {
  return (
    <AppShell
      eyebrow="Admin"
      title="Audit-Log"
      description="Chronologische Liste aller Admin-Aktionen an Organisationen, Mitgliedschaften und Einladungen."
    >
      <AuditLogView />
    </AppShell>
  )
}
