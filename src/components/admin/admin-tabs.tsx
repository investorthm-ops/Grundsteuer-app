'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Database, FileInput, Rocket, ScrollText, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabItem = {
  href: string
  label: string
  icon: typeof Database
}

const TABS: TabItem[] = [
  { href: '/admin/pilotstart', label: 'Pilotstart', icon: Rocket },
  { href: '/admin/datenbank', label: 'Datenpflege', icon: Database },
  { href: '/admin/kunden', label: 'Kunden', icon: Users },
  { href: '/admin/importe', label: 'Importe', icon: FileInput },
  { href: '/admin/audit-log', label: 'Audit-Log', icon: ScrollText },
]

export function AdminTabs() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Admin-Bereiche"
      className="mb-6 flex flex-wrap gap-1 border-b"
    >
      {TABS.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-zinc-950 text-zinc-950'
                : 'border-transparent text-zinc-600 hover:text-zinc-950'
            )}
          >
            <tab.icon className="h-4 w-4" aria-hidden="true" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
