import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/supabase/is-admin'
import { parseCsv } from '@/lib/imports/csv'
import { validateImportRows } from '@/lib/imports/validate'
import type { Municipality } from '@/lib/types/municipality'

const uploadSchema = z.object({
  sourceName: z.string().trim().min(1).max(200),
  sourceUrl: z.string().trim().url().max(500).nullable().optional(),
  dataStand: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { supabase, user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (!(await isAdmin(supabase, user.id))) {
    return { supabase, user, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { supabase, user, response: null }
}

export async function GET() {
  const { supabase, response } = await requireAdmin()
  if (response) return response

  const { data, error } = await supabase
    .from('import_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(25)

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: NextRequest) {
  const { supabase, user, response } = await requireAdmin()
  if (response) return response

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  const parsedMeta = uploadSchema.safeParse({
    sourceName: formData.get('sourceName'),
    sourceUrl: formData.get('sourceUrl') || null,
    dataStand: formData.get('dataStand'),
  })

  if (!parsedMeta.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsedMeta.error.issues },
      { status: 400 }
    )
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'CSV file missing' }, { status: 400 })
  }

  if (!file.name.toLowerCase().endsWith('.csv')) {
    return NextResponse.json({ error: 'Only CSV files are supported' }, { status: 400 })
  }

  let csv
  try {
    csv = parseCsv(await file.text())
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'CSV konnte nicht gelesen werden.' },
      { status: 400 }
    )
  }

  if (csv.rows.length > 5000) {
    return NextResponse.json({ error: 'Maximal 5.000 Zeilen pro Import.' }, { status: 400 })
  }

  const { data: existing, error: existingError } = await supabase
    .from('municipalities')
    .select('id,name,bundesland,kreis,hebesatz_a,hebesatz_b,hebesatz_gewerbe,vorjahr_b,datenstand,quellenstatus')

  if (existingError) {
    return NextResponse.json({ error: 'Existing data could not be loaded' }, { status: 500 })
  }

  const rows = validateImportRows(
    csv.rows,
    (existing ?? []) as Municipality[],
    parsedMeta.data.sourceName,
    parsedMeta.data.sourceUrl ?? null,
    parsedMeta.data.dataStand
  )

  const summary = rows.reduce(
    (acc, row) => {
      acc.total_rows += 1
      if (row.status === 'valid') acc.valid_rows += 1
      if (row.status === 'warning') acc.warning_rows += 1
      if (row.status === 'error') acc.error_rows += 1
      if (row.status === 'conflict') acc.conflict_rows += 1
      if (row.action === 'create' && row.status !== 'error') acc.new_rows += 1
      if (row.action === 'update' && row.status !== 'error') acc.update_rows += 1
      return acc
    },
    {
      total_rows: 0,
      valid_rows: 0,
      warning_rows: 0,
      error_rows: 0,
      conflict_rows: 0,
      new_rows: 0,
      update_rows: 0,
    }
  )

  const { data: run, error: runError } = await supabase
    .from('import_runs')
    .insert({
      source_name: parsedMeta.data.sourceName,
      source_url: parsedMeta.data.sourceUrl,
      data_stand: parsedMeta.data.dataStand,
      status: 'validated',
      ...summary,
      created_by: user!.id,
    })
    .select('*')
    .single()

  if (runError || !run) {
    return NextResponse.json({ error: 'Import run could not be created' }, { status: 500 })
  }

  const { error: rowsError } = await supabase.from('import_rows').insert(
    rows.map((row) => ({
      ...row,
      import_run_id: run.id,
    }))
  )

  if (rowsError) {
    await supabase.from('import_runs').update({ status: 'failed' }).eq('id', run.id)
    return NextResponse.json({ error: 'Import rows could not be saved' }, { status: 500 })
  }

  const { data: savedRows } = await supabase
    .from('import_rows')
    .select('*')
    .eq('import_run_id', run.id)
    .order('row_number', { ascending: true })

  return NextResponse.json({ data: { run, rows: savedRows ?? [] } }, { status: 201 })
}
