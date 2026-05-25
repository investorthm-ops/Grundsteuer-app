'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type Status = 'idle' | 'no-session' | 'submitting' | 'done' | 'error'

export function SetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    // Supabase parses the recovery / invite token from the URL hash and
    // creates a temporary session. Wait for that, otherwise updateUser
    // would have nothing to act on.
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) setStatus('no-session')
    })
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Die beiden Passwörter stimmen nicht überein.')
      return
    }
    if (password.length < 10) {
      setError('Bitte vergib mindestens 10 Zeichen.')
      return
    }

    setStatus('submitting')
    const supabase = createSupabaseBrowserClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setStatus('error')
      setError(
        'Passwort konnte nicht gesetzt werden. Bitte fordere einen neuen Link an.'
      )
      return
    }

    setStatus('done')
    // Small delay so the user sees the confirmation
    setTimeout(() => {
      window.location.href = '/'
    }, 1500)
  }

  if (status === 'no-session') {
    return (
      <div className="rounded-lg border bg-white p-5 text-sm">
        <p className="font-medium text-zinc-900">Link ungültig oder abgelaufen</p>
        <p className="mt-2 text-zinc-600">
          Der Einladungs- oder Reset-Link ist nicht mehr gültig. Fordere bitte
          unter{' '}
          <a className="underline" href="/passwort-vergessen">
            Passwort vergessen
          </a>{' '}
          einen neuen Link an oder bitte den Admin um eine erneute Einladung.
        </p>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-sm text-green-900">
        Passwort gespeichert. Du wirst weitergeleitet…
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-lg border bg-white p-5"
    >
      <div className="space-y-2">
        <Label htmlFor="password">Neues Passwort</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={10}
          required
        />
        <p className="text-xs text-zinc-500">Mindestens 10 Zeichen.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Passwort bestätigen</Label>
        <Input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          autoComplete="new-password"
          minLength={10}
          required
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={status === 'submitting'}>
        <KeyRound className="mr-2 h-4 w-4" aria-hidden="true" />
        {status === 'submitting' ? 'Speichern…' : 'Passwort speichern'}
      </Button>
    </form>
  )
}
