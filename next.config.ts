import type { NextConfig } from 'next'

// Content-Security-Policy: Defense-in-depth gegen XSS/Daten-Exfiltration.
// Pragmatischer Baseline-Wert, der mit Next.js App Router und Supabase laeuft:
// - script/style 'unsafe-inline' noetig, da Next ohne Nonce-Setup inline-Hydration
//   und Tailwind/Next inline-Styles nutzt (kein 'unsafe-eval' in Produktion).
// - connect-src erlaubt nur self + Supabase (verhindert Exfiltration zu Fremdhosts).
// - frame-ancestors/object-src/base-uri/form-action eng gesetzt.
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://*.supabase.co https://*.supabase.in",
  "form-action 'self'",
].join('; ')

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },
}

export default nextConfig
