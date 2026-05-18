import { AppShell } from '@/components/app-shell'
import { MunicipalityBrowser } from '@/components/municipalities/municipality-browser'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function DatenbankPage() {
  return (
    <AppShell
      eyebrow="PROJ-1"
      title="Hebesatz-Datenbank"
      description="Suche und filtere Gemeinden nach Bundesland, vergleiche aktuelle Hebesätze mit dem Vorjahr und prüfe Datenstand sowie Quellenstatus."
    >
      <Alert className="mb-4 bg-white">
        <AlertTitle>Demo-Daten</AlertTitle>
        <AlertDescription>
          Die aktuell eingepflegten Kommunen dienen zum Testen der Oberfläche. Werte und Quellenstatus sind noch nicht amtlich geprüft.
        </AlertDescription>
      </Alert>
      <MunicipalityBrowser />
    </AppShell>
  )
}
