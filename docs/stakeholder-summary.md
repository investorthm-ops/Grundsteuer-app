# Stakeholder-Zusammenfassung

## Kurzfassung

Der Grundsteuer-Monitor ist eine Webplattform fuer kommunale Hebesaetze in Deutschland. Die Anwendung sammelt Hebesaetze fuer Grundsteuer A, Grundsteuer B und Gewerbesteuer, macht sie durchsuchbar, vergleichbar und exportierbar.

Die Daten sind oeffentlich, liegen aber oft verstreut vor: Amtsblaetter, kommunale Webseiten, Statistikportale, PDFs und Satzungen. Der Grundsteuer-Monitor macht daraus eine strukturierte Arbeitsdatenbank fuer Recherche, Vergleich und Monitoring.

## Was die Webseite macht

Die Webseite hilft Nutzern dabei:

- Gemeinden nach Hebesaetzen zu suchen
- Hebesaetze zwischen Gemeinden zu vergleichen
- Daten als CSV oder Excel-Grundlage zu exportieren
- relevante Gemeinden auf eine Watchlist zu setzen
- Datenstand und Quelle je Gemeinde zu pruefen
- Auswirkungen von Hebesatzaenderungen grob zu berechnen
- differenzierte Grundsteuer-B-Werte fuer Wohnen und Nichtwohnen abzubilden

## Problem

Hebesatzdaten sind zwar oeffentlich, aber schwer praktisch zu verwenden.

Ein Steuerberater, Investor oder Unternehmer muss heute oft manuell pruefen:

- Welche Gemeinde hat welchen Hebesatz?
- Hat sich der Wert geaendert?
- Gilt der Wert fuer 2022, 2025 oder 2026?
- Ist die Quelle belastbar?
- Lassen sich mehrere Standorte vergleichen?
- Koennen die Daten in Excel weiterverarbeitet werden?

Diese Arbeit kostet Zeit und ist fehleranfaellig.

## Loesung

Der Grundsteuer-Monitor fuehrt diese Informationen in einer Webanwendung zusammen. Nutzer erhalten nicht nur einzelne Werte, sondern eine Arbeitsoberflaeche fuer Suche, Vergleich, Export, Watchlist und Quellenpruefung.

## USP

Der einzelne Hebesatz ist nicht der USP. Der einzelne Hebesatz ist oeffentlich.

Der USP ist:

> Oeffentliche, verstreute Hebesatzdaten werden zu einer vergleichbaren und exportierbaren Arbeitsdatenbank mit Quellen- und Datenstandshinweisen.

Oder kuerzer:

> Der Grundsteuer-Monitor macht aus verstreuten Steuerdaten ein Recherche-, Vergleichs- und Monitoring-Tool.

## Geschaeftsmodell

Das Geschaeftsmodell richtet sich an Zielgruppen, die regelmaessig mit Standort- und Steuerdaten arbeiten:

- Steuerberater und Kanzleien
- Immobilieninvestoren
- Bestandshalter
- Gewerbetreibende
- Kommunen
- Beratungen

Moegliche Erloesmodelle:

- monatliches Abo fuer Kanzleien oder Unternehmen
- Team- oder Mandantenpakete
- Export- und Report-Funktionen als Pro-Funktion
- Watchlist und Aenderungshinweise als Premium-Funktion
- individuelle Datenrecherche oder Beratungsreports
- Lizenzmodell fuer groessere Kunden

## Warum Kunden zahlen koennten

Ein Steuerberater zahlt nicht fuer eine einzelne Zahl. Er zahlt fuer schnellere Recherche, bessere Vergleichbarkeit und eine belastbarere Grundlage fuer Mandantengespraeche.

Ein Investor zahlt nicht fuer einen isolierten Hebesatz. Er zahlt dafuer, Standorte und Portfolios schneller auf Veraenderungen der Steuerbelastung zu pruefen.

## Stakeholder-Satz

> Der Grundsteuer-Monitor verwandelt verstreute kommunale Steuerdaten in ein Recherche-, Vergleichs- und Monitoring-Tool fuer Steuerberater, Investoren und Unternehmen.

