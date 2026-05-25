import Link from 'next/link'
import { Building2 } from 'lucide-react'

const PRODUCT_LINKS = [
  { href: '/datenbank', label: 'Datenbank' },
  { href: '/vergleich', label: 'Vergleich' },
  { href: '/rechner', label: 'Rechner' },
  { href: '/watchlist', label: 'Watchlist' },
]

const INFO_LINKS = [
  { href: '/', label: 'Startseite' },
  { href: '/kontakt', label: 'Kontakt' },
  { href: '/login', label: 'Anmelden' },
  { href: '/mein-zugang', label: 'Mein Zugang' },
  { href: '/passwort-vergessen', label: 'Passwort vergessen' },
]

const LEGAL_LINKS = [
  { href: '/impressum', label: 'Impressum' },
  { href: '/datenschutz', label: 'Datenschutz' },
  { href: '/hinweise', label: 'Hinweise' },
  { href: '/agb', label: 'AGB' },
  { href: '/haftungsausschluss', label: 'Haftungsausschluss' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto] lg:gap-16">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-white">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-base font-semibold text-zinc-950">
                  GrundsteuerMonitor
                </span>
                <span className="block text-sm text-zinc-500">Hebesätze im Blick</span>
              </span>
            </Link>
            <p className="text-sm leading-6 text-zinc-500">
              © {year} GrundsteuerMonitor.
              <br />
              Alle Rechte vorbehalten.
            </p>
          </div>

          <nav aria-label="Produkt" className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-950">Produkt</h2>
            <ul className="space-y-2 text-sm">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-zinc-600 hover:text-zinc-950">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Mehr" className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-950">Mehr</h2>
            <ul className="space-y-2 text-sm">
              {INFO_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-zinc-600 hover:text-zinc-950">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-zinc-500">Made in Germany.</p>
          <nav aria-label="Rechtliches" className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-zinc-600 hover:text-zinc-950"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
