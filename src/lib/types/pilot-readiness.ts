import type { OrganizationStatus } from '@/lib/types/organization'

export type PilotReadinessRiskLevel = 'ok' | 'warning' | 'critical'

export interface PilotOrganizationCheck {
  id: string
  name: string
  status: OrganizationStatus
  access_until: string | null
  member_count: number
  risks: string[]
  risk_level: PilotReadinessRiskLevel
}

export interface PilotReadinessStats {
  organizations_total: number
  organizations_trial: number
  organizations_active: number
  organizations_expired: number
  organizations_blocked: number
  organizations_without_members: number
  organizations_expiring_soon: number
  municipalities_total: number
  municipalities_confirmed: number
  municipalities_open: number
  municipalities_missing_data_stand: number
  municipalities_outdated: number
  municipalities_missing_source: number
  source_ready_count: number
  latest_import_at: string | null
}

export interface PilotReadinessResponse {
  data: {
    stats: PilotReadinessStats
    organizations: PilotOrganizationCheck[]
  }
}
