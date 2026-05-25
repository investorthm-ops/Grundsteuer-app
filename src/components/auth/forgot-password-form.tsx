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
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setError(null)

    const supabase = createSupabaseBrowserClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
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

    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-sm text-green-900">
        Falls ein Konto zu dieser E-Mail-Adresse existiert, ist eine Nachricht
        mit einem Link zum Zurücksetzen unterwegs. Bitte prüfe auch deinen
        Spam-Ordner.
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
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={status === 'submitting'}>
        <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
        {status === 'submitting' ? 'Sende…' : 'Reset-Link anfordern'}
      </Button>
    </form>
  )
}
