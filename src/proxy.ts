import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getAccessState } from '@/lib/supabase/access'

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
  const isComparePath = pathname.startsWith('/vergleich')
  const isAccessBlockedPath = pathname.startsWith('/zugang-gesperrt')
  const isProtectedApiPath =
    pathname.startsWith('/api/municipalities') ||
    pathname.startsWith('/api/watchlist') ||
    pathname.startsWith('/api/exports')
  const isAppPath = isDatabasePath || isWatchlistPath || isCalculatorPath || isComparePath
  const isProtectedPath = isAdminPath || isAppPath

  if ((isProtectedPath || isProtectedApiPath) && !user) {
    if (isProtectedApiPath) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
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

  if ((isAppPath || isProtectedApiPath) && user && !isAccessBlockedPath) {
    const access = await getAccessState(supabase, user.id, {
      adminBypass: !isAppPath,
    })
    if (!access.allowed) {
      if (isProtectedApiPath) {
        return NextResponse.json({ error: 'Access inactive', reason: access.reason }, { status: 403 })
      }
      const blockedUrl = new URL('/zugang-gesperrt', request.url)
      blockedUrl.searchParams.set('reason', access.reason)
      return NextResponse.redirect(blockedUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/datenbank/:path*',
    '/watchlist/:path*',
    '/rechner/:path*',
    '/vergleich/:path*',
    '/admin/:path*',
    '/api/municipalities/:path*',
    '/api/watchlist/:path*',
    '/api/exports/:path*',
  ],
}
