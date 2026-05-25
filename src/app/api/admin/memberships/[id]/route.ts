import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/supabase/is-admin'
import { logAdminAction } from '@/lib/supabase/audit'
import { membershipUpdateSchema } from '@/lib/validation/organization'

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

  const parsed = membershipUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { data: before } = await supabase
    .from('organization_memberships')
    .select('id, organization_id, user_id, role')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('organization_memberships')
    .update(parsed.data)
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })

  await logAdminAction({
    actor: { id: user!.id, email: user!.email ?? null },
    action: 'membership.update',
    entityType: 'membership',
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

  const { data: before } = await supabase
    .from('organization_memberships')
    .select('id, organization_id, user_id, role')
    .eq('id', id)
    .single()

  const { error, count } = await supabase
    .from('organization_memberships')
    .delete({ count: 'exact' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  if (!count) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await logAdminAction({
    actor: { id: user!.id, email: user!.email ?? null },
    action: 'membership.delete',
    entityType: 'membership',
    entityId: id,
    payload: { before },
  })

  return new NextResponse(null, { status: 204 })
}
