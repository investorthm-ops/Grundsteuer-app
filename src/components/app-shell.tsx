import Link from 'next/link'
import { Building2, Calculator, Database, FileUp, Scale, ShieldCheck, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/logout-button'

type AppShellProps = {
  children: React.ReactNode
  eyebrow?: string
  title: string
  description: string
  actions?: React.ReactNode
}

export function AppShell({
  children,
  eyebrow,
  title,
  description,
  actions,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-white">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold">GrundsteuerMonitor</span>
              <span className="block text-sm text-zinc-500">Hebesaetze im Blick</span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/datenbank">
                <Database className="mr-2 h-4 w-4" aria-hidden="true" />
                Datenbank
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/watchlist">
                <Star className="mr-2 h-4 w-4" aria-hidden="true" />
                Watchlist
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/vergleich">
                <Scale className="mr-2 h-4 w-4" aria-hidden="true" />
                Vergleich
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/rechner">
                <Calculator className="mr-2 h-4 w-4" aria-hidden="true" />
                Rechner
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/datenbank">
                <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                Admin
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/importe">
                <FileUp className="mr-2 h-4 w-4" aria-hidden="true" />
                Importe
              </Link>
            </Button>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
      </main>
    </div>
  )
}
