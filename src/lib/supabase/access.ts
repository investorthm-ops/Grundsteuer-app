import type { SupabaseClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/supabase/is-admin'

export type AccessState =
  | { allowed: true; reason: 'admin' | 'active' }
  | { allowed: false; reason: 'no_user' | 'no_organization' | 'expired' | 'blocked' }

type OrganizationAccessRow = {
  organization:
    | {
        status: string
        access_until: string | null
      }
    | Array<{
        status: string
        access_until: string | null
      }>
    | null
}

type OrganizationAccess = {
    status: string
    access_until: string | null
}

export async function getAccessState(
  supabase: SupabaseClient,
  userId: string | null
): Promise<AccessState> {
  if (!userId) return { allowed: false, reason: 'no_user' }

  if (await isAdmin(supabase, userId)) {
    return { allowed: true, reason: 'admin' }
  }

  const { data, error } = await supabase
    .from('organization_memberships')
    .select('organization:organizations(status,access_until)')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return { allowed: false, reason: 'no_organization' }

  const row = data as unknown as OrganizationAccessRow
  const organization: OrganizationAccess | null = Array.isArray(row.organization)
    ? row.organization[0] ?? null
    : row.organization
  if (!organization) return { allowed: false, reason: 'no_organization' }
  if (organization.status === 'blocked') return { allowed: false, reason: 'blocked' }
  if (organization.status === 'expired') return { allowed: false, reason: 'expired' }

  if (organization.access_until) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const accessUntil = new Date(`${organization.access_until}T00:00:00`)
    if (accessUntil < today) return { allowed: false, reason: 'expired' }
  }

  if (organization.status === 'trial' || organization.status === 'active') {
    return { allowed: true, reason: 'active' }
  }

  return { allowed: false, reason: 'expired' }
}
