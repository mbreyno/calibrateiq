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

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2500)
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 flex">
      {/* Left panel */}
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

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24">
        <div className="max-w-sm w-full mx-auto">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <LogoMark />
              <span className="font-bold text-forest-900">CalibrateIQ</span>
            </Link>
          </div>

          {done ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-forest-100 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-forest-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-forest-900 mb-2">Password updated</h1>
              <p className="text-forest-700/70 text-sm">Your password has been changed. Taking you to your dashboard…</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-forest-900 mb-1">Set a new password</h1>
              <p className="text-forest-700/70 text-sm mb-8">
                Choose a strong password for your advisor account.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-forest-800 mb-1.5">New password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white text-forest-900 placeholder-forest-700/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-800 mb-1.5">Confirm new password</label>
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
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
                      Updating…
                    </>
                  ) : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
