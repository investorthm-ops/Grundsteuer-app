import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { watchlistParamsSchema } from '@/lib/validation/watchlist'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ municipalityId: string }> }
) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = watchlistParamsSchema.safeParse(await params)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('user_watchlist')
    .delete()
    .eq('user_id', user.id)
    .eq('municipality_id', parsed.data.municipalityId)

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}
