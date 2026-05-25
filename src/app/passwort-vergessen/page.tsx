import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata = {
  title: 'Passwort vergessen – Grundsteuer-Monitor',
  description:
    'Fordere einen Link zum Zurücksetzen deines Passworts an, wenn du dich nicht mehr einloggen kannst.',
}

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-7">
        <p className="mb-2 text-sm font-medium text-zinc-500">Konto</p>
        <h1 className="text-3xl font-semibold tracking-normal text-zinc-950">
          Passwort vergessen
        </h1>
        <p className="mt-3 text-base leading-7 text-zinc-600">
          Wir schicken dir per E-Mail einen Link, um ein neues Passwort
          festzulegen.
        </p>
      </div>
      <ForgotPasswordForm />
    </main>
  )
}
