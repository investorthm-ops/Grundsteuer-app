import { AppShell } from '@/components/app-shell'
import { MunicipalityBrowser } from '@/components/municipalities/municipality-browser'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/reports/format'

type DatenbankPageProps = {
  searchParams: Promise<{ q?: string }>
}

export const dynamic = 'force-dynamic'

async function getDataStand() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('municipalities')
    .select('datenstand, bundesland')
    .not('datenstand', 'is', null)
    .limit(20000)

  if (error || !data || data.length === 0) {
    return null
  }

  const stands = data.map((row) => row.datenstand as string).sort()
  const bundeslaender = Array.from(
    new Set(data.map((row) => row.bundesland as string).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'de'))

  return {
    min: stands[0],
    max: stands[stands.length - 1],
    bundeslaender,
  }
}

function formatBundeslaender(list: string[]) {
  if (list.length === 0) return 'mehreren Bundesländern'
  if (list.length === 1) return list[0]
  return `${list.slice(0, -1).join(', ')} und ${list[list.length - 1]}`
}

export default async function DatenbankPage({ searchParams }: DatenbankPageProps) {
  const { q } = await searchParams
  const initialQuery = typeof q === 'string' ? q : ''
  const stand = await getDataStand()

  const sameStand = stand && stand.min === stand.max
  const standTitle = stand
    ? sameStand
      ? `Datenstand ${formatDate(stand.max)}`
      : `Datenstand ${formatDate(stand.min)} bis ${formatDate(stand.max)}`
    : 'Datenstand'

  return (
    <AppShell
      eyebrow="PROJ-1"
      title="Hebesatz-Datenbank"
      description="Suche und filtere Gemeinden nach Bundesland, vergleiche aktuelle Hebesätze mit dem Vorjahr und prüfe Datenstand sowie Quellenstatus."
    >
      <Alert className="mb-4 bg-white">
        <AlertTitle>{standTitle}</AlertTitle>
        <AlertDescription>
          {stand ? (
            <>
              Hebesätze für {formatBundeslaender(stand.bundeslaender)}.{' '}
              {sameStand
                ? 'Der angezeigte Datenstand gilt für alle Gemeinden.'
                : 'Die Datenstände unterscheiden sich je Gemeinde – der jeweils gültige Stand steht in der Detailansicht und in der Tabelle.'}
            </>
          ) : (
            'Hebesätze mit Datenstand und Quellenstatus je Gemeinde.'
          )}
        </AlertDescription>
      </Alert>
      <MunicipalityBrowser initialQuery={initialQuery} />
    </AppShell>
  )
}
