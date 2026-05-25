import { z } from 'zod'

export const ORGANIZATION_STATUSES = ['trial', 'active', 'expired', 'blocked'] as const
export const ORGANIZATION_ROLES = ['owner', 'member'] as const

export const organizationCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  status: z.enum(ORGANIZATION_STATUSES).default('trial'),
  access_until: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
})

export const organizationUpdateSchema = organizationCreateSchema.partial()

export const membershipCreateSchema = z.object({
  organization_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(ORGANIZATION_ROLES).default('member'),
})

export const membershipUpdateSchema = z.object({
  role: z.enum(ORGANIZATION_ROLES),
})

export const invitationCreateSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  full_name: z.string().trim().min(1).max(200),
  organization_id: z.string().uuid(),
  role: z.enum(ORGANIZATION_ROLES).default('member'),
})

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
})

export const passwordUpdateSchema = z.object({
  password: z
    .string()
    .min(10, 'Passwort muss mindestens 10 Zeichen lang sein')
    .max(200),
})

export type OrganizationCreateInput = z.infer<typeof organizationCreateSchema>
export type OrganizationUpdateInput = z.infer<typeof organizationUpdateSchema>
export type MembershipCreateInput = z.infer<typeof membershipCreateSchema>
export type InvitationCreateInput = z.infer<typeof invitationCreateSchema>
