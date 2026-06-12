import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { exportQuerySchema } from '@/lib/validation/municipality'
import { DATA_NOTICE, deltaB, num } from '@/lib/reports/format'
import type { Municipality } from '@/lib/types/municipality'

const EXPORT_LIMIT = 5000

const HEADERS = [
  'Gemeinde',
  'Bundesland',
  'Kreis',
  'Grundsteuer A',
  'Grundsteuer B Standard',
  'Grundsteuer B Wohnen',
  'Grundsteuer B Nichtwohnen',
  'Vorjahr B',
  'Delta B',
  'Gewerbesteuer',
  'Datenstand',
  'In App aktualisiert',
  'Quellenstatus',
  'Quellenname',
  'Quellen-URL',
  'Hinweis',
]

function csvCell(value: string | number | null | undefined) {
  if (value === null || typeof value === 'undefined') return ''
  let text = String(value)
  // Schutz vor CSV-/Formel-Injection: Zellen, die mit = + - @ oder einem
  // Steuerzeichen (Tab/CR) beginnen, koennen von Excel/Sheets als Formel
  // interpretiert werden. Mit einem fuehrenden Apostroph neutralisieren.
  // Reine (auch negative) Zahlen wie "-75" bleiben unangetastet.
  const isNumeric = /^-?\d[\d.,]*$/.test(text)
  if (!isNumeric && /^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`
  }
  if (!/[;"\r\n]/.test(text)) return text
  return `"${text.replaceAll('"', '""')}"`
}

function toCsv(items: Municipality[]) {
  const rows = items.map((item) => [
    item.name,
    item.bundesland,
    item.kreis,
    num(item.hebesatz_a),
    num(item.hebesatz_b),
    num(item.hebesatz_b_wohnen),
    num(item.hebesatz_b_nichtwohnen),
    num(item.vorjahr_b),
    num(deltaB(item)),
    num(item.hebesatz_gewerbe),
    item.datenstand,
    item.updated_at,
    item.quellenstatus,
    item.quellenname,
    item.quellen_url,
    DATA_NOTICE,
  ])

  return [HEADERS, ...rows]
    .map((row) => row.map(csvCell).join(';'))
    .join('\r\n')
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = Object.fromEntries(request.nextUrl.searchParams.entries())
  const parsed = exportQuerySchema.safeParse(params)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { bundesland, q } = parsed.data
  let query = supabase
    .from('municipalities')
    .select('*')
    .order('bundesland', { ascending: true })
    .order('name', { ascending: true })
    .limit(EXPORT_LIMIT)

  if (bundesland) query = query.eq('bundesland', bundesland)
  if (q) query = query.ilike('name', `%${q}%`)

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const csv = `\uFEFF${toCsv((data ?? []) as Municipality[])}`
  const date = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="grundsteuer-monitor-export-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
