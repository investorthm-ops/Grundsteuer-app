'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type Status = 'idle' | 'submitting' | 'done' | 'error'

function resolveOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [requestedEmail, setRequestedEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setError(null)

    const normalizedEmail = email.trim().toLowerCase()
    setRequestedEmail(normalizedEmail)

    const supabase = createSupabaseBrowserClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      { redirectTo: `${resolveOrigin()}/passwort-setzen` }
    )

    // Show the same generic success message regardless of whether the
    // email exists. Avoids user enumeration. Network/auth-API failures
    // we surface as a soft error since the user can retry.
    if (resetError && /network|timeout|fetch/i.test(resetError.message)) {
      setStatus('error')
      setError('Verbindungsproblem. Bitte erneut versuchen.')
      return
    }

    if (resetError && /rate limit|too many|429/i.test(resetError.message)) {
      setStatus('error')
      setError(
        'Aktuell wurden zu viele E-Mails angefordert. Bitte warte einige Minuten und versuche es dann erneut.'
      )
      return
    }

    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-5 text-sm text-green-900">
        <p>
          Falls ein Konto zu dieser E-Mail-Adresse existiert, ist eine Nachricht
          mit einem Link zum Zurücksetzen unterwegs.
        </p>
        {requestedEmail ? (
          <p>
            Verwendete Adresse:{' '}
            <span className="font-medium">{requestedEmail}</span>
          </p>
        ) : null}
        <p>
          Bitte prüfe auch Spam, Werbung oder sonstige Posteingangs-Ordner. Wenn
          nichts ankommt, warte einige Minuten, bevor du erneut anforderst.
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full border-green-300 bg-white text-green-900 hover:bg-green-100"
          onClick={() => {
            setStatus('idle')
            setError(null)
          }}
        >
          Andere E-Mail-Adresse verwenden
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-lg border bg-white p-5"
    >
      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <p className="text-xs leading-5 text-zinc-500">
          Nutze die E-Mail-Adresse, mit der dein Zugang angelegt wurde.
        </p>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={status === 'submitting'}>
        <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
        {status === 'submitting' ? 'Sende…' : 'Reset-Link anfordern'}
      </Button>
    </form>
  )
}
