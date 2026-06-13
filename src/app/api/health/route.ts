import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Leichter Health-/Keep-alive-Endpunkt.
//
// Zweck: Das Supabase-Projekt läuft auf dem Free-Plan und pausiert nach ~1 Woche
// ohne DB-Aktivität automatisch — dann ist die Live-App ohne Daten. Dieser
// Endpunkt setzt eine minimale Leseabfrage ab und hält die Datenbank damit wach.
// Wird regelmäßig vom Workflow .github/workflows/keep-alive.yml aufgerufen.
//
// Kein Login nötig (nicht im Middleware-Matcher) und es werden keine Daten
// preisgegeben — die Antwort enthält nur den Status.
export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createSupabaseServerClient()

  // Triviale Abfrage gegen die anon-lesbare municipalities-Tabelle. Reicht aus,
  // um die Postgres-Inaktivitätsuhr zurückzusetzen.
  const { error } = await supabase.from('municipalities').select('id').limit(1)

  if (error) {
    return NextResponse.json(
      { ok: false, db: 'down' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  return NextResponse.json(
    { ok: true, db: 'up', timestamp: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
