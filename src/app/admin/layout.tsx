import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/supabase/is-admin'

// Serverseitiger Türsteher für ALLE /admin-Seiten (Defense in Depth).
// Die Middleware (src/proxy.ts) schützt /admin bereits; dieses Layout ist das
// zweite Netz, falls der Middleware-Matcher je geändert wird. Spiegelt die
// gleiche Logik: kein Login -> /login, kein Admin -> /datenbank.
export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/admin')
  }

  const userIsAdmin = await isAdmin(supabase, user.id)
  if (!userIsAdmin) {
    redirect('/datenbank')
  }

  return <>{children}</>
}
