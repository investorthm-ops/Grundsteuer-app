'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileInput,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type {
  PilotOrganizationCheck,
  PilotReadinessResponse,
  PilotReadinessStats,
} from '@/lib/types/pilot-readiness'
import type { OrganizationStatus } from '@/lib/types/organization'
import { formatDate as formatDateShared } from '@/lib/reports/format'

const STATUS_LABELS: Record<OrganizationStatus, string> = {
  trial: 'Testphase',
  active: 'Aktiv',
  expired: 'Abgelaufen',
  blocked: 'Gesperrt',
}

const NEXT_STEPS = [
  'SMTP für Auth-Mails einrichten',
  'Impressum und Datenschutz finalisieren',
  'Pilotkommunen gegen Originalquellen prüfen',
  'Testkunde einladen und Login komplett durchspielen',
]

function percent(value: number, total: number) {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

function formatDate(value: string | null) {
  return formatDateShared(value, 'unbegrenzt')
}

function statusVariant(status: OrganizationStatus) {
  if (status === 'active') return 'default' as const
  if (status === 'trial') return 'secondary' as const
  return 'destructive' as const
}

function riskVariant(item: PilotOrganizationCheck) {
  if (item.risk_level === 'critical') return 'destructive' as const
  if (item.risk_level === 'warning') return 'secondary' as const
  return 'default' as const
}

function riskLabel(item: PilotOrganizationCheck) {
  if (item.risks.length === 0) return 'Bereit'
  return item.risks.join(' - ')
}

export function PilotReadinessDashboard() {
  const [stats, setStats] = useState<PilotReadinessStats | null>(null)
  const [organizations, setOrganizations] = useState<PilotOrganizationCheck[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadReadiness() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/pilot-readiness')
      const payload = (await response.json()) as Partial<PilotReadinessResponse> & {
        error?: string
      }
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Pilotstart konnte nicht geladen werden.')
      }
      setStats(payload.data.stats)
      setOrganizations(payload.data.organizations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReadiness()
  }, [])

  const confirmedPercent = useMemo(
    () => percent(stats?.municipalities_confirmed ?? 0, stats?.municipalities_total ?? 0),
    [stats]
  )
  const sourceReadyPercent = useMemo(
    () => percent(stats?.source_ready_count ?? 0, stats?.municipalities_total ?? 0),
    [stats]
  )

  if (error) {
    return (
      <Card>
        <CardContent className="flex min-h-56 flex-col items-center justify-center text-center">
          <AlertTriangle className="mb-3 h-9 w-9 text-red-600" aria-hidden="true" />
          <p className="font-medium text-red-700">{error}</p>
          <Button className="mt-4" variant="outline" onClick={loadReadiness}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Erneut laden
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-600">
          {isLoading ? 'Pilotstart wird geladen' : 'Live-Check aus Kunden- und Datenbestand'}
        </p>
        <Button variant="outline" size="sm" onClick={loadReadiness} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Aktualisieren
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Kundenorganisationen"
          value={stats?.organizations_total ?? 0}
          detail={`${stats?.organizations_trial ?? 0} Testphase - ${stats?.organizations_active ?? 0} aktiv`}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Onboarding-Risiken"
          value={(stats?.organizations_without_members ?? 0) + (stats?.organizations_expiring_soon ?? 0)}
          detail={`${stats?.organizations_without_members ?? 0} ohne Nutzer - ${stats?.organizations_expiring_soon ?? 0} bald ablaufend`}
        />
        <MetricCard
          icon={Database}
          label="Gemeinden"
          value={stats?.municipalities_total ?? 0}
          detail={`${confirmedPercent}% mit bestätigtem Quellenstatus`}
        />
        <MetricCard
          icon={ShieldCheck}
          label="Quellenfähig"
          value={`${sourceReadyPercent}%`}
          detail={`${stats?.source_ready_count ?? 0} Datensätze bestätigt mit Quelle`}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg border bg-white">
          <div className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Pilotkunden-Check</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Status, Nutzer und Laufzeit pro Organisation.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/kunden">
                <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                Kunden pflegen
              </Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kunde</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nutzer</TableHead>
                  <TableHead>Zugriff bis</TableHead>
                  <TableHead>Hinweis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(item.status)}>{STATUS_LABELS[item.status]}</Badge>
                    </TableCell>
                    <TableCell>{item.member_count}</TableCell>
                    <TableCell>{formatDate(item.access_until)}</TableCell>
                    <TableCell className="min-w-64">
                      <Badge variant={riskVariant(item)}>{riskLabel(item)}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && organizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-zinc-500">
                      Noch keine Kundenorganisation angelegt.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Datenqualitäts-Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <QualityRow
                label="Bestätigte Quellen"
                value={`${stats?.municipalities_confirmed ?? 0} von ${stats?.municipalities_total ?? 0}`}
                progress={confirmedPercent}
              />
              <QualityRow
                label="Quellenfähige Datensätze"
                value={`${stats?.source_ready_count ?? 0} von ${stats?.municipalities_total ?? 0}`}
                progress={sourceReadyPercent}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <SmallRisk label="Offen" value={stats?.municipalities_open ?? 0} />
                <SmallRisk label="Ohne Stand" value={stats?.municipalities_missing_data_stand ?? 0} />
                <SmallRisk label="Vor 2025" value={stats?.municipalities_outdated ?? 0} />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/datenbank">
                    <Database className="mr-2 h-4 w-4" aria-hidden="true" />
                    Datenpflege
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/importe">
                    <FileInput className="mr-2 h-4 w-4" aria-hidden="true" />
                    Importe
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Nächste Schritte</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {NEXT_STEPS.map((step) => (
                  <li key={step} className="flex gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Users
  label: string
  value: number | string
  detail: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
          <span className="rounded-md border bg-zinc-50 p-2 text-zinc-600">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-3 text-sm text-zinc-500">{detail}</p>
      </CardContent>
    </Card>
  )
}

function QualityRow({
  label,
  value,
  progress,
}: {
  label: string
  value: string
  progress: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-zinc-500">{value}</span>
      </div>
      <Progress value={progress} />
    </div>
  )
}

function SmallRisk({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-zinc-50 px-3 py-2">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  )
}
