'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { municipalitySlug } from '@/lib/seo/municipality-slug'

export function SearchHero() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    const slug = municipalitySlug(trimmed)
    if (!slug) return
    router.push(`/grundsteuer-hebesatz/${slug}`)
  }

  return (
    <section className="rounded-lg border bg-white p-6 sm:p-10">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          Gemeinde suchen
        </h2>
        <p className="mt-3 text-base leading-7 text-zinc-600">
          Tippe einen Gemeindenamen und sieh den aktuellen Hebesatz auf der öffentlichen Stadtseite.
        </p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="z. B. Koeln, Dortmund, Frankfurt..."
              className="pl-9"
              aria-label="Gemeindenamen eingeben"
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={!query.trim()}>
            Stadtseite öffnen
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </form>
        <p className="mt-4 text-xs text-zinc-500">
          Stadtseiten sind ohne Login einsehbar. Für Vergleich, Watchlist und Export anmelden.
        </p>
      </div>
    </section>
  )
}
