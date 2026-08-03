import { createClient } from '@supabase/supabase-js'

/**
 * Returns a Supabase client with the service role key.
 * ONLY use this in server-side code (Route Handlers, Server Actions).
 * Never expose the service role key to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.',
    )
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      // Next.js patches global fetch and caches GET responses in route
      // handlers by default (Data Cache) — which froze stale advisor rows
      // (e.g. pre-branding snapshots) across requests and deploys.
      // Force every Supabase query to bypass that cache.
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  })
}
