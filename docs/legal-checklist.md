# Legal-Checkliste fuer GrundsteuerMonitor

Diese Checkliste sammelt die offenen Angaben fuer Datenschutz, DSGVO, Impressum und Haftung. Sie ist eine Arbeitsgrundlage und ersetzt keine Rechtsberatung.

## 1. Betreiber und Impressum

Diese Angaben kommen von Markus bzw. aus den eigenen Unternehmensdaten.

| Punkt | Status | Woher kommt die Information | Notiz |
|-------|--------|-----------------------------|-------|
| Vollstaendiger Name oder Firmenname | Offen | eigene Stammdaten |  |
| Anschrift | Offen | eigene Stammdaten |  |
| E-Mail-Adresse fuer Kontakt | Offen | eigene Stammdaten |  |
| Telefonnummer | Offen | eigene Stammdaten | optional, aber oft sinnvoll |
| Umsatzsteuer-ID | Offen | eigene Stammdaten / Finanzamt | nur falls vorhanden |
| Vertretungsberechtigter | Offen | eigene Stammdaten | relevant bei Firma |
| Verantwortlicher nach Medienrecht | Offen | eigene Pruefung | nur falls journalistisch-redaktionelle Inhalte vorliegen |

Naechster Schritt:

- Echte Betreiberangaben in `/impressum` eintragen.
- Vorlage in `docs/impressum-template.md` mit den echten Angaben finalisieren.
- Footer-Link auf `/impressum` ist bereits vorhanden.

## 2. Vercel

Diese Angaben kommen aus dem Vercel Dashboard und aus den Vercel-Rechtsdokumenten.

| Punkt | Status | Wo pruefen | Notiz |
|-------|--------|------------|-------|
| Vercel Plan | Offen | Vercel Dashboard, Team/Account Settings | Hobby, Pro oder Enterprise |
| DPA / AV-Vertrag verfuegbar | Offen | Vercel Account oder https://vercel.com/legal/dpa | Laut Vercel fuer Pro und Enterprise relevant |
| Hosting-/Function-Region | Offen | Projekt Settings, Functions/Regions | pruefen, ob Region steuerbar ist |
| Web Analytics aktiv | Offen | Projekt Settings, Analytics | falls aktiv, in Datenschutzerklaerung ergaenzen |
| Speed Insights aktiv | Offen | Projekt Settings, Speed Insights | falls aktiv, in Datenschutzerklaerung ergaenzen |
| Log-Speicherdauer | Offen | Vercel Docs / Projekt Settings | Vercel dokumentiert begrenzte Log-Aufbewahrung |
| Subprocessor-Liste | Offen | Vercel Legal / Trust / DPA | fuer DSGVO-Dokumentation ablegen |

Naechster Schritt:

- Vercel Dashboard oeffnen.
- Plan, Analytics, Speed Insights und DPA-Status dokumentieren.
- Ergebnis in `docs/privacy-dsgvo-notes.md` nachtragen.

## 3. Supabase

Diese Angaben kommen aus dem Supabase Dashboard und aus Supabase-Dokumenten.

| Punkt | Status | Wo pruefen | Notiz |
|-------|--------|------------|-------|
| Projektregion | Offen | Supabase Dashboard, Project Settings, General | ideal: EU/Frankfurt |
| DPA / AV-Vertrag verfuegbar | Offen | Supabase Organization, Documents/Legal | im Account pruefen |
| Auth-Einstellungen | Offen | Supabase Dashboard, Authentication | E-Mail-Login, Redirect URLs, Confirmations |
| E-Mail-Provider fuer Auth-Mails | Offen | Supabase Authentication, SMTP Settings | Supabase Default oder eigener SMTP |
| Backup-Einstellungen | Offen | Supabase Dashboard, Database/Backups | Plan-abhaengig |
| Log-Speicherdauer | Offen | Supabase Dashboard, Logs | fuer Datenschutzerklaerung dokumentieren |
| RLS aktiv | Erledigt | Supabase Migrations / Code Review | Row Level Security ist im Projekt angelegt |

Naechster Schritt:

- Supabase Dashboard oeffnen.
- Projektregion und DPA-Status dokumentieren.
- Auth- und E-Mail-Einstellungen pruefen.

## 4. App-Funktionen und personenbezogene Daten

