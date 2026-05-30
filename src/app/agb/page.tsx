import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'AGB | GrundsteuerMonitor',
  description: 'Allgemeine Geschäftsbedingungen des GrundsteuerMonitors.',
}

const sections = [
  {
    title: '§ 1 Geltungsbereich',
    body: [
      'Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen Markus Brand, Einzelunternehmen, Mustermannstr. 1, 58511 Lüdenscheid (nachfolgend „Anbieter") und den Nutzern des GrundsteuerMonitors (nachfolgend „Kunde").',
      'Der GrundsteuerMonitor richtet sich ausschließlich an Unternehmer im Sinne des § 14 BGB. Verbraucher im Sinne des § 13 BGB sind von der Nutzung ausgeschlossen.',
      'Abweichende Bedingungen des Kunden gelten nicht, es sei denn, der Anbieter stimmt ihnen ausdrücklich schriftlich zu.',
    ],
  },
  {
    title: '§ 2 Leistungsgegenstand',
    body: [
      'Der GrundsteuerMonitor ist eine webbasierte Recherche- und Vergleichsanwendung für kommunale Steuerhebesätze in Deutschland (Grundsteuer A, Grundsteuer B, Gewerbesteuer).',
      'Die Anwendung stellt Hebesatzdaten aus öffentlichen Quellen gebündelt, filterbar, vergleichbar und exportierbar bereit. Sie ermöglicht außerdem das Beobachten relevanter Kommunen über eine Watchlist.',
      'Der Anbieter schuldet keinen bestimmten Datenumfang oder eine bestimmte Aktualität der Hebesatzdaten. Die verfügbaren Daten richten sich nach dem jeweils gepflegten Datenbestand und sind mit Datenstand und Quellenstatus gekennzeichnet.',
      'Die Anwendung ersetzt keine Steuerberatung, Rechtsberatung oder verbindliche amtliche Auskunft. Maßgeblich sind stets die Veröffentlichungen der jeweiligen Kommunen und Behörden.',
    ],
  },
  {
    title: '§ 3 Zugang und Freischaltung',
    body: [
      'Der Zugang zur Anwendung erfolgt durch individuellen Login. Eine öffentliche Registrierung ist nicht möglich.',
      'Der Anbieter schaltet Kundenkonten nach individueller Vereinbarung frei. Die Zugriffsdauer richtet sich nach der jeweiligen Vereinbarung.',
      'Zugangsdaten sind vertraulich zu behandeln und dürfen nicht an Dritte weitergegeben werden. Der Kunde haftet für Missbrauch, der aus einer Weitergabe seiner Zugangsdaten entsteht.',
      'Der Anbieter ist berechtigt, Zugänge bei Verdacht auf Missbrauch oder Verletzung dieser AGB vorübergehend zu sperren.',
    ],
  },
  {
    title: '§ 4 Nutzungsrechte',
    body: [
      'Der Anbieter räumt dem Kunden für die Dauer des Vertragsverhältnisses ein einfaches, nicht übertragbares Recht zur Nutzung der Anwendung ein.',
      'Die Anwendung darf nur für eigene interne Zwecke des Kunden genutzt werden. Eine Weitergabe, Sublizenzierung oder gewerbliche Weiterverwendung der bereitgestellten Daten an Dritte ist nicht gestattet, soweit nichts anderes vereinbart wurde.',
      'CSV- und Excel-Exporte dürfen für interne Auswertungen und Mandantengespräche verwendet werden.',
    ],
  },
  {
    title: '§ 5 Pflichten des Kunden',
    body: [
      'Der Kunde verpflichtet sich, die Anwendung nur im Rahmen dieser AGB und der geltenden Gesetze zu nutzen.',
      'Automatisierte Zugriffe, Scraping oder systematische Massenabfragen sind ohne ausdrückliche Zustimmung des Anbieters untersagt.',
      'Der Kunde hat den Anbieter unverzüglich zu informieren, wenn er Kenntnis von einem Missbrauch seiner Zugangsdaten erlangt.',
    ],
  },
  {
    title: '§ 6 Datenbasis und Haftungsbeschränkung',
    body: [
      'Die angezeigten Hebesatzdaten stammen aus öffentlichen Quellen. Der Anbieter übernimmt keine Gewähr für die Richtigkeit, Vollständigkeit oder Aktualität der Daten.',
      'Für Entscheidungen mit rechtlicher oder steuerlicher Relevanz sind stets die amtlichen Veröffentlichungen der jeweiligen Kommunen und Behörden heranzuziehen.',
      'Der Anbieter haftet unbeschränkt nur bei Vorsatz und grober Fahrlässigkeit sowie bei schuldhafter Verletzung von Leben, Körper oder Gesundheit. Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), begrenzt auf den vorhersehbaren, vertragstypischen Schaden.',
      'Eine Haftung für fehlerhafte, veraltete oder fehlende Hebesatzdaten, die zu Vermögensschäden beim Kunden oder dessen Mandanten führen, ist ausgeschlossen, soweit der Anbieter nicht vorsätzlich oder grob fahrlässig gehandelt hat.',
    ],
  },
  {
    title: '§ 7 Verfügbarkeit',
    body: [
      'Der Anbieter strebt eine möglichst hohe Verfügbarkeit der Anwendung an, schuldet jedoch keine bestimmte Verfügbarkeit.',
      'Wartungsarbeiten, technische Störungen und Unterbrechungen durch Dritte (insbesondere Hosting- und Datenbankdienstleister) liegen außerhalb des Verantwortungsbereichs des Anbieters.',
    ],
  },
  {
    title: '§ 8 Entgelt und Zahlung',
    body: [
      'Während der Pilotphase kann der Zugang kostenlos oder zu individuell vereinbarten Konditionen gewährt werden.',
      'Nach Abschluss der Pilotphase werden Preise und Zahlungsmodalitäten individuell vereinbart und gesondert kommuniziert.',
      'Alle Preise verstehen sich, soweit nicht anders angegeben, zuzüglich der gesetzlichen Umsatzsteuer.',
    ],
  },
  {
    title: '§ 9 Vertragslaufzeit und Kündigung',
    body: [
      'Das Vertragsverhältnis beginnt mit der Freischaltung des Zugangs durch den Anbieter.',
      'Während der Pilotphase kann das Vertragsverhältnis von beiden Seiten jederzeit ohne Einhaltung einer Frist beendet werden.',
      'Nach Übergang in ein reguläres Abomodell gelten die im jeweiligen Vertrag vereinbarten Kündigungsfristen.',
      'Der Anbieter behält sich das Recht vor, den Dienst einzustellen. In diesem Fall werden aktive Kunden mit angemessener Vorlaufzeit informiert.',
    ],
  },
  {
    title: '§ 10 Datenschutz',
    body: [
      'Die Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutzerklärung des Anbieters, abrufbar unter /datenschutz.',
      'Soweit der Anbieter im Auftrag des Kunden personenbezogene Daten verarbeitet, wird auf Wunsch ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO geschlossen.',
    ],
  },
  {
    title: '§ 11 Änderungen dieser AGB',
    body: [
      'Der Anbieter behält sich vor, diese AGB mit angemessener Vorlaufzeit zu ändern. Kunden werden über wesentliche Änderungen per E-Mail informiert.',
      'Widerspricht der Kunde einer Änderung nicht innerhalb von vier Wochen nach Zugang der Mitteilung, gelten die geänderten AGB als angenommen.',
    ],
  },
  {
    title: '§ 12 Schlussbestimmungen',
    body: [
      'Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.',
      'Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag ist, soweit gesetzlich zulässig, der Sitz des Anbieters.',
      'Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.',
    ],
  },
  {
    title: 'Stand',
    body: ['Stand: Mai 2026.'],
  },
]

export default function AgbPage() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" className="-ml-3 mb-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Zurück
            </Link>
          </Button>
          <p className="text-sm font-medium text-zinc-500">Rechtliches</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Allgemeine Geschäftsbedingungen
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600">
            AGB für die Nutzung des GrundsteuerMonitors. Der Dienst richtet sich ausschließlich
            an Unternehmer im Sinne des § 14 BGB.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-lg border bg-white p-5">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-6 text-zinc-600">
                {section.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
