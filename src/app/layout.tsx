import type { Metadata } from 'next'
import { Footer } from '@/components/footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'GrundsteuerMonitor',
  description: 'Frühwarnsystem für kommunale Steuererhöhungen',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <body className="flex min-h-screen flex-col bg-zinc-50 text-zinc-950 antialiased">
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
