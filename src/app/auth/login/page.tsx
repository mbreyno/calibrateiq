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

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  // Sign-in state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Forgot-password state
  const [forgotMode, setForgotMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setResetError(null)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${appUrl}/auth/callback?next=/auth/reset-password`,
    })

    setResetLoading(false)
    if (error) {
      setResetError(error.message)
    } else {
      setResetSent(true)
    }
  }

  const leftPanel = (
    <div className="hidden lg:flex w-1/2 bg-forest-900 flex-col justify-between p-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-forest-700/60 via-transparent to-transparent pointer-events-none" />
      <div className="relative">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-xl font-bold text-cream-100 tracking-tight">CalibrateIQ</span>
        </Link>
      </div>
      <div className="relative">
        <blockquote className="text-2xl font-semibold text-cream-100 leading-snug mb-4">
          "Understanding a client's true risk profile is the foundation of every good financial plan."
        </blockquote>
        <p className="text-forest-400 text-sm">CalibrateIQ makes that foundation measurable.</p>
      </div>
      <div className="relative flex gap-3">
        {['Conservative','Moderate','Aggressive'].map(cat => (
          <div key={cat} className="bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-forest-300">
            {cat}
          </div>
        ))}
      </div>
    </div>
  )

  // ── Forgot password view ──────────────────────────────────────────────────
  if (forgotMode) {
    return (
      <div className="min-h-screen bg-cream-100 flex">
        {leftPanel}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24">
          <div className="max-w-sm w-full mx-auto">
            <div className="lg:hidden mb-8">
              <Link href="/" className="flex items-center gap-2">
                <LogoMark />
                <span className="font-bold text-forest-900">CalibrateIQ</span>
              </Link>
            </div>

            {resetSent ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-forest-100 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-forest-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-forest-900 mb-2">Check your email</h1>
                <p className="text-forest-700/70 text-sm mb-6">
                  We sent a password reset link to <span className="font-medium text-forest-900">{resetEmail}</span>. Click the link in that email to set a new password.
                </p>
                <button
                  type="button"
                  onClick={() => { setForgotMode(false); setResetSent(false); setResetEmail('') }}
                  className="text-sm font-semibold text-forest-900 hover:underline"
                >
                  ← Back to sign in
                </button>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-forest-900 mb-1">Reset your password</h1>
                <p className="text-forest-700/70 text-sm mb-8">
                  Enter the email address on your account and we'll send you a reset link.
                </p>

                {resetError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                    {resetError}
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-forest-800 mb-1.5">Email address</label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="you@yourfirm.com"
                      className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white text-forest-900 placeholder-forest-700/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-forest-900 text-cream-100 font-semibold text-sm py-3.5 rounded-xl hover:bg-forest-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Sending…
                      </>
                    ) : 'Send reset link'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => { setForgotMode(false); setResetError(null) }}
                  className="block text-center text-sm font-semibold text-forest-900 hover:underline mt-6"
                >
                  ← Back to sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Sign in view ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream-100 flex">
      {leftPanel}

      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24">
        <div className="max-w-sm w-full mx-auto">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <LogoMark />
              <span className="font-bold text-forest-900">CalibrateIQ</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-forest-900 mb-1">Welcome back</h1>
          <p className="text-forest-700/70 text-sm mb-8">
            Sign in to your advisor account.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-forest-800 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@yourfirm.com"
                className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white text-forest-900 placeholder-forest-700/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-forest-800">Password</label>
                <button
                  type="button"
                  onClick={() => { setForgotMode(true); setResetEmail(email) }}
                  className="text-xs text-forest-700 hover:text-forest-900"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
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
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-forest-700/70 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-semibold text-forest-900 hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
