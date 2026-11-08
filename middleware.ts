import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const protectedPrefixes = [
    '/dashboard', '/admin', '/announcements', '/assignments', '/homework',
    '/exams', '/what-was-taught', '/what-did-i-miss', '/attendance', '/notifications',
    '/change-password',
  ]
  const isProtected = protectedPrefixes.some((p) => request.nextUrl.pathname.startsWith(p))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Force a password change before anything else if the account still has a
  // temporary/shared password (set by an admin during bulk-add or reset).
  if (isProtected && user && request.nextUrl.pathname !== '/change-password') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, must_change_password')
      .eq('auth_user_id', user.id)
      .single()

    if (profile?.must_change_password) {
      return NextResponse.redirect(new URL('/change-password', request.url))
    }

    // Role gate for /admin/* — students cannot access admin routes even by typing the URL.
    if (request.nextUrl.pathname.startsWith('/admin') && (!profile || profile.role === 'student')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
