import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { watchlistCreateSchema } from '@/lib/validation/watchlist'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('user_watchlist')
    .select('id, municipality_id, created_at, municipality:municipalities(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })

  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = watchlistCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { data: municipality } = await supabase
    .from('municipalities')
    .select('id')
    .eq('id', parsed.data.municipalityId)
    .maybeSingle()

  if (!municipality) {
    return NextResponse.json({ error: 'Municipality not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('user_watchlist')
    .upsert(
      { user_id: user.id, municipality_id: parsed.data.municipalityId },
      { onConflict: 'user_id,municipality_id' }
    )
    .select('id, municipality_id, created_at, municipality:municipalities(*)')
    .single()

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })

  return NextResponse.json({ data }, { status: 201 })
}
