'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const DIRECT_CITY_LINKS: Record<string, string> = {
  altena: '/grundsteuer-hebesatz/altena',
  dortmund: '/grundsteuer-hebesatz/dortmund',
  duesseldorf: '/grundsteuer-hebesatz/duesseldorf',
  dusseldorf: '/grundsteuer-hebesatz/duesseldorf',
  koeln: '/grundsteuer-hebesatz/koeln',
  koln: '/grundsteuer-hebesatz/koeln',
  luedenscheid: '/grundsteuer-hebesatz/luedenscheid',
  ludenscheid: '/grundsteuer-hebesatz/luedenscheid',
}

function normalizeSearch(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss')
}

type GlobalSearchProps = {
  className?: string
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return

    const normalizedQuery = normalizeSearch(trimmedQuery)
    const directHref = DIRECT_CITY_LINKS[normalizedQuery]
    router.push(directHref ?? `/datenbank?q=${encodeURIComponent(trimmedQuery)}`)
  }

  return (
    <form
      className={`relative flex min-w-0 items-center ${className ?? ''}`}
      role="search"
      onSubmit={submitSearch}
    >
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-zinc-400" aria-hidden="true" />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Gemeinde suchen"
        aria-label="Gemeinde suchen"
        className="h-10 w-full rounded-full border-zinc-300 bg-white pl-9 pr-12 text-sm shadow-sm focus-visible:ring-zinc-950"
      />
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        className="absolute right-1 h-8 rounded-full px-3 text-zinc-700 hover:bg-zinc-100"
        aria-label="Suche starten"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </Button>
    </form>
  )
}
