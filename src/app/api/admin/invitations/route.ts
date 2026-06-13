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

type AdminClient = ReturnType<typeof createSupabaseAdminClient>

// Supabase Auth hat kein "get user by email" — listUsers liefert nur eine Seite
// (Default 50). Wir blaettern durch, damit auch bei >50 Nutzern ein bereits
// registrierter Kunde erneut eingeladen werden kann (QA-Befund PROJ-12).
async function findAuthUserIdByEmail(
  adminClient: AdminClient,
  email: string
): Promise<string | null> {
  const target = email.toLowerCase()
  const perPage = 200
  // Sicherheitskappe gegen Endlosschleifen: 50 Seiten * 200 = 10.000 Nutzer.
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage,
    })
    if (error) return null
    const users = data?.users ?? []
    const match = users.find((u) => (u.email ?? '').toLowerCase() === target)
    if (match) return match.id
    if (users.length < perPage) break // letzte Seite erreicht
  }
  return null
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

  // Wurde durch DIESEN Aufruf ein neuer Auth-Nutzer angelegt? Nur dann duerfen
  // wir ihn bei einem spaeteren Fehler wieder loeschen (Rollback). Ein bereits
  // vorher existierender Nutzer wird niemals geloescht.
  const userWasNewlyCreated = Boolean(inviteResult?.user?.id)

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
    // Lookup existing user via paginierte listUsers (Supabase has no get-by-email)
    userId = await findAuthUserIdByEmail(adminClient, email)
    if (!userId) {
      return NextResponse.json(
        { error: 'User exists but could not be located' },
        { status: 502 }
      )
    }
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
    // Rollback: Haben WIR den Nutzer gerade neu angelegt, raeumen wir ihn wieder
    // weg, damit kein "halber" Account ohne Org-Zugang zurueckbleibt. Bestehende
    // Nutzer bleiben unangetastet.
    let rolledBack = false
    if (userWasNewlyCreated) {
      const { error: deleteError } =
        await adminClient.auth.admin.deleteUser(userId)
      rolledBack = !deleteError
    }

    // Teilfehler protokollieren (blockiert nichts, wirft nicht).
    await logAdminAction({
      actor: { id: user!.id, email: user!.email ?? null },
      action: 'invitation.failed',
      entityType: 'invitation',
      entityId: userId,
      payload: {
        email,
        organization_id,
        organization_name: org.name,
        role,
        reason: 'membership_write_failed',
        detail: membershipError.message,
        user_was_newly_created: userWasNewlyCreated,
        rolled_back: rolledBack,
      },
    })

    return NextResponse.json(
      {
        error: 'Membership write failed',
        detail: membershipError.message,
        rolled_back: rolledBack,
      },
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
      reused_existing_user: !userWasNewlyCreated,
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
