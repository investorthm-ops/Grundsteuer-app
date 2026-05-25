import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/supabase/is-admin'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(100),
  action: z.string().min(1).max(50).optional(),
  entity_type: z.enum(['organization', 'membership', 'invitation']).optional(),
})

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(request.url)
  const parsed = querySchema.safeParse({
    limit: url.searchParams.get('limit') ?? undefined,
    action: url.searchParams.get('action') ?? undefined,
    entity_type: url.searchParams.get('entity_type') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  let query = supabase
    .from('admin_audit_log')
    .select('id, actor_user_id, actor_email, action, entity_type, entity_id, payload, created_at')
    .order('created_at', { ascending: false })
    .limit(parsed.data.limit)

  if (parsed.data.action) query = query.eq('action', parsed.data.action)
  if (parsed.data.entity_type) query = query.eq('entity_type', parsed.data.entity_type)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}
