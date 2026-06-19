'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    // If email confirmation is disabled in Supabase, redirect immediately
    if (data.session) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    // Email confirmation required
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-forest-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-forest-900 mb-2">Check your email</h1>
          <p className="text-forest-700/70 mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and get started.
          </p>
          <Link href="/auth/login" className="text-sm font-semibold text-forest-900 hover:underline">
            Return to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-100 flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-forest-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-forest-700/60 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-xl font-bold text-cream-100 tracking-tight">CalibrateIQ</span>
          </Link>
        </div>
        <div className="relative space-y-4">
          {['Send branded questionnaires in under 2 minutes','Dual-score risk profiles built automatically','IPS generated and ready to export instantly'].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-gold-400" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-forest-200 text-sm">{item}</p>
            </div>
          ))}
        </div>
        <p className="relative text-forest-500 text-xs">7-day free trial · $9/month · Cancel anytime</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12">
        <div className="max-w-sm w-full mx-auto">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <LogoMark />
              <span className="font-bold text-forest-900">CalibrateIQ</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-forest-900 mb-1">Create your account</h1>
          <p className="text-forest-700/70 text-sm mb-8">Start your 7-day free trial.</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-forest-800 mb-1.5">First name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Jane"
                  className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white text-forest-900 placeholder-forest-700/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-800 mb-1.5">Last name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Smith"
                  className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white text-forest-900 placeholder-forest-700/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-800 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane@westbrookwealth.com"
                className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white text-forest-900 placeholder-forest-700/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-800 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white text-forest-900 placeholder-forest-700/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-900 text-cream-100 font-semibold text-sm py-3.5 rounded-xl hover:bg-forest-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account…
                </>
              ) : 'Create free account'}
            </button>
          </form>

          <p className="text-center text-xs text-forest-700/60 mt-4">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-forest-800">Terms of Service</Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-forest-800">Privacy Policy</Link>.
          </p>

          <p className="text-center text-sm text-forest-700/70 mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-forest-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
