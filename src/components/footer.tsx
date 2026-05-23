import Link from 'next/link'

const FOOTER_LINKS = [
  { href: '/impressum', label: 'Impressum' },
  { href: '/agb', label: 'AGB' },
  { href: '/kontakt', label: 'Kontakt' },
]

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-zinc-500">
          © {new Date().getFullYear()} GrundsteuerMonitor
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Rechtliches">
          {FOOTER_LINKS.map((link) => (
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
    </footer>
  )
}
