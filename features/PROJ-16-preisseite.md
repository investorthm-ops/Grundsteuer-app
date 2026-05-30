# PROJ-16: Preisseite (/preise) mit Tarifen Solo und Kanzlei

## Status: Deployed
**Created:** 2026-05-30
**Last Updated:** 2026-05-30

> **Deployed 2026-05-30:** PR #28 (Squash-Commit `3398352`) auf `main` gemergt; Vercel-Produktions-Deployment `dpl_EdAuMTibD5vgwW53sUvaBnMhm6jm` READY und live unter `grundsteuer-app.vercel.app/preise`. Lokal verifiziert (Accessibility-Snapshot + Toggle 41/108 ↔ 49/129 €).

## Implementierungsnotizen (Frontend, 2026-05-30)
- Neue Seite `src/app/preise/page.tsx` server-gerendert im `AppShell`-Rahmen, öffentlich, mit SEO-`Metadata` (Title/Description). Eyebrow „Tarife", Titel „Preise". Rechtshinweis am Seitenende (USt-Hinweis + „ersetzt keine Steuer-/Rechtsberatung").
- Client-Insel `src/components/pricing/pricing-plans.tsx`: shadcn `Switch` mit zwei Beschriftungen (Monatlich/Jährlich), Standard = Jährlich. Zwei Tarifkarten (shadcn Card/Badge/Button), Kanzlei als Empfehlung mit Ring/Border und „Empfehlung"-Badge hervorgehoben. Feature-Liste mit `Check`-Icons.
- Preis-Darstellung SaaS-üblich: bei Jährlich großer Effektiv-Monatspreis (Solo 41 €, Kanzlei 108 €) + Kleintext „jährlich abgerechnet · 490 €/1.290 €" + Badge „2 Monate gratis"; bei Monatlich 49 €/129 € mit „monatlich abgerechnet".
- Zentrale Tarif-Konfiguration `src/lib/pricing.ts`: Preise, Effektivpreise, Feature-Listen, Empfehlung-Flag, CTA (Label + href), plus `PRICING_CTA_MODE` ('contact' | 'checkout') für späteren Stripe-Wechsel ohne Layout-Umbau. CTA-Ziel aktuell `/kontakt` („Kontakt aufnehmen").
- Bestand ergänzt: Nav-Eintrag „Preise" (lucide `BadgeEuro`) in `primaryNavItems` (`src/components/app-shell.tsx`); Hero-CTA „Preise ansehen" auf `/preise` in `src/app/page.tsx`.
- Keine neuen Pakete. Bestehender Zinc-Look, responsiv (Karten stapeln unter `md`), barrierearm (Switch beschriftet, `role="group"`, sr-only Überschrift). `tsc --noEmit` fehlerfrei.

## Übersicht
Eine öffentliche, dedizierte Preisseite unter `/preise`, die zwei Abo-Tarife klar gegenüberstellt und Interessenten zum Handeln bewegt. Die Seite kommuniziert Preise, Leistungsumfang und einen klaren nächsten Schritt (CTA). Sie ist auch ohne aktives Billing nutzbar: Solange Stripe (PROJ-15) nicht live ist, führen die CTA-Buttons zu „Kontakt aufnehmen". Diese Spezifikation beschreibt ausschließlich die Preis-Darstellung und Verlinkung — nicht den Bezahlvorgang selbst (PROJ-15) und nicht die Report-Funktion (PROJ-17).

## Zielgruppe
- **Interessenten ohne Account** (Steuerberater, Investoren, Gewerbetreibende): wollen vor einer Kaufentscheidung Preise und Leistungsumfang schnell vergleichen.
- **Bestehende Pilotnutzer**: wollen sehen, welcher Tarif zu ihrem Bedarf passt und was der Kanzlei-Tarif zusätzlich bietet.

## Tarifstruktur
| Tarif | Monatspreis | Jahrespreis | Leistungsumfang |
|---|---|---|---|
| **Solo** | 49 €/Monat | ~490 €/Jahr (2 Monate gratis) | Alle bestehenden Features: Suche, Vergleich, Watchlist, CSV/Excel-Export, Renditerechner |
| **Kanzlei** | 129 €/Monat | ~1.290 €/Jahr (2 Monate gratis) | Alles aus Solo **plus** PDF/Excel-Reports für Mandantengespräche (PROJ-17) |

Hinweis: Preise sind Netto/Brutto-Darstellung später final festzulegen; für V1 werden die genannten Eurobeträge angezeigt.

## User Stories
- Als Interessent möchte ich auf einer Seite beide Tarife mit Preisen und Leistungen nebeneinander sehen, damit ich schnell den passenden Tarif erkenne.
- Als Interessent möchte ich zwischen Monats- und Jahrespreis umschalten können, damit ich den Jahresrabatt sehe und vergleichen kann.
- Als Interessent möchte ich pro Tarif einen klaren Aktionsbutton sehen, damit ich sofort den nächsten Schritt gehen kann.
- Als preisbewusster Nutzer möchte ich den Jahresvorteil („2 Monate gratis") deutlich erkennen, damit ich den Mehrwert der Jahreszahlung verstehe.
- Als Besucher der Startseite möchte ich die Preise über Navigation und einen Hero-CTA leicht finden, damit ich nicht suchen muss.

## Akzeptanzkriterien
- [ ] Eine öffentlich erreichbare Seite unter `/preise` existiert (kein Login nötig).
- [ ] Oben befindet sich ein Umschalter (Toggle) zwischen „Monatlich" und „Jährlich".
- [ ] Bei „Jährlich" zeigt jede Karte den Jahrespreis und einen sichtbaren Rabatt-Hinweis („2 Monate gratis" o. ä.); bei „Monatlich" den Monatspreis.
- [ ] Zwei Tarifkarten werden nebeneinander dargestellt: „Solo" und „Kanzlei".
- [ ] Jede Karte zeigt: Tarifname, aktuellen Preis (abhängig vom Toggle), eine Feature-Liste und einen CTA-Button.
- [ ] Die Solo-Karte listet die bestehenden Features (Suche, Vergleich, Watchlist, Export, Renditerechner).
- [ ] Die Kanzlei-Karte listet „Alles aus Solo" plus PDF/Excel-Reports für Mandantengespräche.
- [ ] Eine Karte (Kanzlei) ist optisch als Empfehlung/hervorgehoben markiert.
- [ ] Solange Stripe nicht aktiv ist, führt jeder CTA-Button zu „Kontakt aufnehmen" (E-Mail-Link oder Kontaktziel), nicht zu einem Checkout.
- [ ] Der CTA ist so umgesetzt, dass er später ohne Layout-Umbau auf Stripe Checkout umgestellt werden kann (austauschbares Ziel/Handler).
- [ ] Die Preisseite ist in der Hauptnavigation als „Preise" verlinkt.
- [ ] Die Startseite enthält im Hero-Bereich einen CTA, der auf `/preise` führt.
- [ ] Die Seite ist auf Mobilgeräten nutzbar: Karten stapeln vertikal, Toggle bleibt bedienbar.
- [ ] Rechtlicher Hinweis vorhanden, dass die Anwendung keine Steuer-/Rechtsberatung ersetzt (konsistent mit übrigen Seiten), sofern projektüblich.

## Edge Cases
- **Stripe noch nicht live:** CTA zeigt „Kontakt aufnehmen"; es darf kein toter/fehlerhafter Checkout-Link entstehen.
- **Toggle-Standardzustand:** Beim Laden ist ein definierter Zustand aktiv (Empfehlung: „Jährlich", da Rabatt sichtbar). Wechsel aktualisiert beide Karten konsistent.
- **Sehr schmale Viewports:** Toggle und Karten bleiben lesbar und bedienbar (kein horizontales Scrollen).
- **Screenreader/Tastatur:** Toggle und CTAs sind per Tastatur bedienbar und beschriftet.
- **Preisänderung später:** Preise/Feature-Listen liegen an einer zentralen, leicht änderbaren Stelle (keine verstreuten Hardcodes), damit Anpassungen einfach sind.
- **Doppelte Navigation:** Es entsteht kein doppelter „Preise"-Eintrag, falls Navigation an mehreren Stellen gepflegt wird.

## Bewusst nicht im Scope
- Tatsächlicher Bezahlvorgang / Stripe Checkout / Webhooks → PROJ-15.
- Erstellung der PDF/Excel-Reports selbst → PROJ-17 (hier nur als Tarifmerkmal genannt).
- Steuerliche Behandlung (USt-Ausweis, Rechnungen), Gutscheine/Coupons, mehrstufige Mengenrabatte.
- Self-Signup/Registrierung über die Preisseite (bleibt admin-gesteuert, vgl. PRD Non-Goals).

## Dependencies
- Soft-Bezug: PROJ-15 (Stripe-Billing) — CTA wird später auf Checkout umgestellt; bis dahin „Kontakt aufnehmen".
- Soft-Bezug: PROJ-17 (PDF/Excel-Reports) — als Kanzlei-Tarifmerkmal gelistet, Funktion folgt separat.
- Baut auf: bestehende Homepage/Navigation (`src/app/page.tsx` + Layout/Header).

## Technical Requirements (optional)
- Öffentliche Seite, kein Auth nötig; SEO-fähig (sinnvoller Title/Meta für „GrundsteuerMonitor Preise").
- Konsistent mit bestehendem Design (Tailwind + shadcn/ui), kein neues Theme/keine neuen Markenfarben.
- Responsiv (Mobile-first), barrierearm (Toggle + CTAs per Tastatur/Screenreader bedienbar).

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
Reine Frontend-Seite, kein Backend, keine Datenbank. Die Seite lebt im bestehenden Seitenrahmen (`AppShell`), sodass Header, Navigation, Suche und Footer automatisch konsistent sind. Die eigentliche Tarif-Darstellung mit dem Monat/Jahr-Umschalter ist eine kleine interaktive Insel (Client-Komponente); der Rest bleibt server-gerendert und SEO-fähig.

### A) Komponentenstruktur (Baum)
```
/preise (Seite, im AppShell-Rahmen, öffentlich)
+-- Einleitungstext (Server, über AppShell-Titel/Beschreibung)
+-- PricingPlans (Client-Insel — hält den Monat/Jahr-Zustand)
|   +-- Umschalter "Monatlich / Jährlich" (shadcn Switch + Beschriftung)
|   +-- Rabatt-Hinweis "2 Monate gratis" (shadcn Badge, sichtbar bei Jährlich)
|   +-- Tarifkarte "Solo"      (shadcn Card)
|   |   +-- Preis (abhängig vom Umschalter)
|   |   +-- Feature-Liste (Häkchen-Liste)
|   |   +-- CTA-Button (shadcn Button)
|   +-- Tarifkarte "Kanzlei"   (shadcn Card, optisch als Empfehlung markiert)
|       +-- "Empfehlung"-Badge
|       +-- Preis (abhängig vom Umschalter)
|       +-- Feature-Liste ("Alles aus Solo" + Reports)
|       +-- CTA-Button
+-- Kurzer Rechtshinweis (bestehende SiteDisclaimer-Komponente, via AppShell)
```

### B) Datenmodell (Klartext, kein Server)
Es wird nichts gespeichert. Die Tarife liegen als **zentrale Konfiguration im Code** an einer Stelle (eine kleine Datei `src/lib/pricing.ts`), damit Preise und Feature-Listen ohne Suchen im Layout geändert werden können.

```
Jeder Tarif hat:
- Schlüssel (z. B. "solo", "kanzlei")
- Anzeigename ("Solo", "Kanzlei")
- Monatspreis (49, 129)
- Jahrespreis (490, 1290) + Rabatt-Hinweis ("2 Monate gratis")
- Feature-Liste (Texte)
- Empfehlung-Markierung (ja/nein)
- CTA: Beschriftung + Ziel

Umschalter-Zustand (Monat/Jahr): lebt nur im Browser (React-State),
Standard = "Jährlich" (damit der Rabatt sofort sichtbar ist).
```

**Preis-Darstellung (Nutzerentscheidung 2026-05-30):** SaaS-üblich „pro Monat, jährlich abgerechnet".
- Bei **Monatlich**: groß „49 €/Monat" bzw. „129 €/Monat".
- Bei **Jährlich**: groß der monatliche Effektivpreis (Jahrespreis ÷ 12, kaufmännisch gerundet) →
  Solo „41 €/Monat" (490 ÷ 12 ≈ 40,83), Kanzlei „108 €/Monat" (1290 ÷ 12 = 107,5);
  darunter Kleintext „jährlich abgerechnet · 490 €" bzw. „· 1.290 €" plus Badge „2 Monate gratis".
- Der gerundete Monatswert ist Anzeige; abgerechnet wird der echte Jahresbetrag (490 / 1.290 €).

### C) Tech-Entscheidungen (mit Begründung)
- **Im `AppShell`-Rahmen bauen:** Header, Navigation und Footer sind dadurch automatisch identisch zu den übrigen Seiten — kein doppeltes Layout, weniger Pflege.
- **Nur der Umschalter ist eine Client-Komponente:** Die Interaktivität (Monat/Jahr) braucht Browser-Logik; alles andere bleibt statisch und schnell. So bleibt die Seite gut für Suchmaschinen lesbar.
- **Umschalter als shadcn `Switch` mit zwei Beschriftungen:** Monat/Jahr ist eine Ja/Nein-Auswahl — ein Switch ist dafür das einfachste, bereits vorhandene Bedienelement (keine neue Abhängigkeit). Er ist tastatur- und screenreader-tauglich.
- **Tarife in einer zentralen Datei:** Preise ändern sich erfahrungsgemäß — eine einzige Quelle der Wahrheit verhindert verstreute Hardcodes und macht spätere Anpassungen trivial.
- **CTA über einen austauschbaren „Modus":** Heute zeigt der Button auf die bestehende **`/kontakt`-Seite** („Kontakt aufnehmen"). Das Ziel steht in der zentralen Tarif-Konfiguration. Wenn Stripe (PROJ-15) live ist, wird nur dieses Ziel/Handler-Verhalten umgestellt — **kein Layout-Umbau** nötig.
- **Kein neues Theme:** ausschließlich bestehende Tailwind-/shadcn-Bausteine (Card, Badge, Button, Switch, Separator) im vorhandenen Zinc-Look.

### D) Verlinkung (zwei kleine Ergänzungen an Bestand)
- **Hauptnavigation:** In `src/components/app-shell.tsx` wird der Liste `primaryNavItems` ein Eintrag „Preise" (Route `/preise`, passendes lucide-Icon, z. B. `BadgeEuro` oder `Tag`) hinzugefügt.
- **Homepage-Hero:** In `src/app/page.tsx` wird im Hero-Bereich ein zusätzlicher CTA-Button „Preise ansehen" (Link auf `/preise`) ergänzt.

### E) Neue Dateien / berührte Dateien
- Neu: `src/app/preise/page.tsx` (Seite)
- Neu: `src/components/pricing/pricing-plans.tsx` (Client-Insel mit Umschalter + Karten)
- Neu: `src/lib/pricing.ts` (zentrale Tarif-Konfiguration)
- Geändert: `src/components/app-shell.tsx` (Nav-Eintrag „Preise")
- Geändert: `src/app/page.tsx` (Hero-CTA „Preise ansehen")

### F) Abhängigkeiten (Pakete)
- **Keine neuen Pakete nötig.** Alle benötigten Bausteine (Card, Badge, Button, Switch, Separator) sind bereits unter `src/components/ui/` vorhanden.
- Optional (nur falls eine „Segment"-Optik statt Switch gewünscht wird): shadcn `toggle-group` nachinstallieren. Empfehlung: vorerst nicht — Switch reicht.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
