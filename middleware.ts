import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: object }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/auth/login') ||
    request.nextUrl.pathname.startsWith('/auth/signup')

  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  const isQuestionnaire = request.nextUrl.pathname.startsWith('/q/')

  // Protect dashboard routes
  if (isDashboard && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from auth pages
  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Questionnaire pages are always public
  if (isQuestionnaire) {
    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Exclude static assets, images, and the Stripe webhook endpoint.
    // The webhook must receive the raw, unmodified request body for signature
    // verification — running middleware auth checks against it is both wasteful
    // and risks body-stream issues in certain Next.js edge cases.
    '/((?!_next/static|_next/image|favicon.ico|public|api/stripe-webhook).*)',
  ],
}
