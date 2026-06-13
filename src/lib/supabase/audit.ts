import { createSupabaseAdminClient } from './admin-client'

export type AuditEntityType = 'organization' | 'membership' | 'invitation'

export type AuditAction =
  | 'org.create'
  | 'org.update'
  | 'org.delete'
  | 'membership.create'
  | 'membership.update'
  | 'membership.delete'
  | 'invitation.create'
  | 'invitation.failed'

export type AuditActor = {
  id: string
  email: string | null
}

export type LogAdminActionInput = {
  actor: AuditActor
  action: AuditAction
  entityType: AuditEntityType
  entityId: string | null
  payload?: Record<string, unknown> | null
}

/**
 * Append an entry to admin_audit_log.
 *
 * Audit-log failures must NEVER abort the calling admin action — callers
 * await this but errors are swallowed (and console-warned) so an outage
 * of the audit table does not block customer onboarding or org changes.
 */
export async function logAdminAction(input: LogAdminActionInput): Promise<void> {
  try {
    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.from('admin_audit_log').insert({
      actor_user_id: input.actor.id,
      actor_email: input.actor.email,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      payload: input.payload ?? null,
    })
    if (error) {
      console.warn('[audit] failed to write log entry', {
        action: input.action,
        entityId: input.entityId,
        error: error.message,
      })
    }
  } catch (err) {
    console.warn('[audit] unexpected error while writing log entry', err)
  }
}
