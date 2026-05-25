import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/supabase/is-admin'
import { logAdminAction } from '@/lib/supabase/audit'
import { organizationUpdateSchema } from '@/lib/validation/organization'

const idSchema = z.string().uuid()

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const { supabase, user, response } = await requireAdmin()
  if (response) return response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = organizationUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'Empty update' }, { status: 400 })
  }

  // Capture before-state for audit log
  const { data: before } = await supabase
    .from('organizations')
    .select('id, name, status, access_until, notes')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('organizations')
    .update(parsed.data)
    .eq('id', id)
    .select('*, memberships:organization_memberships(*)')
    .single()

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })

  await logAdminAction({
    actor: { id: user!.id, email: user!.email ?? null },
    action: 'org.update',
    entityType: 'organization',
    entityId: id,
    payload: { before, changes: parsed.data },
  })

  return NextResponse.json({ data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const { supabase, user, response } = await requireAdmin()
  if (response) return response

  // Capture before-state for audit log (also gives us 'not found' detection)
  const { data: before } = await supabase
    .from('organizations')
    .select('id, name, status, access_until, notes')
    .eq('id', id)
    .single()

  // organization_memberships.organization_id has ON DELETE CASCADE, so any
  // associated memberships are removed automatically. Supabase Auth users
  // are NOT touched — they keep their account but lose access to the app.
  const { error, count } = await supabase
    .from('organizations')
    .delete({ count: 'exact' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  if (!count) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await logAdminAction({
    actor: { id: user!.id, email: user!.email ?? null },
    action: 'org.delete',
    entityType: 'organization',
    entityId: id,
    payload: { before },
  })

  return new NextResponse(null, { status: 204 })
}
