/**
 * Zentrale Tarif-Konfiguration für die Preisseite (/preise).
 *
 * Eine einzige Quelle der Wahrheit für Preise, Feature-Listen, Empfehlung und
 * CTA-Ziel. Preisänderungen oder ein späterer Wechsel auf Stripe-Checkout
 * (PROJ-15) erfolgen ausschließlich hier – ohne Layout-Umbau.
 */

/**
 * CTA-Modus. Solange Stripe (PROJ-15) nicht live ist, verweisen alle Tarife per
 * Link auf die Kontaktseite. Wird später auf 'checkout' umgestellt, kann die
 * UI-Komponente das Ziel als Stripe-Checkout-Handler interpretieren.
 */
export type PricingCtaMode = 'contact' | 'checkout'

export const PRICING_CTA_MODE: PricingCtaMode = 'contact'

export type PricingPlan = {
  /** Stabiler Schlüssel, z. B. für späteres Stripe-Mapping. */
  key: 'solo' | 'kanzlei'
  name: string
  /** Kurzer Untertitel/Positionierung der Karte. */
  tagline: string
  /** Monatspreis bei monatlicher Abrechnung (in Euro). */
  monthlyPrice: number
  /** Jahrespreis bei jährlicher Abrechnung (in Euro). */
  yearlyPrice: number
  /**
   * Effektiver Monatspreis bei Jahreszahlung (kaufmännisch gerundet, nur Anzeige).
   * Abgerechnet wird stets der echte Jahresbetrag (yearlyPrice).
   */
  yearlyMonthlyEffective: number
  /** Rabatt-Hinweis, sichtbar bei jährlicher Abrechnung. */
  yearlyDiscountNote: string
  features: string[]
  /** Optischer Vorhebung als Empfehlung. */
  recommended: boolean
  cta: {
    label: string
    /** Ziel im 'contact'-Modus (interne Route). */
    href: string
  }
}

export const pricingPlans: PricingPlan[] = [
  {
    key: 'solo',
    name: 'Solo',
    tagline: 'Für Einzelnutzer und kleine Teams, die Hebesätze recherchieren und vergleichen.',
    monthlyPrice: 49,
    yearlyPrice: 490,
    yearlyMonthlyEffective: 41,
    yearlyDiscountNote: '2 Monate gratis',
    features: [
      'Bundesweite Hebesatz-Suche (Grundsteuer A, B, Gewerbe)',
      'Vergleich und Benchmarking mehrerer Kommunen',
      'Watchlist für relevante Gemeinden',
      'CSV-/Excel-Export für Auswertungen',
      'Renditeauswirkungs-Rechner',
    ],
    recommended: false,
    cta: {
      label: 'Kontakt aufnehmen',
      href: '/kontakt',
    },
  },
  {
    key: 'kanzlei',
    name: 'Kanzlei',
    tagline: 'Für Kanzleien und Berater, die Ergebnisse direkt im Mandantengespräch nutzen.',
    monthlyPrice: 129,
    yearlyPrice: 1290,
    yearlyMonthlyEffective: 108,
    yearlyDiscountNote: '2 Monate gratis',
    features: [
      'Alles aus Solo',
      'PDF-/Excel-Reports für Mandantengespräche',
      'Aufbereitete Auswertungen für Beratung und Standortfragen',
    ],
    recommended: true,
    cta: {
      label: 'Kontakt aufnehmen',
      href: '/kontakt',
    },
  },
]

/** Formatiert einen Eurobetrag ohne Nachkommastellen (z. B. 1.290 €). */
export function formatEuro(value: number): string {
  return `${value.toLocaleString('de-DE')} €`
}
