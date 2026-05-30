import Link from 'next/link'
import { BadgeEuro, Building2, Calculator, Database, Scale, ShieldCheck, Star, UserCircle } from 'lucide-react'
import { AuthButton } from '@/components/auth-button'
import { Button } from '@/components/ui/button'
import { SiteDisclaimer } from '@/components/site-disclaimer'
import { GlobalSearch } from '@/components/global-search'
import { createSupabaseServerClient } from '@/lib/supabase/server'

type AppShellProps = {
  children: React.ReactNode
  eyebrow?: string
  title: string
  description: string
  actions?: React.ReactNode
}

const primaryNavItems = [
  { href: '/datenbank', label: 'Datenbank', icon: Database },
  { href: '/vergleich', label: 'Vergleich', icon: Scale },
  { href: '/rechner', label: 'Rechner', icon: Calculator },
  { href: '/watchlist', label: 'Watchlist', icon: Star },
  { href: '/preise', label: 'Preise', icon: BadgeEuro },
]

export async function AppShell({
  children,
  eyebrow,
  title,
  description,
  actions,
}: AppShellProps) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isAuthenticated = Boolean(user)

  const { data: roleRow } = user
    ? await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle()
    : { data: null }
  const isAdmin = roleRow?.role === 'admin'

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-screen-2xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[300px_minmax(460px,1fr)_auto] lg:items-center lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-white shadow-sm">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold">GrundsteuerMonitor</span>
              <span className="block text-sm text-zinc-500">Hebesätze im Blick</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center justify-start gap-1 lg:flex-nowrap lg:justify-center">
            {primaryNavItems.map((item) => (
              <Button key={item.href} asChild variant="ghost" size="sm" className="text-zinc-700">
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>

          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <GlobalSearch className="w-full sm:w-56 2xl:w-64" />
            {isAdmin ? (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="shrink-0 border-zinc-300 bg-zinc-50 text-zinc-800 hover:bg-zinc-100"
              >
                <Link href="/admin/pilotstart">
                  <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                  Admin
                </Link>
              </Button>
            ) : null}
            {isAuthenticated ? (
              <Button asChild variant="ghost" size="sm" className="text-zinc-700">
                <Link href="/mein-zugang">
                  <UserCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                  Konto
                </Link>
              </Button>
            ) : null}
            <AuthButton isAuthenticated={isAuthenticated} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className="mb-2 text-sm font-medium text-zinc-500">{eyebrow}</p>
            ) : null}
            <h1 className="text-3xl font-semibold tracking-normal text-zinc-950">
              {title}
            </h1>
            <p className="mt-3 text-base leading-7 text-zinc-600">{description}</p>
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
        {children}
        <SiteDisclaimer />
      </main>
    </>
  )
}

