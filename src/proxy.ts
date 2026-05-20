import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

type SupabaseCookie = {
  name: string
  value: string
  options: CookieOptions
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: SupabaseCookie[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl
  const isAdminPath = pathname.startsWith('/admin')
  const isDatabasePath = pathname.startsWith('/datenbank')
  const isWatchlistPath = pathname.startsWith('/watchlist')
  const isCalculatorPath = pathname.startsWith('/rechner')

  if ((isAdminPath || isDatabasePath || isWatchlistPath || isCalculatorPath) && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname + search)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdminPath && user) {
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (roleRow?.role !== 'admin') {
      return NextResponse.redirect(new URL('/datenbank', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/datenbank/:path*', '/watchlist/:path*', '/rechner/:path*', '/admin/:path*'],
}
