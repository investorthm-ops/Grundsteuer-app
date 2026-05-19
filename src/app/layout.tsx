import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GrundsteuerMonitor',
  description: 'Fruehwarnsystem fuer kommunale Steuererhoehungen',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
