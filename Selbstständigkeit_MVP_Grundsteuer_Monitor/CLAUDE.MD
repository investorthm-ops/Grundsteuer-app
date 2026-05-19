# Grundsteuer-Monitor — Projektkontext

## Was ist das?
SaaS-Produkt das Grundsteuerhebesätze aller deutschen Gemeinden (11.000+) täglich aggregiert und als Google Sheet Abo verkauft. Entstanden im Kontext der Grundsteuerreform 2025.

## Zielgruppe
- Immobilienmakler
- Steuerberater
- Hausverwaltungen
- Investmentfonds / PropTech-Anbieter

## Produkt
- Täglicher Scraper aggregiert öffentliche Quellen (Statistikportal, Landesfinanzministerien, Gemeinde-Websites)
- Lieferung per personalisierten Google Sheet Link
- Änderungs-Alerts per E-Mail
- Filterbar nach Bundesland, PLZ, Hebesatz-Höhe

## Pricing (Stand: März 2026)
| Paket        | Preis       | Bundesländer | Besonderheiten                       |
|--------------|-------------|--------------|---------------------------------------|
| Starter      | 49 €/Monat  | 1            | Basis-Features                        |
| Professional | 149 €/Monat | 3            | Historie 12 Monate, KfW-Förderungen   |
| Enterprise   | 499 €/Monat | Alle 16      | API-Zugang, Bodenrichtwerte           |

Monatlich kündbar, 14 Tage Geld-zurück-Garantie, Zahlung über Stripe.

---

## Aktueller Entwicklungsstand (März 2026)

### Fertig
- `grundsteuer-monitor-landingpage.html` — vollständige Marketing-Landingpage (dark Hero, Pricing, FAQ, Testimonials, Bundesland-Grid)
- `MVP-Plan-3-Wochen.html` — interaktiver 18-Schritte-Plan mit Fortschrittsbalken
- `Grundsteuer-Monitor-Setupplan.html` — technischer Setup-Plan

### Noch nicht gebaut (Kernprodukt)
- Scraper (Python oder n8n)
- Google Sheets API Anbindung
- Stripe Integration + Webhook → n8n → Sheet-Freigabe
- E-Mail-Alert System (Änderungs-Benachrichtigungen)
- Hosting der Landingpage

---

## MVP-Plan: 3 Wochen bis erster Kunde

### Woche 1 — Datenpipeline (Tage 1-7)
| Schritt | Was | Aufwand |
|---------|-----|---------|
| 1 | Mac Mini einrichten, Homebrew, Python, Node | 2 Std |
| 2 | Ollama + Mistral lokal installieren | 30 Min |
| 3 | n8n installieren & als Dienst starten | 1 Std |
| 4 | Python Scraper für Statistikportal schreiben | 2-3 Std |
| 5 | Google Sheets API (Service Account, JSON-Key) | 45 Min |
| 6 | n8n Workflow: Cron 03:00 → Scraper → Sheet | 2 Std |
| 7 | Demo-Sheet aufpolieren & testen | 3 Std |

**Ziel:** n8n läuft automatisch, Sheet ist demo-fertig.

### Woche 2 — Produkt & Zahlung (Tage 8-14)
| Schritt | Was | Aufwand |
|---------|-----|---------|
| 8 | Stripe Account + Produkte + Payment Links | 1 Std |
| 9 | Stripe Webhook → n8n (checkout.session.completed) | 2-3 Std |
| 10 | Google Sheets Berechtigungskonzept (Tab je Bundesland) | 2 Std |
| 11-12 | Landingpage hosten (Carrd.co oder eigenes Hosting) | 3-4 Std |
| 13 | Automatische Willkommens-Mail (n8n Gmail-Node) | 1 Std |
| 14 | Kompletten Flow testen (Testmodus Stripe → Sheet → Mail) | 2 Std |

**Ziel:** Kunde kann zahlen → bekommt automatisch Zugang.

