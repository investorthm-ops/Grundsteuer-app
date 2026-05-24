# Technische Voraussetzungen und Betriebsmodell

Diese Notiz beschreibt die technischen Rahmenbedingungen fuer den GrundsteuerMonitor. Sie kann fuer Stakeholder-Gespraeche, Pilotkunden, Angebotsunterlagen oder eine spaetere Webseite verwendet werden.

## Kurzpositionierung

Der GrundsteuerMonitor ist als moderne Browser-Anwendung aufgebaut. Kunden muessen keine lokale Desktop-Software installieren und benoetigen keine zusaetzlichen Laufzeitumgebungen wie .NET oder Java.

Die Anwendung wird ueber eine gesicherte Webadresse im Browser genutzt. Hosting, Deployment und Serverbetrieb werden ueber Managed-Cloud-Anbieter abgebildet.

## Zugang

Der Zugang erfolgt ueber den Browser.

Eine lokale Installation auf dem Rechner des Kunden ist fuer den Standardbetrieb nicht erforderlich. Nutzer oeffnen die Anwendung ueber eine Webadresse und melden sich mit bereitgestellten Login-Daten an.

Eine spaetere Intranet- oder On-Premise-Variante ist nicht Teil des aktuellen MVP, kann aber bei Bedarf als Enterprise-Option gesondert bewertet werden.

## Betriebssysteme

Unterstuetzt werden moderne Desktop-Betriebssysteme:

- Windows 10
- Windows 11
- macOS
- gaengige Linux-Desktop-Systeme

Da die Anwendung browserbasiert ist, ist kein spezielles Betriebssystem fuer die Nutzung vorgeschrieben. Wichtig ist ein aktueller Browser.

## Browser

Empfohlen werden aktuelle Versionen von:

- Microsoft Edge
- Google Chrome
- Mozilla Firefox
- Safari

Der Browser muss JavaScript zulassen.

Es wird keine Browser-Erweiterung benoetigt. Es wird auch keine ClickOnce-Anwendung gestartet.

## Bildschirmaufloesung

Mindestaufloesung:

- 1280 x 720 Pixel

Empfohlene Aufloesung:

- 1920 x 1080 Pixel

Die Anwendung ist responsive vorbereitet und kann auch auf kleineren Bildschirmen genutzt werden. Fuer produktive Arbeit mit Datenbank, Vergleich und Export ist ein Desktop- oder Notebook-Bildschirm sinnvoll.

## Sonstige Voraussetzungen

Erforderlich:

- Internetverbindung
- aktueller Browser
- aktiviertes JavaScript
- Login-Daten fuer geschuetzte Bereiche

Nicht erforderlich:

- keine lokale Installation
- kein .NET Framework
- kein Java Runtime Environment
- keine Browser-Erweiterung
- kein SSH-Zugang fuer Kunden
- keine Hardware-ID-Authentifizierung

## Hosting und Betrieb

Die Web-App wird ueber Vercel gehostet. Vercel uebernimmt Build, Deployment, HTTPS und die Auslieferung der Next.js-Anwendung.

Die Datenbank- und Authentifizierungsschicht ist auf Supabase ausgelegt. Supabase stellt PostgreSQL, Authentifizierung und Row Level Security bereit.

Der Kunde muss keinen eigenen Server betreiben und sich nicht per SSH auf einem Server einloggen.

## Betriebssystemebene

Im Standardbetrieb verwalten wir keine eigene Betriebssystemebene fuer den Kunden.

Das bedeutet:

- kein eigener Linux-Server beim Kunden
- keine manuelle Serverwartung durch den Kunden
- keine SSH-Konfiguration fuer Nutzer
- keine Installation auf einzelnen Arbeitsplatzrechnern

Die Infrastruktur wird durch die Plattformanbieter betrieben. Wir liefern und pflegen die Anwendung.

## Abgrenzung zu klassischen Windows-Anwendungen

Der GrundsteuerMonitor unterscheidet sich bewusst von klassischen Windows- oder ClickOnce-Anwendungen.

Klassische Modelle setzen oft voraus:

- Windows als Zielsystem
- lokale Installation
- .NET Framework
- ClickOnce-Start aus dem Browser
- Hardware-ID oder rechnerspezifische Freischaltung
- Intranet-Installation

Unser Standardmodell ist einfacher:

- Browser oeffnen
- Webadresse aufrufen
- einloggen
- Anwendung nutzen

Das reduziert den IT-Aufwand beim Kunden und macht Pilotstarts schneller.

## Stakeholder-Antwort

Wenn ein Stakeholder nach Hosting, Server, SSH oder technischer Installation fragt, kann die Antwort so lauten:

> Der GrundsteuerMonitor ist eine browserbasierte Web-App. Die Anwendung wird ueber Vercel gehostet, die Datenbank- und Authentifizierungsschicht ist auf Supabase ausgelegt. Kunden benoetigen keine lokale Installation, kein .NET Framework und keinen SSH-Zugang. Die Betriebssystem- und Infrastrukturverwaltung uebernehmen die Plattformanbieter.

## Einordnung fuer Pilotkunden

Fuer Pilotkunden ist das Ziel ein moeglichst niedriger Einstieg:

- keine lokale IT-Installation
- keine komplexe Arbeitsplatzfreigabe
- schneller Zugang ueber den Browser
- klare Login- und Rollenstruktur
- spaetere Erweiterbarkeit fuer Organisationen und Mandanten

Eine Intranet- oder On-Premise-Variante wird nur dann betrachtet, wenn ein konkreter Enterprise-Kunde dies zwingend verlangt.
