import { SetPasswordForm } from '@/components/auth/set-password-form'

export const metadata = {
  title: 'Passwort festlegen – Grundsteuer-Monitor',
  description:
    'Lege ein neues Passwort fest, um deinen Zugang zum Grundsteuer-Monitor zu aktivieren.',
}

export default function SetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-7">
        <p className="mb-2 text-sm font-medium text-zinc-500">Konto</p>
        <h1 className="text-3xl font-semibold tracking-normal text-zinc-950">
          Passwort festlegen
        </h1>
        <p className="mt-3 text-base leading-7 text-zinc-600">
          Diese Seite gilt sowohl für die erste Anmeldung nach einer Einladung als
          auch für das Zurücksetzen eines vergessenen Passworts. Vergib ein
          Passwort mit mindestens 10 Zeichen.
        </p>
      </div>
      <SetPasswordForm />
    </main>
  )
}
