'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Advisor } from '@/types'

// ─── Logo mark ────────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#1b4332" />
      <path d="M8 28 L16 18 L22 23 L30 13" stroke="#d4a017" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="30" cy="13" r="3" fill="#d4a017"/>
      <path d="M8 32 L32 32" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-forest-700 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
    </svg>
  )
}

const FEATURES = [
  'Unlimited client questionnaires via shareable link',
  'Dual-score risk profiling (capacity + tolerance)',
  'Auto-generated Investment Policy Statements',
  'Print-ready PDF export with your firm branding',
  'Custom brand colors, logo, and firm name',
  'Advisor-configured investment preferences',
  'Household reporting for couples',
]

function daysLeft(trialEndsAt: string | null | undefined): number | null {
  if (!trialEndsAt) return null
  const ms = new Date(trialEndsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

export default function UpgradePage() {
  const router   = useRouter()
  const params   = useSearchParams()
  const supabase = createClient()

  const [advisor, setAdvisor]   = useState<Advisor | null>(null)
  const [loading, setLoading]   = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('advisors')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // If they somehow already have access, send them to the dashboard
      if (data?.subscription_status === 'active') {
        router.replace('/dashboard')
        return
      }

      setAdvisor(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleSubscribe = async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/create-checkout', { method: 'POST' })
      const { url, error } = await res.json()
      if (error || !url) { alert(error || 'Unable to start checkout. Please try again.'); setChecking(false); return }
      window.location.href = url
    } catch {
      alert('Something went wrong. Please try again.')
      setChecking(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-forest-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const days  = daysLeft(advisor?.trial_ends_at)
  const isExpired = days === 0

  // ── Banner text depends on trial state ───────────────────────────────────
  const bannerLabel = advisor?.trial_ends_at == null
    ? 'Subscription required'
    : isExpired
      ? 'Your trial has ended'
      : `${days} day${days === 1 ? '' : 's'} left in your trial`

  const bannerColor = advisor?.trial_ends_at == null || isExpired
    ? 'bg-red-50 border-red-200 text-red-700'
    : days! <= 2
      ? 'bg-amber-50 border-amber-200 text-amber-700'
      : 'bg-forest-50 border-forest-200 text-forest-700'

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">

      {/* Nav */}
      <nav className="bg-white border-b border-cream-300 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-xl font-bold text-forest-900 tracking-tight">CalibrateIQ</span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-forest-600 hover:text-forest-900 font-medium"
        >
          Sign out
        </button>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full">

          {/* Trial / expiry banner */}
          <div className={`rounded-xl border px-4 py-3 text-sm font-medium mb-8 text-center ${bannerColor}`}>
            {bannerLabel}
          </div>

          {/* Pricing card */}
          <div className="bg-white rounded-2xl border border-cream-300 shadow-elevated overflow-hidden">

            {/* Header */}
            <div className="bg-forest-900 px-8 pt-8 pb-6 text-white">
              <div className="text-sm font-semibold text-forest-300 uppercase tracking-widest mb-3">
                Advisor Plan
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-bold tracking-tight">$9</span>
                <span className="text-forest-300 mb-2 text-lg">/ month</span>
              </div>
              <p className="text-forest-300 text-sm">
                Everything you need to profile every client — cancel anytime.
              </p>
            </div>

            {/* Features */}
            <div className="px-8 py-6 border-b border-cream-200">
              <ul className="space-y-3">
                {FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-forest-800">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="px-8 py-6">
              <button
                onClick={handleSubscribe}
                disabled={checking}
                className="w-full bg-forest-900 hover:bg-forest-800 disabled:opacity-60 text-cream-100 font-semibold text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {checking ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Redirecting to checkout…
                  </>
                ) : (
                  <>Subscribe for $9/month &rarr;</>
                )}
              </button>
              <p className="text-center text-xs text-forest-500 mt-3">
                Secure checkout via Stripe &middot; Cancel anytime
              </p>
            </div>

          </div>

          <p className="text-center text-xs text-forest-500 mt-6">
            Questions? Email{' '}
            <a href="mailto:support@calibrateiq.app" className="underline hover:text-forest-700">
              support@calibrateiq.app
            </a>
          </p>

        </div>
      </div>

    </div>
  )
}