## Aktueller MVP-Stand

Der MVP zeigt bereits:

- Datenbank fuer Nordrhein-Westfalen und Hessen
- Suche und Filter
- Vergleichsansicht
- Watchlist
- CSV-Export
- Quellen- und Datenstandsanzeige
- Rechner fuer Auswirkungen
- Nutzer- und Kundenzugriff
- erste Unterstuetzung fuer differenzierte Grundsteuer B ab 2025

## Wichtiger Hinweis zu Datenqualitaet, Haftung und Garantie

Der Grundsteuer-Monitor ist eine Recherche- und Vergleichsanwendung. Die angezeigten Hebesaetze werden mit Sorgfalt aus oeffentlichen Quellen uebernommen und dokumentiert. Trotzdem koennen Fehler, veraltete Werte, Uebertragungsfehler, Quellenkonflikte oder fehlende Aktualisierungen vorkommen.

Die Angaben dienen der Orientierung und ersetzen keine Pruefung der amtlichen Quelle. Massgeblich sind immer die offiziellen Veroeffentlichungen der jeweiligen Kommune, Behoerde oder des zustaendigen Statistikamts.

Es wird keine Garantie fuer Richtigkeit, Vollstaendigkeit, Aktualitaet oder Eignung der Daten fuer einen bestimmten Zweck uebernommen. Eine Haftung fuer Entscheidungen, Auswertungen oder wirtschaftliche Folgen auf Basis der angezeigten Daten wird, soweit gesetzlich zulaessig, ausgeschlossen. Ausgenommen bleiben Faelle, in denen eine Haftung gesetzlich zwingend vorgeschrieben ist.

Der Grundsteuer-Monitor bietet keine Steuerberatung, Rechtsberatung oder verbindliche amtliche Auskunft.

## Datenschutz und DSGVO

Der GrundsteuerMonitor verarbeitet nur die fuer Login, Nutzerverwaltung und Zugriffskontrolle erforderlichen personenbezogenen Daten. Die fachlichen Hebesatzdaten stammen aus oeffentlichen Quellen. Hosting und Datenbank werden mit Blick auf DSGVO-Anforderungen wie EU- bzw. Deutschland-Serverstandort, Auftragsverarbeitung und Zugriffsschutz ausgewaehlt.

Eine pauschale Aussage wie "DSGVO-konform, weil der Server in Deutschland steht" sollte vermieden werden. Der Serverstandort ist ein wichtiger Punkt, reicht allein aber nicht aus. Ergaenzend sind unter anderem Datenschutzerklaerung, Auftragsverarbeitungsvertraege, Zugriffsschutz, Loeschprozesse und moegliche Drittlandtransfers zu pruefen.

Weitere Details stehen in [`docs/privacy-dsgvo-notes.md`](privacy-dsgvo-notes.md).

## Empfohlener kurzer Hinweis in der App

> Die Daten dienen der Recherche und koennen Fehler enthalten. Massgeblich sind die amtlichen Veroeffentlichungen der jeweiligen Kommune oder Behoerde. Es wird keine Garantie fuer Richtigkeit, Vollstaendigkeit oder Aktualitaet uebernommen.

## Rechtliche Einordnung

Ein Disclaimer sollte keine juristische Pruefung ersetzen. Die IHK Duesseldorf weist darauf hin, dass ein Disclaimer nicht pauschal jede Haftung ausschliessen kann. Er kann aber klarstellen, wie die Daten zu verstehen sind. Vergleichbare Hinweise finden sich auch bei oeffentlichen Stellen, die trotz sorgfaeltiger Erstellung keine Gewaehr fuer Fehlerfreiheit und Genauigkeit der Informationen uebernehmen.

Quellen:

- IHK Duesseldorf, Checkliste fuer eine rechtssichere Webseite: https://www.ihk.de/duesseldorf/recht-und-steuern/recht/merkblaetter-von-a-bis-z/website-checkliste-fuer-eine-rechtssichere-webseite-5866022
- Ministerium der Justiz Brandenburg, Rechtliche Hinweise: https://mdjd.brandenburg.de/mdjd/de/service/rechtliche-hinweise/
