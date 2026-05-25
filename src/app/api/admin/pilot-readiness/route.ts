import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/supabase/is-admin'
import type {
  PilotOrganizationCheck,
  PilotReadinessRiskLevel,
  PilotReadinessStats,
} from '@/lib/types/pilot-readiness'
import type { OrganizationStatus } from '@/lib/types/organization'

type OrganizationRow = {
  id: string
  name: string
  status: OrganizationStatus
  access_until: string | null
  memberships: { id: string }[] | null
}

type MunicipalityQualityRow = {
  id: string
  datenstand: string | null
  quellenstatus: 'bestaetigt' | 'offen'
  quellenname: string | null
}

const CURRENT_DATA_STAND_MIN = '2025-01-01'
const EXPIRING_SOON_DAYS = 14

function addDays(date: Date, days: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10)
}

function statusCounts(status: OrganizationStatus, key: OrganizationStatus) {
  return status === key ? 1 : 0
}

function getOrganizationCheck(
  organization: OrganizationRow,
  today: string,
  soonLimit: string
): PilotOrganizationCheck {
  const memberCount = organization.memberships?.length ?? 0
  const risks: string[] = []

  if (memberCount === 0) risks.push('Keine Nutzer zugeordnet')
  if (organization.status === 'blocked') risks.push('Zugang gesperrt')
  if (organization.status === 'expired') risks.push('Status abgelaufen')
  if (organization.access_until && organization.access_until < today) {
    risks.push('Zugriff abgelaufen')
  } else if (
    organization.access_until &&
    organization.access_until >= today &&
    organization.access_until <= soonLimit
  ) {
    risks.push('Zugriff läuft bald ab')
  }

  let riskLevel: PilotReadinessRiskLevel = 'ok'
  if (risks.length > 0) riskLevel = 'warning'
  if (
    organization.status === 'blocked' ||
    organization.status === 'expired' ||
    (organization.access_until && organization.access_until < today)
  ) {
    riskLevel = 'critical'
  }

  return {
    id: organization.id,
    name: organization.name,
    status: organization.status,
    access_until: organization.access_until,
    member_count: memberCount,
    risks,
    risk_level: riskLevel,
  }
}

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })
  }
  if (!(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: 'Kein Admin-Zugriff.' }, { status: 403 })
  }

  const [{ data: organizations, error: organizationError }, { data: municipalities, error: municipalityError }, { data: latestImports, error: importError }] =
    await Promise.all([
      supabase
        .from('organizations')
        .select('id,name,status,access_until,memberships:organization_memberships(id)')
        .order('created_at', { ascending: false }),
      supabase
        .from('municipalities')
        .select('id,datenstand,quellenstatus,quellenname'),
      supabase
        .from('import_runs')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1),
    ])

  if (organizationError) {
    return NextResponse.json({ error: 'Kundenstatus konnte nicht geladen werden.' }, { status: 500 })
  }
  if (municipalityError) {
    return NextResponse.json({ error: 'Datenqualität konnte nicht geladen werden.' }, { status: 500 })
  }
  if (importError) {
    return NextResponse.json({ error: 'Importstatus konnte nicht geladen werden.' }, { status: 500 })
  }

  const today = toDateOnly(new Date())
  const soonLimit = toDateOnly(addDays(new Date(), EXPIRING_SOON_DAYS))
  const organizationRows = (organizations ?? []) as OrganizationRow[]
  const municipalityRows = (municipalities ?? []) as MunicipalityQualityRow[]
  const organizationChecks = organizationRows.map((organization) =>
    getOrganizationCheck(organization, today, soonLimit)
  )

  const stats: PilotReadinessStats = {
    organizations_total: organizationRows.length,
    organizations_trial: organizationRows.reduce((sum, row) => sum + statusCounts(row.status, 'trial'), 0),
    organizations_active: organizationRows.reduce((sum, row) => sum + statusCounts(row.status, 'active'), 0),
    organizations_expired: organizationRows.reduce((sum, row) => sum + statusCounts(row.status, 'expired'), 0),
    organizations_blocked: organizationRows.reduce((sum, row) => sum + statusCounts(row.status, 'blocked'), 0),
    organizations_without_members: organizationChecks.filter((item) => item.member_count === 0).length,
    organizations_expiring_soon: organizationChecks.filter((item) =>
      item.risks.includes('Zugriff läuft bald ab')
    ).length,
    municipalities_total: municipalityRows.length,
    municipalities_confirmed: municipalityRows.filter((item) => item.quellenstatus === 'bestaetigt').length,
    municipalities_open: municipalityRows.filter((item) => item.quellenstatus === 'offen').length,
    municipalities_missing_data_stand: municipalityRows.filter((item) => !item.datenstand).length,
    municipalities_outdated: municipalityRows.filter(
      (item) => item.datenstand !== null && item.datenstand < CURRENT_DATA_STAND_MIN
    ).length,
    municipalities_missing_source: municipalityRows.filter((item) => !item.quellenname).length,
    source_ready_count: municipalityRows.filter(
      (item) => item.quellenstatus === 'bestaetigt' && Boolean(item.quellenname)
    ).length,
    latest_import_at: latestImports?.[0]?.created_at ?? null,
  }

  return NextResponse.json({
    data: {
      stats,
      organizations: organizationChecks,
    },
  })
}
