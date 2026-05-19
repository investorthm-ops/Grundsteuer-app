import { Suspense } from 'react'
import { AppShell } from '@/components/app-shell'
import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <AppShell
      eyebrow="Zugang"
      title="Einloggen"
      description="Melde dich mit deinem Supabase-Nutzer an, um die geschuetzte Hebesatz-Datenbank zu nutzen."
    >
      <div className="max-w-md">
        <Suspense fallback={<div className="rounded-lg border bg-white p-5">Login wird geladen.</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </AppShell>
  )
}
