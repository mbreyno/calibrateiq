'use client'

/**
 * /auth/confirm
 *
 * Landing page for email-based auth links (invites, magic links, password resets).
 * These links carry the session in the URL hash (#access_token=...) which is
 * invisible to server-side routes. This client component lets the Supabase browser
 * client parse the hash automatically, then forwards the user to the dashboard.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LogoMark() {
  return (
    <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#1b4332"/>
      <path d="M8 28 L16 18 L22 23 L30 13" stroke="#d4a017" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="30" cy="13" r="3" fill="#d4a017"/>
      <path d="M8 32 L32 32" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

export default function ConfirmPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuth = async () => {
      // Invite links carry the session in the URL hash (#access_token=...&refresh_token=...)
      // which is only accessible in the browser. Parse and set the session explicitly.
      const hash = window.location.hash.slice(1)
      const params = new URLSearchParams(hash)
      const accessToken  = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        if (!error) {
          window.history.replaceState(null, '', window.location.pathname)
          router.replace('/dashboard')
          return
        }
        console.error('confirm: setSession error', error)
      }

      // Fallback — session may already be established (e.g. revisiting the page)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/dashboard')
      } else {
        router.replace('/auth/login?error=invite_failed')
      }
    }

    handleAuth()
  }, [])

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center gap-4">
      <LogoMark />
      <p className="text-sm text-forest-600 font-medium">Setting up your account…</p>
      <div className="w-6 h-6 border-2 border-forest-700 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
