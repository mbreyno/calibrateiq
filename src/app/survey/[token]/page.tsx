'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { QUESTIONS, calculateAgeScore } from '@/lib/scoring'
import type { Advisor, InvestmentPreference } from '@/types'

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full h-1.5 bg-cream-300 rounded-full overflow-hidden">
      <div className="h-full bg-forest-700 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  )
}

// ─── Brand header ─────────────────────────────────────────────────────────────
function BrandHeader({ advisor }: { advisor: Advisor | null }) {
  return (
    <header className="bg-white border-b border-cream-300 px-5 py-4">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        {advisor?.logo_url ? (
          <Image src={advisor.logo_url} alt={`${advisor.firm_name} logo`} width={36} height={36} className="rounded-lg object-contain" />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-forest-200 flex items-center justify-center text-sm font-bold text-forest-800">
            {advisor?.firm_name?.[0] ?? 'A'}
          </div>
        )}
        <div>
          <div className="text-sm font-bold text-forest-900">{advisor?.firm_name ?? 'Investment Questionnaire'}</div>
          <div className="text-xs text-forest-500">Investment Profile Questionnaire</div>
        </div>
      </div>
    </header>
  )
}

// ─── Synthetic question type ─────────────────────────────────────────────────
const PREFS_QUESTION_ID = '__preferences__'

