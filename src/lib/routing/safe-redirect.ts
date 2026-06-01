export function resolveSafeRedirectPath(value: string | null | undefined): string {
  const fallback = '/'
  const raw = value?.trim()

  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) {
    return fallback
  }

  try {
    const parsed = new URL(raw, 'https://grundsteuermonitor.local')
    if (parsed.origin !== 'https://grundsteuermonitor.local') return fallback
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}
