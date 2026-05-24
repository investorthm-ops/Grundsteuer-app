# Datenschutz- und DSGVO-Notizen

## Grundsatz

Der GrundsteuerMonitor sollte nicht pauschal mit dem Satz beworben werden:

> Die Seite ist DSGVO-konform, weil der Server in Deutschland steht.

Der Serverstandort ist wichtig, reicht allein aber nicht aus. DSGVO-Konformitaet haengt auch von Zweckbindung, Datenminimierung, Zugriffsschutz, Auftragsverarbeitung, Datenschutzerklaerung, Betroffenenrechten, Loeschprozessen und moeglichen Drittlandtransfers ab.

## Saubere Stakeholder-Formulierung

Der GrundsteuerMonitor verarbeitet nur die fuer Login, Nutzerverwaltung und Zugriffskontrolle erforderlichen personenbezogenen Daten. Die fachlichen Hebesatzdaten stammen aus oeffentlichen Quellen. Hosting und Datenbank werden mit Blick auf DSGVO-Anforderungen wie EU- bzw. Deutschland-Serverstandort, Auftragsverarbeitung und Zugriffsschutz ausgewaehlt.

Weitere Informationen muessen in einer Datenschutzerklaerung bereitgestellt werden.

## Ausfuehrlichere Formulierung

Die Anwendung wird mit Blick auf die Anforderungen der DSGVO betrieben. Personenbezogene Daten werden nur verarbeitet, soweit dies fuer Nutzerkonto, Login, Zugriffskontrolle und Betrieb der Anwendung erforderlich ist. Die Datenverarbeitung soll auf Servern innerhalb der EU bzw. in Deutschland erfolgen, soweit dies durch die eingesetzten Dienstleister bereitgestellt wird.

Fuer eingesetzte Dienstleister sind Auftragsverarbeitungsvertraege nach Art. 28 DSGVO zu beruecksichtigen. Die Anwendung verarbeitet keine Zahlungsdaten und keine besonderen Kategorien personenbezogener Daten. Nutzer koennen Auskunft, Berichtigung oder Loeschung ihrer personenbezogenen Daten anfragen.

Die vollstaendigen Informationen zur Datenverarbeitung werden in der Datenschutzerklaerung bereitgestellt.

## Aktueller MVP-Datenumfang

Personenbezogene Daten im MVP:

- E-Mail-Adresse des Nutzers
- Supabase-Nutzer-ID
- Organisations- bzw. Kundenzuordnung
- Rolle innerhalb der Organisation
- Status und Zugriffslaufzeit
- technische Login- und Zugriffsdaten durch die eingesetzten Dienste

Keine fachlich sensiblen Personendaten im Kernprodukt:

- Die Hebesatzdaten sind oeffentliche kommunale Daten.
- Es werden im MVP keine Zahlungsdaten verarbeitet.
- Es werden im MVP keine besonderen Kategorien personenbezogener Daten verarbeitet.

## Vor oeffentlicher Aussage zu DSGVO pruefen

Vor einer oeffentlichen Aussage wie "DSGVO-konform betrieben" sollten diese Punkte geprueft und dokumentiert werden:

- Hosting-Region von Vercel
- Datenbank-Region von Supabase
- Auftragsverarbeitungsvertrag mit Vercel
- Auftragsverarbeitungsvertrag mit Supabase
- Datenschutzerklaerung auf der Webseite
- Impressum auf der Webseite
- Cookie- und Tracking-Situation
- Loeschprozess fuer Nutzerkonten
- Auskunftsprozess fuer Nutzeranfragen
- Backup- und Zugriffsschutz
- Umgang mit Logdaten
- moegliche Drittlandtransfers und passende Garantien

Die operative Checkliste steht in [`docs/legal-checklist.md`](legal-checklist.md).

## Interner Ablauf fuer Nutzerrechte im MVP

Bis eine automatisierte Loesung existiert, reicht fuer den MVP ein manueller Prozess:

1. Nutzer stellt Anfrage per E-Mail.
2. Markus prueft Identitaet und betroffenes Nutzerkonto.
3. Markus exportiert, berichtigt oder loescht die relevanten Daten in Supabase Auth und in der Organisationsverwaltung.
4. Markus dokumentiert Datum, Anfrageart und Erledigung intern.
5. Markus informiert den Nutzer ueber das Ergebnis.

Betroffen sind vor allem:

- E-Mail-Adresse
- Supabase-Nutzer-ID
- Organisationszuordnung
- Rolle
- Zugriffslaufzeit
- technische Login- und Zugriffsdaten, soweit ueber Supabase oder Vercel verfuegbar

## Empfohlener kurzer Hinweis fuer Webseite oder Pitch

> Datenschutz: Der GrundsteuerMonitor verarbeitet nur die fuer Login, Nutzerverwaltung und Zugriffskontrolle erforderlichen personenbezogenen Daten. Die fachlichen Hebesatzdaten stammen aus oeffentlichen Quellen. Hosting und Datenbank werden mit Blick auf DSGVO-Anforderungen wie EU- bzw. Deutschland-Serverstandort, Auftragsverarbeitung und Zugriffsschutz ausgewaehlt.

## Uebernommene Bausteine aus Referenz-Datenschutzerklaerung

Die Datenschutzerklaerung des GrundsteuerMonitors uebernimmt bewusst nur die Bausteine, die zum tatsaechlichen MVP passen:

- Datenschutz auf einen Blick
- Verantwortliche Stelle
- externes Hosting
- Auftragsverarbeitung mit technischen Dienstleistern
- SSL/TLS bzw. HTTPS
- technisch erforderliche Cookies und Sessions
- Kontakt per E-Mail
- Registrierung, Nutzerkonto und Rollenverwaltung
- Speicherdauer
- Rechte betroffener Personen
- Beschwerderecht bei einer Aufsichtsbehoerde

Nicht aufgenommen werden aktuell:

- YouTube, solange keine Videos eingebettet werden
- ManageWP, weil keine WordPress-Verwaltung eingesetzt wird
- Borlabs Cookie, solange kein Borlabs Consent Tool genutzt wird
- Cloudflare, solange Cloudflare nicht bewusst als eigener Dienst vorgeschaltet wird
- Zahlungsverkehr und eCommerce, solange kein Billing integriert ist
- Hostinger, weil das Projekt auf Vercel und Supabase ausgelegt ist

Hinweis: Fuer Cookie- und Zugriffstechnologien wird nicht mehr auf TTDSG verwiesen, sondern auf TDDDG.

## Rechtliche Einordnung

Diese Notiz ist eine Arbeitsgrundlage und ersetzt keine rechtliche Pruefung. Vor zahlenden Kunden oder einer breiteren Veroeffentlichung sollten Datenschutzerklaerung, Impressum, Auftragsverarbeitung und Hosting-Region final geprueft werden.

Quellen:

- DSGVO Art. 28, Auftragsverarbeiter: https://dsgvo-gesetz.de/art-28-dsgvo/
- BfDI, internationaler Datentransfer: https://www.bfdi.bund.de/DE/Fachthemen/Inhalte/Europa-Internationales/Internationaler-Datentransfer.html
- EU-Kommission, Standardvertragsklauseln: https://commission.europa.eu/publications/publications-standard-contractual-clauses-sccs_de
