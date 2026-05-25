import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/supabase/is-admin'
import { logAdminAction } from '@/lib/supabase/audit'
import { membershipCreateSchema } from '@/lib/validation/organization'

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      supabase,
      user: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  if (!(await isAdmin(supabase, user.id))) {
    return {
      supabase,
      user,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return { supabase, user, response: null }
}

export async function POST(request: NextRequest) {
  const { supabase, user, response } = await requireAdmin()
  if (response) return response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = membershipCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('organization_memberships')
    .upsert(parsed.data, { onConflict: 'user_id' })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })

  await logAdminAction({
    actor: { id: user!.id, email: user!.email ?? null },
    action: 'membership.create',
    entityType: 'membership',
    entityId: data.id,
    payload: { input: parsed.data },
  })

  return NextResponse.json({ data }, { status: 201 })
}