### Woche 3 — Erste Kunden (Tage 15-21)
| Schritt | Was | Aufwand |
|---------|-----|---------|
| 14 | LinkedIn-Post: "Ich habe den Grundsteuer-Monitor gebaut" | 1 Std |
| 15 | 20 Personen direkt anschreiben (Makler, StB, HV) | 3-4 Std |
| 16 | 3 Beta-Kunden kostenlos onboarden (4 Wochen gratis) | laufend |
| 17 | Feedback auswerten & Produkt anpassen | 2-3 Std |
| 18 | Erster zahlender Kunde (Beta → 49 €/Mo) | 🎯 Meilenstein |

---

## Tech-Stack

### MVP (sofort)
- **Scraper:** Python (beautifulsoup4, requests, pandas, openpyxl, gspread)
- **Workflow-Automation:** n8n (lokal auf Mac Mini, 24/7)
- **KI-Bereinigung:** Ollama + Mistral (lokal, kostenlos)
- **Daten:** Google Sheets API
- **Payment:** Stripe (Payment Links + Webhook)
- **E-Mail:** n8n Gmail-Node
- **Hosting Landingpage:** Carrd.co (19 $/Jahr) oder eigenes Hosting

### Stufe 2 — Portal (ab ~10 zahlende Kunden)
- **Frontend:** Next.js + Vercel (kostenlos)
- **Auth:** Clerk.dev (kostenlos bis 10k User)
- **Abo-Verwaltung:** Stripe Billing
- **Domain:** grundsteuer-monitor.de (~12 €/Jahr)

### Evolutionspfad
| Phase | Zeitraum | Milestone |
|-------|----------|-----------|
| Google Sheets MVP | Monat 1-2 | 3-10 Kunden validieren |
| Landingpage + Stripe | Monat 3-4 | Automatisierter Verkauf |
| Einfaches Portal | Monat 5-8 | Login, 30-100 Kunden |
| Vollportal + API | Monat 9-12 | Enterprise, Skalierung |

---

## Laufende Kosten MVP
| Tool | Kosten |
|------|--------|
| Claude API | ~20 €/Mo |
| Perplexity | ~18 €/Mo |
| Carrd.co | ~1,60 €/Mo |
| Stripe | 1,5% + 0,25 € je Zahlung |
| **Gesamt** | **~40 €/Mo** |

Break-Even: 1 Starter-Kunde (49 €/Mo)

---

## Hardware
- **Mac Mini** — wird noch angeschafft, läuft dann 24/7 als n8n-Server + Scraper-Host

## Kontakt / Domain
- E-Mail: markus@grundsteuer-monitor.de
- Domain: grundsteuer-monitor.de (geplant)

---

## Dateien im Projekt
| Datei | Inhalt |
|-------|--------|
| `grundsteuer-monitor-landingpage.html` | Fertige Marketing-Landingpage |
| `MVP-Plan-3-Wochen.html` | Interaktiver 18-Schritte-Plan mit Fortschrittsbalken |
| `Grundsteuer-Monitor-Setupplan.html` | Technischer Setup-Plan |
| `KI-Tools-Dashboard.html` | KI-Tool-Übersicht für Selbstständige |
| `Setup-Plan.html` | Allgemeiner Selbstständigkeit-Setup |
| `Kleingewerbe-Anmeldung-Guide.html` | Guide zur Gewerbeanmeldung |

---

## Nächste Schritte (wenn Mac Mini da ist)
1. Mac Mini einrichten (Homebrew, Python, Node, Ollama, n8n)
2. Python Scraper für Statistikportal.de bauen
3. Google Sheets API Service Account einrichten
4. n8n Workflow: Cron → Scraper → Sheet
5. Stripe Produkte + Payment Links anlegen
6. Stripe Webhook → n8n → automatische Sheet-Freigabe
7. Landingpage hosten
8. Erste Beta-Kunden anschreiben