| Punkt | Status | Wo pruefen | Notiz |
|-------|--------|------------|-------|
| E-Mail-Adresse fuer Login | Erledigt | Supabase Auth | wird verarbeitet |
| Supabase Nutzer-ID | Erledigt | Supabase Auth / App Admin | wird verarbeitet |
| Organisationszuordnung | Erledigt | App Admin Kunden | wird verarbeitet |
| Rollen und Zugriffslaufzeit | Erledigt | App Admin Kunden | wird verarbeitet |
| Zahlungsdaten | Nicht genutzt | App / Code | aktuell keine Zahlungsdaten |
| Besondere Kategorien personenbezogener Daten | Nicht genutzt | App / Code | aktuell nicht vorgesehen |
| Kontaktformular | Nicht genutzt | App / Code | aktuell nicht vorhanden |
| Bewerbungsformular | Nicht genutzt | App / Code | nicht vorhanden |
| Google Maps | Nicht genutzt | App / Code | nicht vorhanden |
| Google reCAPTCHA | Nicht genutzt | App / Code | nicht vorhanden |
| Google Tag Manager | Nicht genutzt | App / Code | nicht vorhanden |
| Marketing-Tracking | Offen | Vercel Analytics / Code pruefen | aktuell nicht im Code erkennbar |

Naechster Schritt:

- Tracking- und Analytics-Status final im Vercel Dashboard pruefen.
- Falls keine Tools aktiv sind, Datenschutzerklaerung entsprechend schlank lassen.

## 5. Datenschutzseiten in der App

| Punkt | Status | Datei / Route | Notiz |
|-------|--------|---------------|-------|
| Datenschutzerklaerung | Erledigt als MVP-Fassung | `/datenschutz` | Verantwortlicher und Dienstleisterdetails noch ergaenzen |
| Haftungshinweis / Disclaimer | Erledigt | `src/components/site-disclaimer.tsx` | sichtbar in App und Stadtseiten |
| Impressum | Offen, Vorlage gesichert | `/impressum`, `docs/impressum-template.md` | Seite und Template existieren, enthalten aber noch Platzhalter |
| Footer-Link Datenschutz | Erledigt | `src/components/legal-footer.tsx` | vorhanden |
| Footer-Link Impressum | Erledigt | `src/components/legal-footer.tsx` | vorhanden |
| Footer-Link Hinweise | Erledigt | `src/components/legal-footer.tsx` | vorhanden |

## 6. Prozesse fuer Nutzerrechte

Diese Prozesse muessen nicht technisch perfekt automatisiert sein. Fuer den MVP reicht ein klarer manueller Ablauf.

| Prozess | Status | Vorschlag |
|---------|--------|-----------|
| Auskunftsanfrage | Offen | Nutzer schreibt E-Mail. Markus exportiert relevante Supabase-Auth- und Organisationsdaten. |
| Berichtigung | Offen | Nutzer schreibt E-Mail. Markus korrigiert E-Mail, Organisation oder Rolle. |
| Loeschung | Offen | Nutzer schreibt E-Mail. Markus loescht Auth-User und Organisationszuordnung, soweit keine Gruende entgegenstehen. |
| Widerruf Einwilligung | Offen | aktuell kaum relevant, solange keine optionalen Tracking-Einwilligungen genutzt werden |
| Widerspruch gegen Verarbeitung | Offen | Einzelfall pruefen und dokumentieren |

Naechster Schritt:

- Einen kurzen internen Ablauf in `docs/privacy-dsgvo-notes.md` ergaenzen.

## 7. Haftung und Datenqualitaet

| Punkt | Status | Datei / Ort | Notiz |
|-------|--------|-------------|-------|
| Hinweis auf Recherchecharakter | Erledigt | App Disclaimer / Export | vorhanden |
| Keine Garantie fuer Richtigkeit | Erledigt | App Disclaimer / Export | vorhanden |
| Keine Steuerberatung | Erledigt | App Disclaimer / Datenschutz | vorhanden |
| Datenstand sichtbar | Erledigt | Datenbank / Stadtseiten / Export | vorhanden |
| Quellenstatus sichtbar | Erledigt | Datenbank / Stadtseiten / Export | vorhanden |

## 8. Offene Punkte vor zahlenden Kunden

- Impressum erstellen.
- Verantwortlichen in Datenschutzerklaerung eintragen.
- Vercel Plan und DPA klaeren.
- Supabase Region und DPA klaeren.
- Vercel Analytics und Speed Insights pruefen.
- Supabase Auth-Mail-Provider pruefen.
- Loesch- und Auskunftsprozess dokumentieren.
- Datenschutzerklaerung nach Pruefung aktualisieren.
- Optional: rechtliche Pruefung durch Anwalt oder Datenschutzberater.

## Quellen

- DSGVO Art. 13, Informationspflichten: https://dsgvo-gesetz.de/art-13-dsgvo/
- DSGVO Art. 28, Auftragsverarbeiter: https://dsgvo-gesetz.de/art-28-dsgvo/
- Vercel DPA: https://vercel.com/legal/dpa
- Vercel Logs: https://vercel.com/docs/logs
- Supabase Regionen: https://supabase.com/docs/guides/platform/regions
- Supabase Region aendern: https://supabase.com/docs/guides/troubleshooting/change-project-region-eWJo5Z
- IHK Koblenz, Impressum nach DDG: https://www.ihk.de/koblenz/unternehmensservice/recht/rechtsauskuenfte-von-a-z/it-recht/merkblatt-impressum-3462798