type Step = 'details' | 'questions' | 'review'

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MasterSurveyPage() {
  const { token } = useParams<{ token: string }>()
  const supabase = createClient()

  const [advisor, setAdvisor] = useState<Advisor | null>(null)
  const [preferences, setPreferences] = useState<InvestmentPreference[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Personal details
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('')

  // Questionnaire state
  const [step, setStep] = useState<Step>('details')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])
  const [comments, setComments] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: advisorData } = await supabase
        .from('advisors')
        .select('*')
        .eq('master_token', token)
        .single()

      if (!advisorData) { setNotFound(true); setLoading(false); return }
      setAdvisor(advisorData)

      // Load this advisor's investment preferences
      const { data: prefs } = await supabase
        .from('investment_preferences')
        .select('*')
        .eq('advisor_id', advisorData.id)
        .order('sort_order', { ascending: true })
      setPreferences(prefs ?? [])

      setLoading(false)
    }
    load()
  }, [token])

  // Build the ordered list of radio questions from QUESTIONS (q2–q8, skip q1 which uses DOB)
  // Then append the dynamic preferences question at the end if any preferences exist
  const radioQuestions = QUESTIONS.filter(q => q.type === 'radio' && q.id !== 'q1')

  const questionOrder: Array<{ id: string; category: string; type: string; question: string }> = [
    ...radioQuestions,
    ...(preferences.length > 0 ? [{
      id: PREFS_QUESTION_ID,
      category: 'informational',
      type: 'preferences',
      question: 'Please select if any of the following areas are important to you:',
    }] : []),
  ]

  const currentQuestion = questionOrder[currentQ]

  const handleAnswer = (qId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [qId]: score }))
  }

  const handleTogglePreference = (prefId: string) => {
    setSelectedPreferences(prev =>
      prev.includes(prefId) ? prev.filter(id => id !== prefId) : [...prev, prefId]
    )
  }

  const handleNext = () => {
    if (currentQ < questionOrder.length - 1) {
      setCurrentQ(prev => prev + 1)
    } else {
      setStep('review')
    }
  }

  const handleBack = () => {
    if (currentQ > 0) setCurrentQ(prev => prev - 1)
    else setStep('details')
  }

  const canContinue = () => {
    if (currentQuestion.type === 'preferences') return true // optional
    return answers[currentQuestion.id] !== undefined
  }

  const handleSubmit = async () => {
    if (!advisor) return
    setSubmitting(true)
    setError(null)

    // Create the client record
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        advisor_id: advisor.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        date_of_birth: dob || null,
        status: 'completed',
      })
      .select('id')
      .single()

    if (clientError || !newClient) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    // Save questionnaire responses
    const { error: respError } = await supabase
      .from('questionnaire_responses')
      .insert({
        client_id: newClient.id,
        q1: calculateAgeScore(dob),
        q2: answers['q2'] ?? null,
        q3: answers['q3'] ?? null,
        q4: answers['q4'] ?? null,
        q5: answers['q5'] ?? null,
        q6: answers['q6'] ?? null,
        q8: answers['q8'] ?? null,
        selected_preferences: selectedPreferences,
        comments,
      })

    if (respError) {
      await supabase.from('clients').delete().eq('id', newClient.id)
      setError('Something went wrong saving your responses. Please try again.')
      setSubmitting(false)
      return
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-forest-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-forest-600">Loading questionnaire…</p>
        </div>
      </div>
    )
  }

  // ── Not found ────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-forest-900 mb-2">Link not found</h1>
          <p className="text-forest-600 text-sm">This questionnaire link is invalid. Please contact your advisor for a new link.</p>
        </div>
      </div>
    )
  }

  // ── Thank you ────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col">
        <BrandHeader advisor={advisor} />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-sm text-center">
            <div className="w-20 h-20 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-forest-700" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-forest-900 mb-3">Thank you, {firstName}!</h1>
            <p className="text-forest-700 leading-relaxed">
              Your investment profile questionnaire has been submitted. Your advisor at{' '}
              <strong>{advisor?.firm_name || 'your advisory firm'}</strong> will review your responses and be in touch shortly.
            </p>
          </div>
        </div>
        <footer className="py-5 text-center text-xs text-forest-500 border-t border-cream-300">
          Powered by <strong>CalibrateIQ</strong>
        </footer>
      </div>
    )
  }

  // ── Personal details step ────────────────────────────────────────
  if (step === 'details') {
    const isValid = firstName.trim() && lastName.trim() && email.trim() && dob
    const totalQs = radioQuestions.length + (preferences.length > 0 ? 1 : 0)
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col">
        <BrandHeader advisor={advisor} />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-2xl border border-cream-300 shadow-elevated p-8">
              <h1 className="text-2xl font-bold text-forest-900 mb-2">Investment Profile Questionnaire</h1>
              <p className="text-forest-600 text-sm leading-relaxed mb-6">
                This short questionnaire helps <strong>{advisor?.firm_name || 'your advisor'}</strong> understand your
                investment goals, time horizon, and comfort with risk. Please start by entering your details below.
              </p>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-forest-800 mb-1.5">First name *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 placeholder-forest-700/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-forest-800 mb-1.5">Last name *</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Smith"
                      className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 placeholder-forest-700/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-800 mb-1.5">Email address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 placeholder-forest-700/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-800 mb-1.5">Date of birth *</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-cream-100 rounded-xl p-4 border border-cream-200 mb-6">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[['~5 min', 'Completion time'], [String(totalQs), 'Questions'], ['100%', 'Confidential']].map(([val, lbl]) => (
                    <div key={lbl}>
                      <div className="text-lg font-bold text-forest-900">{val}</div>
                      <div className="text-xs text-forest-600">{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep('questions')}
                disabled={!isValid}
                className={`w-full font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  isValid
                    ? 'bg-forest-900 text-cream-100 hover:bg-forest-800'
                    : 'bg-cream-300 text-forest-500 cursor-not-allowed'
                }`}
              >
                Begin questionnaire
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <footer className="py-5 text-center text-xs text-forest-500 border-t border-cream-300">
          Powered by <strong>CalibrateIQ</strong>
        </footer>
      </div>
    )
  }

  // ── Review step ──────────────────────────────────────────────────
  if (step === 'review') {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col">
        <BrandHeader advisor={advisor} />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-2xl border border-cream-300 shadow-elevated p-8">
              <div className="w-12 h-12 bg-forest-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-forest-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-forest-900 mb-2">Almost done!</h2>
              <p className="text-forest-600 text-sm mb-5">
                Feel free to share any comments, questions, or expectations with your advisor before you submit.
              </p>

              <div className="mb-5">
                <label className="block text-sm font-medium text-forest-800 mb-2">
                  Comments or questions <span className="text-forest-500 font-normal">(optional)</span>
                </label>
                <textarea
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  rows={4}
                  placeholder="Please feel free to add any comments, questions, or anything that will help communicate your expectations for your investments…"
                  className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 text-sm leading-relaxed placeholder-forest-700/40 focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent resize-none"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('questions'); setCurrentQ(questionOrder.length - 1) }}
                  className="flex-1 border border-cream-300 text-forest-700 font-medium text-sm py-3 rounded-xl hover:bg-cream-50"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-forest-900 text-cream-100 font-semibold text-sm py-3 rounded-xl hover:bg-forest-800 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Submitting…
                    </>
                  ) : 'Submit questionnaire'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <footer className="py-5 text-center text-xs text-forest-500 border-t border-cream-300">
          Powered by <strong>CalibrateIQ</strong>
        </footer>
      </div>
    )
  }

  // ── Questions step ───────────────────────────────────────────────
  const isPrefsQuestion = currentQuestion?.id === PREFS_QUESTION_ID

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <BrandHeader advisor={advisor} />

      <div className="sticky top-0 z-10 bg-cream-100/90 backdrop-blur-sm border-b border-cream-300 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between text-xs text-forest-600 mb-2">
            <span>Question {currentQ + 1} of {questionOrder.length}</span>
            <span>{Math.round(((currentQ + 1) / questionOrder.length) * 100)}% complete</span>
          </div>
          <ProgressBar current={currentQ + 1} total={questionOrder.length} />
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="max-w-lg w-full">
          {currentQuestion && (
            <div className="bg-white rounded-2xl border border-cream-300 shadow-elevated p-6 sm:p-8">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-600 uppercase tracking-wider mb-4">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  currentQuestion.category === 'capacity' ? 'bg-forest-700'
                  : currentQuestion.category === 'tolerance' ? 'bg-gold-500'
                  : 'bg-forest-400'
                }`} />
                {currentQuestion.category === 'capacity' ? 'Risk Capacity'
                  : currentQuestion.category === 'tolerance' ? 'Risk Preference'
                  : 'Investment Preferences'}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-forest-900 mb-6 leading-snug">
                {currentQuestion.question}
              </h2>

              {/* Radio question */}
              {currentQuestion.type === 'radio' && 'options' in currentQuestion && (
                <div className="space-y-2.5">
                  {(currentQuestion as typeof QUESTIONS[0] & { options: { label: string; score: number }[] }).options.map((opt) => {
                    const isSelected = answers[currentQuestion.id] === opt.score
                    return (
                      <button
                        key={opt.label}
                        onClick={() => handleAnswer(currentQuestion.id, opt.score)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-forest-900 border-forest-900 text-cream-100 shadow-sm'
                            : 'bg-cream-50 border-cream-300 text-forest-900 hover:border-forest-500 hover:bg-cream-100'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-cream-300 bg-cream-300' : 'border-forest-400'
                        }`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-forest-900" />}
                        </div>
                        <span className="text-sm font-medium leading-snug">{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Dynamic preferences question */}
              {isPrefsQuestion && (
                <div className="space-y-2.5">
                  <p className="text-sm text-forest-600 mb-3">Select all that apply (optional).</p>
                  {preferences.map((pref) => {
                    const isChecked = selectedPreferences.includes(pref.id)
                    return (
                      <button
                        key={pref.id}
                        onClick={() => handleTogglePreference(pref.id)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
                          isChecked
                            ? 'bg-forest-900 border-forest-900 text-cream-100'
                            : 'bg-cream-50 border-cream-300 text-forest-900 hover:border-forest-500 hover:bg-cream-100'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isChecked ? 'border-cream-300 bg-cream-100' : 'border-forest-400'
                        }`}>
                          {isChecked && (
                            <svg className="w-3 h-3 text-forest-900" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 6l3 3 5-5"/>
                            </svg>
                          )}
                        </div>
                        <span className="text-xl mr-1">{pref.icon}</span>
                        <span className="text-sm font-medium">{pref.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              <div className="flex gap-3 mt-7">
                <button
                  onClick={handleBack}
                  className="flex-none border border-cream-300 text-forest-700 font-medium text-sm px-5 py-3 rounded-xl hover:bg-cream-100"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canContinue()}
                  className={`flex-1 font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                    canContinue()
                      ? 'bg-forest-900 text-cream-100 hover:bg-forest-800'
                      : 'bg-cream-300 text-forest-500 cursor-not-allowed'
                  }`}
                >
                  {currentQ === questionOrder.length - 1 ? 'Continue to review' : 'Next question'}
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="py-5 text-center text-xs text-forest-500 border-t border-cream-300">
        Powered by <strong>CalibrateIQ</strong>
      </footer>
    </div>
  )
}
