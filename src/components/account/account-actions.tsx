'use client'

import Link from 'next/link'
import { KeyRound, LifeBuoy, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SUPPORT_EMAIL = 'investorthm@gmail.com'

type AccountActionsProps = {
  organizationName: string
}

function buildMailto(subject: string, body?: string): string {
  const params = new URLSearchParams({ subject })
  if (body) params.set('body', body)
  return `mailto:${SUPPORT_EMAIL}?${params.toString()}`
}

/**
 * Action buttons for /mein-zugang.
 *
 * Kept as a Client Component on purpose: the mailto-Links are intercepted
 * by browser extensions (password managers, ad blockers) which mutate the
 * DOM before React hydrates — that caused a Hydration mismatch error
 * when this block was rendered on the server. Moving it to the client
 * eliminates the entire class of SSR/Client diffs for these elements.
 */
export function AccountActions({ organizationName }: AccountActionsProps) {
  return (
    <div className="mt-5 flex flex-wrap gap-3">
      <Button asChild variant="outline">
        <Link href="/passwort-vergessen">
          <KeyRound className="mr-2 h-4 w-4" aria-hidden="true" />
          Passwort ändern
        </Link>
      </Button>
      <Button asChild variant="outline">
        <a
          href={buildMailto(
            `Anfrage zum Zugang – ${organizationName}`,
            'Hallo Markus,\n\n'
          )}
        >
          <LifeBuoy className="mr-2 h-4 w-4" aria-hidden="true" />
          Kontakt aufnehmen
        </a>
      </Button>
      <Button asChild variant="ghost" className="text-red-700 hover:text-red-900">
        <a
          href={buildMailto(
            `Account-Löschung gemäß DSGVO Art. 17 – ${organizationName}`,
            'Hallo Markus,\n\nhiermit beantrage ich die Löschung meines Accounts beim Grundsteuer-Monitor gemäß DSGVO Art. 17.\n\n'
          )}
        >
          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
          Account-Löschung anfragen
        </a>
      </Button>
    </div>
  )
}
