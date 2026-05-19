import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/supabase/is-admin'

const idSchema = z.string().uuid()

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { supabase, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (!(await isAdmin(supabase, user.id))) {
    return { supabase, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { supabase, response: null }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const { supabase, response } = await requireAdmin()
  if (response) return response

  const { data: run, error: runError } = await supabase
    .from('import_runs')
    .select('*')
    .eq('id', id)
    .single()

  if (runError) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: rows, error: rowsError } = await supabase
    .from('import_rows')
    .select('*')
    .eq('import_run_id', id)
    .order('row_number', { ascending: true })

  if (rowsError) return NextResponse.json({ error: 'Database error' }, { status: 500 })

  return NextResponse.json({ data: { run, rows: rows ?? [] } })
}
