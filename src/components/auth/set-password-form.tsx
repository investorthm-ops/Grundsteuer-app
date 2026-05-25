'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { KeyRound, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type Status = 'idle' | 'no-session' | 'submitting' | 'done' | 'error'

function hasAuthTokenInUrl(): boolean {
  if (typeof window === 'undefined') return false

  const url = new URL(window.location.href)

  return (
    url.searchParams.has('code') ||
    url.searchParams.has('token_hash') ||
    url.hash.includes('access_token=') ||
    url.hash.includes('refresh_token=')
  )
}

export function SetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!hasAuthTokenInUrl()) {
      setStatus('no-session')
      return
    }

    const supabase = createSupabaseBrowserClient()
    // Supabase parses the recovery / invite token from the URL hash and
    // creates a temporary session. Wait for that, otherwise updateUser
    // would have nothing to act on.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!data.session) setStatus('no-session')
      })
      .catch(() => {
        setStatus('no-session')
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
      .catch(() => ({
        error: new Error('Password update failed'),
      }))

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
      <div className="space-y-5 rounded-lg border bg-white p-5 text-sm">
        <div>
          <p className="font-medium text-zinc-900">
            Link ungültig oder abgelaufen
          </p>
          <p className="mt-2 leading-6 text-zinc-600">
            Der Einladungs- oder Reset-Link ist nicht mehr gültig. Fordere bitte
            einen neuen Link an und nutze dabei die E-Mail-Adresse, mit der dein
            Zugang angelegt wurde.
          </p>
        </div>
        <div className="rounded-md bg-zinc-50 p-4 text-zinc-600">
          <p className="font-medium text-zinc-800">Falls keine E-Mail ankommt:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Spam-Ordner prüfen.</li>
            <li>Einige Minuten warten, falls zu viele Links angefordert wurden.</li>
            <li>Den Admin bitten, die Einladung erneut zu senden.</li>
          </ul>
        </div>
        <Button asChild className="w-full">
          <Link href="/passwort-vergessen">
            <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
            Neuen Link anfordern
          </Link>
        </Button>
        <p className="text-xs leading-5 text-zinc-500">
          Hinweis: Jeder Link kann nur zeitlich begrenzt verwendet werden. Wenn
          du ihn mehrfach öffnest oder zu spät verwendest, brauchst du einen
          frischen Link.
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
