import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { AccountActions } from '@/components/account/account-actions'

type Organization = {
  id: string
  name: string
  status: 'trial' | 'active' | 'expired' | 'blocked'
  access_until: string | null
  notes: string | null
}

type AccountOverviewProps = {
  email: string
  memberSince: string
  role: 'owner' | 'member' | null
  organization: Organization | null
  isAdmin: boolean
}

const SUPPORT_EMAIL = 'investorthm@gmail.com'

const STATUS_LABELS: Record<Organization['status'], string> = {
  trial: 'Testphase',
  active: 'Aktiv',
  expired: 'Abgelaufen',
  blocked: 'Gesperrt',
}

function statusVariant(
  status: Organization['status']
): 'default' | 'secondary' | 'destructive' {
  if (status === 'active') return 'default'
  if (status === 'trial') return 'secondary'
  return 'destructive'
}

function formatDate(value: string | null): string {
  if (!value) return 'unbefristet'
  try {
    return new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function remainingDays(value: string | null): number | null {
  if (!value) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const until = new Date(`${value}T00:00:00`)
  const diffMs = until.getTime() - today.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function AccountOverview({
  email,
  memberSince,
  role,
  organization,
  isAdmin,
}: AccountOverviewProps) {
  // Edge case: admin without an org — show explanatory note.
  if (isAdmin && !organization) {
    return (
      <div className="space-y-6">
        <section className="rounded-lg border bg-white p-6">
          <p className="mb-2 text-sm font-medium text-zinc-500">Konto</p>
          <p className="text-2xl font-semibold tracking-normal text-zinc-950">
            Global-Admin
          </p>
          <p className="mt-3 text-base leading-7 text-zinc-600">
            Du bist als Administrator eingeloggt und nicht an eine
            Kundenorganisation gebunden. Die Verwaltung von Organisationen,
            Einladungen und Audit-Log findest du unter{' '}
            <Link
              href="/admin/kunden"
              className="font-medium underline hover:text-zinc-950"
            >
              /admin/kunden
            </Link>
            .
          </p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-zinc-500">E-Mail</dt>
              <dd className="text-base font-medium text-zinc-950">{email}</dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-500">Konto seit</dt>
              <dd className="text-base font-medium text-zinc-950">
                {formatDate(memberSince)}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    )
  }

  // Edge case: user without org and not admin — friendly redirect hint
  if (!organization) {
    return (
      <div className="space-y-6">
        <section className="rounded-lg border bg-white p-6">
          <p className="text-base leading-7 text-zinc-600">
            Dein Konto ist aktuell keiner Organisation zugeordnet. Bitte wende
            dich an{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Zugang freischalten')}`}
              className="font-medium underline hover:text-zinc-950"
            >
              {SUPPORT_EMAIL}
            </a>
            , damit dein Zugang aktiviert wird.
          </p>
        </section>
      </div>
    )
  }

  const days = remainingDays(organization.access_until)
  const PRACTICALLY_UNLIMITED_DAYS = 365 * 100 // ~100 Jahre
  const daysLabel = (() => {
    if (organization.access_until === null) return 'unbefristet'
    if (days === null) return ''
    if (days > PRACTICALLY_UNLIMITED_DAYS) return 'praktisch unbegrenzt'
    if (days < 0) return `seit ${Math.abs(days)} Tag${Math.abs(days) === 1 ? '' : 'en'} abgelaufen`
    if (days === 0) return 'läuft heute ab'
    if (days === 1) return 'noch 1 Tag'
    return `noch ${days} Tage`
  })()

  return (
    <div className="space-y-6">
      {/* Main organization block */}
      <section className="rounded-lg border bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-500">
              Deine Organisation
            </p>
            <h2 className="text-2xl font-semibold tracking-normal text-zinc-950">
              {organization.name}
            </h2>
          </div>
          <Badge variant={statusVariant(organization.status)} className="mt-1">
            {STATUS_LABELS[organization.status]}
          </Badge>
        </div>

        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-zinc-500">E-Mail</dt>
            <dd className="text-base font-medium text-zinc-950">{email}</dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Rolle</dt>
            <dd className="text-base font-medium text-zinc-950">
              {role === 'owner' ? 'Owner' : 'Mitglied'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Zugang gültig bis</dt>
            <dd className="text-base font-medium text-zinc-950">
              {formatDate(organization.access_until)}
              {daysLabel ? (
                <span className="ml-2 text-sm text-zinc-500">({daysLabel})</span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Mitglied seit</dt>
            <dd className="text-base font-medium text-zinc-950">
              {formatDate(memberSince)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Actions block */}
      <section className="rounded-lg border bg-white p-6">
        <p className="mb-2 text-sm font-medium text-zinc-500">Verwaltung</p>
        <h2 className="text-lg font-semibold tracking-normal text-zinc-950">
          Was möchtest du tun?
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Profilbearbeitung läuft aktuell noch manuell. Wir kümmern uns
          schnellstmöglich um deine Anfrage.
        </p>
        <AccountActions organizationName={organization.name} />
      </section>
    </div>
  )
}
