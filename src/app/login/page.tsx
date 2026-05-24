import { Suspense } from 'react'
import { AppShell } from '@/components/app-shell'
import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <AppShell
      eyebrow="Zugang"
      title="Einloggen"
      description="Melde dich mit deinem freigeschalteten Nutzer an. Zugänge werden aktuell durch den Betreiber für Pilotkunden und Kundenorganisationen aktiviert."
    >
      <div className="max-w-md">
        <Suspense fallback={<div className="rounded-lg border bg-white p-5">Login wird geladen.</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </AppShell>
  )
}
