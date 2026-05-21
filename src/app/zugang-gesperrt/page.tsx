import { AppShell } from '@/components/app-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const REASONS: Record<string, { title: string; text: string }> = {
  no_organization: {
    title: 'Zugang noch nicht freigeschaltet',
    text: 'Dein Nutzer ist noch keiner Kundenorganisation zugeordnet. Bitte wende dich an den Betreiber, damit dein Zugang aktiviert wird.',
  },
  expired: {
    title: 'Zugang abgelaufen',
    text: 'Die Testphase oder Laufzeit fuer deine Organisation ist abgelaufen. Der Zugang kann durch den Betreiber verlaengert werden.',
  },
  blocked: {
    title: 'Zugang gesperrt',
    text: 'Der Zugang deiner Organisation ist aktuell gesperrt. Bitte klaere die Freischaltung mit dem Betreiber.',
  },
}

export default function ZugangGesperrtPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  return (
    <AccessBlockedContent searchParams={searchParams} />
  )
}

async function AccessBlockedContent({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const params = await searchParams
  const reason = params.reason ?? 'no_organization'
  const copy = REASONS[reason] ?? REASONS.no_organization

  return (
    <AppShell
      eyebrow="Zugang"
      title={copy.title}
      description="Der GrundsteuerMonitor ist fuer Pilotkunden und freigeschaltete Organisationen vorgesehen."
    >
      <Alert className="max-w-2xl bg-white">
        <AlertTitle>{copy.title}</AlertTitle>
        <AlertDescription>{copy.text}</AlertDescription>
      </Alert>
    </AppShell>
  )
}
