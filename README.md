# Grundsteuer-Monitor

Privates Arbeitsprojekt fuer einen spaeteren Grundsteuer-Monitor als Abo-Produkt.

## Ziel

Das Projekt sammelt und vergleicht kommunale Grundsteuer-Hebesaetze. Die lokale MVP-Version dient dazu, Datenpflege, Filter, Exporte, Beobachtungslisten und erste Kundenpakete zu testen.

Parallel liegt im Repo bereits eine Next.js/Supabase-Projektstruktur. Diese kann spaeter genutzt werden, um aus dem lokalen HTML-MVP eine echte Web-App mit Login, Datenbank und Abo-Zugriff zu bauen.

## Wichtige MVP-Dateien

- `Grundsteuer-Monitor-MVP.html` - aktuelle lokale MVP-App
- `Grundsteuer-Monitor-Demo.html` - erste Demo-Version
- `Grundsteuer-Monitor-NRW-Maerz2026.html` - fruehe NRW-Variante
- `grundsteuer-monitor-landingpage.html` - Landingpage-Entwurf
- `Grundsteuer-Monitor-Setupplan.html` - Setup- und Produktplanung
- `Grundsteuer-Monitor-Pitch.pdf` und `.pptx` - Pitch-Unterlagen

## Lokale Nutzung

Die MVP-Datei kann direkt im Browser geoeffnet werden. Es ist kein Server und keine Installation notwendig.

Die App speichert Testdaten lokal im Browser des Rechners. CSV- und JSON-Exporte koennen aus der App heraus erstellt werden.

## Web-App-Struktur

Das Repo enthaelt ausserdem einen Next.js-Starter mit TypeScript, Tailwind CSS, shadcn/ui und optionalem Supabase-Client.

Typische Befehle fuer die spaetere Web-App:

```bash
npm install
npm run dev
npm run build
```

## Status

Privates Arbeitsprojekt. Nicht oeffentlich veroeffentlichen.
