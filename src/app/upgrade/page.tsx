'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

function CheckIcon({ muted = false }: { muted?: boolean }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${muted ? 'text-forest-500' : 'text-forest-700'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
    </svg>
  )
}

const PLANS = [
  {
    id: 'solo' as const,
    name: 'CalibrateIQ Solo',
    price: 9,
    description: 'Everything you need to profile every client — cancel anytime.',
    users: '1 advisor',
    popular: false,
    features: [
      'Unlimited client questionnaires via shareable link',
      'Dual-score risk profiling (capacity + tolerance)',
      'Auto-generated Investment Policy Statements',
      'Print-ready PDF export with your firm branding',
      'Custom brand colors, logo, and firm name',
      'Advisor-configured investment preferences',
      'Household reporting for couples',
    ],
  },
  {
    id: 'team' as const,
    name: 'CalibrateIQ Team',
    price: 27,
    description: 'All Solo features, shared across your advisory team.',
    users: 'Up to 10 advisors',
    popular: true,
    features: [
      'Everything in Solo',
      'Up to 9 additional team members',
      'Each advisor sees only their own clients',
      'Shared firm branding, logo, and settings',
      'Admin can view and support any team member',
    ],
  },
  {
    id: 'plus' as const,
    name: 'CalibrateIQ Plus',
    price: 59,
    description: 'Scale your practice across a large advisory team.',
    users: 'Up to 25 advisors',
    popular: false,
    features: [
      'Everything in Team',
      'Up to 24 additional team members',
      'Priority support',
    ],
  },
]

function daysLeft(trialEndsAt: string | null | undefined): number | null {
  if (!trialEndsAt) return null
  const ms = new Date(trialEndsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

export default function UpgradePage() {
  const router   = useRouter()
  const supabase = createClient()

  const [advisor, setAdvisor]       = useState<Advisor | null>(null)
  const [loading, setLoading]       = useState(true)
  const [checkingPlan, setCheckingPlan] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('advisors')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // If they already have access, send them to the dashboard
      if (data?.subscription_status === 'active') {
        router.replace('/dashboard')
        return
      }

      setAdvisor(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleSubscribe = async (planId: 'solo' | 'team' | 'plus') => {
    setCheckingPlan(planId)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const { url, error } = await res.json()
      if (error || !url) { alert(error || 'Unable to start checkout. Please try again.'); setCheckingPlan(null); return }
      window.location.href = url
    } catch {
      alert('Something went wrong. Please try again.')
      setCheckingPlan(null)
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

  const days     = daysLeft(advisor?.trial_ends_at)
  const isExpired = days === 0

  const bannerLabel = advisor?.trial_ends_at == null
    ? 'Subscription required to continue'
    : isExpired
      ? 'Your trial has ended — choose a plan to keep access'
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
        <button onClick={handleSignOut} className="text-sm text-forest-600 hover:text-forest-900 font-medium">
          Sign out
        </button>
      </nav>

      {/* Content */}
      <div className="flex-1 px-4 py-12">
        <div className="max-w-5xl mx-auto">

          {/* Banner */}
          <div className={`rounded-xl border px-4 py-3 text-sm font-medium mb-10 text-center ${bannerColor}`}>
            {bannerLabel}
          </div>

          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-forest-900 mb-2">Choose your plan</h1>
            <p className="text-forest-600">All plans include a 7-day free trial. No credit card required to start.</p>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border shadow-elevated overflow-hidden flex flex-col ${
                  plan.popular ? 'border-forest-600 ring-2 ring-forest-600' : 'border-cream-300'
                }`}
              >
                {plan.popular && (
                  <div className="bg-forest-700 text-cream-100 text-xs font-bold uppercase tracking-widest text-center py-1.5">
                    Most Popular
                  </div>
                )}

                {/* Header */}
                <div className={`px-6 pt-6 pb-5 ${plan.popular ? 'bg-forest-900' : 'bg-white border-b border-cream-200'}`}>
                  <div className={`text-xs font-semibold uppercase tracking-widest mb-2 ${plan.popular ? 'text-forest-300' : 'text-forest-500'}`}>
                    {plan.users}
                  </div>
                  <div className={`text-sm font-semibold mb-3 ${plan.popular ? 'text-forest-300' : 'text-forest-700'}`}>
                    {plan.name}
                  </div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className={`text-4xl font-bold tracking-tight ${plan.popular ? 'text-white' : 'text-forest-900'}`}>
                      ${plan.price}
                    </span>
                    <span className={`mb-1.5 ${plan.popular ? 'text-forest-300' : 'text-forest-500'}`}>/month</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${plan.popular ? 'text-forest-300' : 'text-forest-500'}`}>
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <div className="px-6 py-5 flex-1">
                  <ul className="space-y-2.5">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-forest-800">
                        <CheckIcon />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={checkingPlan !== null}
                    className={`w-full font-semibold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 ${
                      plan.popular
                        ? 'bg-forest-900 hover:bg-forest-800 text-cream-100'
                        : 'bg-cream-200 hover:bg-cream-300 text-forest-900'
                    }`}
                  >
                    {checkingPlan === plan.id ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Redirecting…
                      </>
                    ) : (
                      <>Subscribe for ${plan.price}/mo →</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-forest-500 mt-8">
            Secure checkout via Stripe · Cancel anytime · Questions?{' '}
            <a href="mailto:support@calibrateiq.app" className="underline hover:text-forest-700">
              support@calibrateiq.app
            </a>
          </p>

        </div>
      </div>

    </div>
  )
}
