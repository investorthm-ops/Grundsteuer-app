import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client'
import { isAdmin } from '@/lib/supabase/is-admin'
import { logAdminAction } from '@/lib/supabase/audit'
import { invitationCreateSchema } from '@/lib/validation/organization'

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

function resolveSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv.replace(/\/$/, '')
  }
  return 'http://localhost:3000'
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireAdmin()
  if (response) return response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = invitationCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { email, full_name, organization_id, role } = parsed.data
  const adminClient = createSupabaseAdminClient()

  // Verify org exists (cheap pre-check before sending a mail)
  const { data: org, error: orgError } = await adminClient
    .from('organizations')
    .select('id, name')
    .eq('id', organization_id)
    .single()

  if (orgError || !org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  // 1) Invite user (creates auth.users row OR returns existing user)
  const redirectTo = `${resolveSiteUrl()}/passwort-setzen`
  const { data: inviteResult, error: inviteError } =
    await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { full_name },
      redirectTo,
    })

  // If user already exists Supabase returns a 422 "User already registered".
  // We try to recover by looking the user up and proceeding with membership.
  let userId: string | null = inviteResult?.user?.id ?? null
  if (!userId) {
    if (
      !inviteError ||
      !/already|registered|exists/i.test(inviteError.message ?? '')
    ) {
      const message = inviteError?.message ?? 'Invite failed'
      return NextResponse.json(
        { error: 'Invite failed', detail: message },
        { status: 502 }
      )
    }
    // Lookup existing user via listUsers (Supabase has no get-by-email)
    const lookup = await adminClient.auth.admin.listUsers()
    const existing = lookup.data?.users.find(
      (u) => (u.email ?? '').toLowerCase() === email
    )
    if (!existing) {
      return NextResponse.json(
        { error: 'User exists but could not be located' },
        { status: 502 }
      )
    }
    userId = existing.id
  }

  // 2) Upsert membership (one user = one org constraint applies)
  const { data: membership, error: membershipError } = await adminClient
    .from('organization_memberships')
    .upsert(
      { organization_id, user_id: userId, role },
      { onConflict: 'user_id' }
    )
    .select('*')
    .single()

  if (membershipError) {
    return NextResponse.json(
      { error: 'Membership write failed', detail: membershipError.message },
      { status: 500 }
    )
  }

  // 3) Audit log entry (does not throw on failure)
  await logAdminAction({
    actor: { id: user!.id, email: user!.email ?? null },
    action: 'invitation.create',
    entityType: 'invitation',
    entityId: userId,
    payload: {
      email,
      full_name,
      organization_id,
      organization_name: org.name,
      role,
      reused_existing_user: inviteResult?.user?.id ? false : true,
    },
  })

  return NextResponse.json(
    {
      data: {
        user_id: userId,
        email,
        membership,
        invitation_sent: Boolean(inviteResult?.user?.id),
      },
    },
    { status: 201 }
  )
}
