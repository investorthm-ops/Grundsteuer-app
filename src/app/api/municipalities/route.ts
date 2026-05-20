import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/supabase/is-admin'
import {
  listQuerySchema,
  municipalityCreateSchema,
} from '@/lib/validation/municipality'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = Object.fromEntries(request.nextUrl.searchParams.entries())
  const parsed = listQuerySchema.safeParse(params)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { page, pageSize, bundesland, kreis, q, sortBy, sortDir } = parsed.data
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const ascending = sortDir === 'asc'

  let query = supabase
    .from('municipalities')
    .select('*', { count: 'exact' })
    .range(from, to)

  if (bundesland) query = query.eq('bundesland', bundesland)
  if (kreis) query = query.eq('kreis', kreis)
  if (q) query = query.ilike('name', `%${q}%`)

  if (sortBy) {
    query = query.order(sortBy, { ascending, nullsFirst: false }).order('name', {
      ascending: true,
    })
  } else {
    query = query.order('bundesland', { ascending: true }).order('name', {
      ascending: true,
    })
  }

  const { data, count, error } = await query
  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = municipalityCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('municipalities')
    .insert({ ...parsed.data, created_by: user.id })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
