import { redirect } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { AccountOverview } from '@/components/account/account-overview'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/supabase/is-admin'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Mein Zugang – Grundsteuer-Monitor',
  description:
    'Übersicht über deinen Zugang zum Grundsteuer-Monitor: Organisation, Laufzeit, Status.',
}

type MembershipRow = {
  id: string
  role: 'owner' | 'member'
  created_at: string
  organization:
    | {
        id: string
        name: string
        status: 'trial' | 'active' | 'expired' | 'blocked'
        access_until: string | null
        notes: string | null
      }
    | Array<{
        id: string
        name: string
        status: 'trial' | 'active' | 'expired' | 'blocked'
        access_until: string | null
        notes: string | null
      }>
    | null
}

export default async function MeinZugangPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/mein-zugang')
  }

  const userIsAdmin = await isAdmin(supabase, user.id)

  const { data } = await supabase
    .from('organization_memberships')
    .select(
      'id, role, created_at, organization:organizations(id, name, status, access_until, notes)'
    )
    .eq('user_id', user.id)
    .maybeSingle()

  const membership = data as MembershipRow | null
  const orgRaw = membership?.organization ?? null
  const organization = Array.isArray(orgRaw) ? (orgRaw[0] ?? null) : orgRaw

  return (
    <AppShell
      eyebrow="Konto"
      title="Mein Zugang"
      description="Hier siehst du, mit welcher Organisation dein Konto verknüpft ist und wie lange dein Zugang noch gültig ist."
    >
      <AccountOverview
        email={user.email ?? ''}
        memberSince={membership?.created_at ?? user.created_at}
        role={membership?.role ?? null}
        organization={organization}
        isAdmin={userIsAdmin}
      />
    </AppShell>
  )
}
