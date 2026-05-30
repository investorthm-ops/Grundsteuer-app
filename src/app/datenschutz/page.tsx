import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Datenschutz | GrundsteuerMonitor',
  description: 'Datenschutzhinweise für den GrundsteuerMonitor.',
}

const sections = [
  {
    title: '1. Datenschutz auf einen Blick',
    body: [
      'Der GrundsteuerMonitor verarbeitet personenbezogene Daten nur, soweit dies für Betrieb, Login, Nutzerverwaltung, Zugriffsschutz und Sicherheit der Anwendung erforderlich ist.',
      'Die fachlichen Hebesatzdaten stammen aus öffentlichen Quellen und beziehen sich in der Regel auf Gemeinden, nicht auf einzelne Personen.',
      'Die Anwendung wird als Browser-App bereitgestellt. Es ist keine lokale Installation, keine ClickOnce-Anwendung, kein .NET Framework und kein SSH-Zugang für Nutzer erforderlich.',
      'Für Hosting und Auslieferung wird Vercel eingesetzt. Für Datenbank, Authentifizierung und Rollenverwaltung wird Supabase eingesetzt.',
      'Nutzer haben nach Maßgabe der DSGVO Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit, Widerspruch und Beschwerde bei einer Aufsichtsbehörde.',
    ],
  },
  {
    title: '2. Allgemeine Hinweise',
    body: [
      'Diese Datenschutzerklärung informiert über die Verarbeitung personenbezogener Daten bei Nutzung des GrundsteuerMonitors.',
      'Die Anwendung dient der Recherche, dem Vergleich und dem Monitoring öffentlicher kommunaler Hebesatzdaten. Personenbezogene Daten werden nur verarbeitet, soweit dies für Nutzerkonto, Login, Zugriffskontrolle, Betrieb und Sicherheit der Anwendung erforderlich ist.',
      'Die Datenübertragung im Internet kann Sicherheitslücken aufweisen. Ein lückenloser Schutz ist technisch nicht möglich.',
    ],
  },
  {
    title: '3. Verantwortlicher',
    body: [
      'Verantwortlich für die Datenverarbeitung im Sinne der DSGVO ist:',
      'Markus Brand, Mustermannstr. 1, 58511 Lüdenscheid, E-Mail: investorthm@gmail.com',
      'Datenschutzanfragen können per E-Mail an die oben genannte Adresse gerichtet werden.',
    ],
  },
  {
    title: '4. Hosting und Betrieb',
    body: [
      'Die Anwendung wird über Vercel (Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, USA) gehostet. Beim Aufruf der Webseite können technische Zugriffsdaten verarbeitet werden, zum Beispiel IP-Adresse, Datum und Uhrzeit des Zugriffs, Browserinformationen, Betriebssystem, Referrer-URL und aufgerufene Seiten.',
      'Diese Daten werden verarbeitet, um die Webseite auszuliefern, den Betrieb sicherzustellen, Fehler zu analysieren und Missbrauch zu verhindern.',
      'Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt im sicheren und stabilen Betrieb der Anwendung.',
      'Mit Vercel besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO. Vercel setzt Standardvertragsklauseln als Grundlage für Drittlandtransfers in die USA ein.',
    ],
  },
  {
    title: '5. Authentifizierung und Datenbank',
    body: [
      'Für Login, Nutzerverwaltung und Datenbank wird Supabase (Supabase Inc., 970 Toa Payoh North, Singapur) eingesetzt. Das Datenbankprojekt läuft in der Region eu-central-1 (Frankfurt, Deutschland). Dabei können insbesondere E-Mail-Adresse, Nutzer-ID, Login-Zeitpunkte, Session-Informationen, Rollen und Organisationszuordnungen verarbeitet werden.',
      'Diese Daten sind erforderlich, um Nutzerkonten bereitzustellen, Zugriffe zu steuern und geschützte Funktionen nur freigeschalteten Nutzern zugänglich zu machen.',
      'Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit die Verarbeitung zur Bereitstellung des Nutzerzugangs erforderlich ist. Ergänzend kommt Art. 6 Abs. 1 lit. f DSGVO für Sicherheit, Missbrauchsschutz und technische Administration in Betracht.',
      'Mit Supabase besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO.',
    ],
  },
  {
    title: '6. Nutzerkonto und Kundenzuordnung',
    body: [
      'Der GrundsteuerMonitor verarbeitet Nutzerkonten und Organisationszuordnungen, damit einzelne Nutzer einer Kanzlei, einem Unternehmen oder einem Pilotkunden zugeordnet werden können.',
      'Verarbeitet werden können E-Mail-Adresse, Supabase-Nutzer-ID, Organisation, Rolle, Status, Zugriffslaufzeit und interne Notizen zur Kundenverwaltung.',
      'Diese Daten werden gelöscht oder anonymisiert, sobald sie für den jeweiligen Zweck nicht mehr erforderlich sind, sofern keine gesetzlichen Aufbewahrungspflichten oder berechtigten Interessen entgegenstehen.',
    ],
  },
  {
    title: '7. Fachliche Hebesatzdaten',
    body: [
      'Die inhaltlichen Hebesatzdaten stammen aus öffentlichen Quellen, zum Beispiel amtlichen Statistiken, kommunalen Satzungen oder Veröffentlichungen von Behörden.',
      'Diese Daten beziehen sich in der Regel auf Gemeinden und nicht auf einzelne Personen.',
      'Die Angaben dienen der Recherche. Maßgeblich sind die amtlichen Veröffentlichungen der jeweiligen Kommune oder Behörde.',
    ],
  },
  {
    title: '8. Cookies und Sessions',
    body: [
      'Die Anwendung kann technisch erforderliche Cookies oder vergleichbare Speichertechniken verwenden, insbesondere für Login-Sessions und Zugriffsschutz.',
      'Diese technisch erforderlichen Cookies sind notwendig, damit angemeldete Nutzer geschützte Bereiche der Anwendung verwenden können.',
      'Soweit Cookies oder vergleichbare Technologien für die Bereitstellung der Anwendung technisch erforderlich sind, erfolgt der Einsatz auf Grundlage der gesetzlichen Regelungen der DSGVO und des TDDDG.',
      'Marketing- oder Tracking-Cookies werden im aktuellen MVP nicht eingesetzt. Falls später Analyse- oder Marketingdienste ergänzt werden, wird diese Datenschutzerklärung angepasst und, soweit erforderlich, eine Einwilligung eingeholt.',
    ],
  },
  {
    title: '9. Kontakt per E-Mail',
    body: [
      'Wenn Nutzer per E-Mail Kontakt aufnehmen, werden die übermittelten Angaben zur Bearbeitung der Anfrage verarbeitet.',
      'Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit die Anfrage mit einem Vertrag oder vorvertraglichen Maßnahmen zusammenhängt. In allen anderen Fällen ist Art. 6 Abs. 1 lit. f DSGVO Grundlage der Verarbeitung.',
      'Die Daten werden gelöscht, sobald die Anfrage erledigt ist und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.',
    ],
  },
  {
    title: '10. Empfänger und Dienstleister',
    body: [
      'Personenbezogene Daten können durch technische Dienstleister verarbeitet werden, insbesondere Hosting-, Datenbank- und Authentifizierungsanbieter.',
      'Mit eingesetzten Auftragsverarbeitern sind Auftragsverarbeitungsverträge nach Art. 28 DSGVO zu berücksichtigen.',
      'Eine Weitergabe an Dritte erfolgt nur, wenn dies für den Betrieb erforderlich ist, eine gesetzliche Pflicht besteht oder eine Einwilligung vorliegt.',
    ],
  },
  {
    title: '11. Drittlandtransfer',
    body: [
      'Vercel hat seinen Sitz in den USA. Für den Drittlandtransfer setzt Vercel Standardvertragsklauseln gemäß Art. 46 Abs. 2 lit. c DSGVO ein.',
      'Die Datenbankdaten werden in der Supabase-Region eu-central-1 (Frankfurt) gespeichert und verlassen die EU grundsätzlich nicht. Supabase Inc. hat seinen Sitz in Singapur; für etwaige Drittlandtransfers bestehen Standardvertragsklauseln.',
    ],
  },
  {
    title: '12. Speicherdauer',
    body: [
      'Personenbezogene Daten werden nur so lange gespeichert, wie es für den jeweiligen Zweck erforderlich ist.',
      'Nutzerkonten und Organisationszuordnungen werden gelöscht, wenn der Zugang dauerhaft beendet ist und keine gesetzlichen Pflichten oder berechtigten Interessen entgegenstehen.',
      'Technische Logdaten werden nur so lange gespeichert, wie es für Sicherheit, Fehleranalyse und Betrieb erforderlich ist.',
    ],
  },
  {
    title: '13. Rechte betroffener Personen',
    body: [
      'Betroffene Personen haben nach Maßgabe der DSGVO Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch.',
      'Soweit eine Verarbeitung auf Einwilligung beruht, kann diese Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen werden.',
      'Betroffene Personen haben zudem das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren.',
    ],
  },
  {
    title: '14. Keine Steuer- oder Rechtsberatung',
    body: [
      'Der GrundsteuerMonitor bietet keine Steuerberatung, Rechtsberatung oder verbindliche amtliche Auskunft.',
      'Die angezeigten Daten können Fehler enthalten oder veraltet sein. Eine Prüfung der amtlichen Quelle bleibt erforderlich.',
    ],
  },
  {
    title: '15. Stand',
    body: ['Stand: Mai 2026. Diese Datenschutzerklärung wird bei wesentlichen Änderungen der Verarbeitungen aktualisiert.'],
  },
]

export default function DatenschutzPage() {
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
          <p className="text-sm font-medium text-zinc-500">Rechtliche Hinweise</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Datenschutzerklärung</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600">
            Informationen zur Verarbeitung personenbezogener Daten gemäß Art. 13, 14 DSGVO.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-lg border bg-white p-5">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-6 text-zinc-600">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
