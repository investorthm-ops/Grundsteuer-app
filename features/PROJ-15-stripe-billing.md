# PROJ-15 — Stripe-Billing Integration

**Status:** Planned
**Created:** 2026-05-30
**Priority:** P2 — nach Pilotkunden-Feedback

---

## Ziel

Kunden können ein Abo buchen und bezahlen. Der Zugang wird automatisch nach erfolgreicher Zahlung aktiviert und nach Ablauf oder Kündigung gesperrt.

## Abo-Stufen

| Stufe | Name | Preis | Nutzer | Stripe-Produkt |
|---|---|---|---|---|
| 1 | Solo | 49 €/Monat | 1 | `price_solo_monthly` |
| 2 | Kanzlei | 129 €/Monat | bis 5 | `price_kanzlei_monthly` |
| — | Jahresrabatt | −20 % | je Stufe | `price_*_yearly` |

Preise sind Richtwerte und werden vor Go-Live final festgelegt.

## User Stories

- Als Interessent möchte ich ein Abo buchen können, ohne den Anbieter kontaktieren zu müssen.
- Als Kunde möchte ich mein Abo und meine Rechnungen unter „Mein Zugang" einsehen.
- Als Kunde möchte ich mein Abo kündigen oder upgraden können.
- Als Admin möchte ich sehen, welche Kunden aktiv zahlen.

## Akzeptanzkriterien

- [ ] Stripe Checkout öffnet sich nach Klick auf „Jetzt abonnieren"
- [ ] Nach erfolgreicher Zahlung wird `access_granted = true` und `access_until` gesetzt
- [ ] Stripe Webhook aktualisiert den Zugangsstatus bei Verlängerung und Kündigung
- [ ] Abgelaufene Abos sperren den Zugang automatisch
- [ ] Kunde sieht Plan, nächste Zahlung und Kündigungsoption unter `/mein-zugang`
- [ ] Admin sieht Stripe-Abo-Status in der Kundenverwaltung

## Technische Architektur

### Stripe-Komponenten
- **Stripe Checkout** — hosted Payment Page, kein eigenes Formular nötig
- **Stripe Customer Portal** — Self-Service für Kündigung, Upgrade, Rechnungen
- **Stripe Webhooks** — `invoice.paid`, `customer.subscription.deleted`, `customer.subscription.updated`

### Datenbank-Änderungen (neue Felder in `customers`-Tabelle)
```sql
stripe_customer_id   TEXT UNIQUE
stripe_subscription_id TEXT
stripe_price_id      TEXT
subscription_status  TEXT  -- 'active' | 'canceled' | 'past_due' | 'trialing'
```

### API-Routen (Next.js)
- `POST /api/stripe/checkout` — erstellt Stripe Checkout Session
- `POST /api/stripe/portal` — öffnet Customer Portal
- `POST /api/stripe/webhook` — empfängt Stripe-Events, aktualisiert DB

### Env-Variablen (neu)
```
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

## Abhängigkeiten

- PROJ-13 (Mein Zugang) — wird um Abo-Info erweitert
- PROJ-8 (Nutzerverwaltung) — Zugangsstatus-Logik bereits vorhanden

## Out of Scope

- Mehrere Zahlungsmethoden außer Kreditkarte/SEPA (Stripe handelt das)
- Rechnungsstellung außerhalb Stripe
- Gutscheine / Rabattcodes (Phase 2)
- Team-Verwaltung mit Seat-Management (separates Feature)

## Nächste Schritte vor Implementierung

1. Stripe-Account anlegen und Produkte/Preise anlegen
2. Preise final festlegen
3. Vercel-Umgebungsvariablen setzen
4. `/requirements` für detaillierte Spec aufrufen
