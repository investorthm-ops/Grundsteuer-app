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
        <AlertTitle>Datenstand 2022</AlertTitle>
        <AlertDescription>
          Hebesätze für Nordrhein-Westfalen und Hessen aus der amtlichen Statistik der Statistischen Ämter des Bundes und der Länder (Berichtsjahr 2022). Die zum 1.1.2025 reformierten Grundsteuer-Hebesätze sind noch nicht enthalten.
        </AlertDescription>
      </Alert>
      <MunicipalityBrowser />
    </AppShell>
  )
}
