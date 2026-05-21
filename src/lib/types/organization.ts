export type OrganizationStatus = 'trial' | 'active' | 'expired' | 'blocked'
export type OrganizationRole = 'owner' | 'member'

export interface Organization {
  id: string
  name: string
  status: OrganizationStatus
  access_until: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrganizationMembership {
  id: string
  organization_id: string
  user_id: string
  role: OrganizationRole
  created_at: string
  updated_at: string
}

export interface OrganizationWithMembers extends Organization {
  memberships: OrganizationMembership[]
}

export interface OrganizationListResponse {
  data: OrganizationWithMembers[]
}
