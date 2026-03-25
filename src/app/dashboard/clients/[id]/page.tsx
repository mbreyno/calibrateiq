'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { calculateRiskProfile, CATEGORY_COLORS, CATEGORY_DESCRIPTIONS, CATEGORY_SCORE_RANGES, QUESTIONS } from '@/lib/scoring'
import type { RiskCategory } from '@/types'
import type { Client, Advisor, QuestionnaireResponse, RiskProfile } from '@/types'

// ─── Sub-components ──────────────────────────────────────────────────────────

const ShieldIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd"/>
  </svg>
)

const SlidersIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"/>
  </svg>
)

function ScoreGauge({ score, max, label, color, primary = false }: { score: number; max: number; label: string; color: string; primary?: boolean }) {
  const pct = Math.round((score / max) * 100)
  if (primary) {
    return (
      <div className="flex-1 bg-white rounded-2xl border-2 shadow-card p-6" style={{ borderColor: color }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
            <ShieldIcon />{label}
          </span>
          <span className="text-xs text-forest-500 font-medium">Primary measure</span>
        </div>
        <div className="flex items-end gap-2 mb-4">
          <span className="text-6xl font-bold text-forest-900 leading-none">{score}</span>
          <span className="text-base text-forest-400 mb-1">/ {max}</span>
        </div>
        <div className="h-3 bg-cream-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      </div>
    )
  }
  return (
    <div className="flex-1 bg-cream-50 rounded-2xl border border-cream-300 p-5">
      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-400 uppercase tracking-wider mb-3">
        <SlidersIcon />{label}
      </div>
      <div className="flex items-end gap-2 mb-3">
        <span className="text-3xl font-bold text-forest-600">{score}</span>
        <span className="text-sm text-forest-400 mb-0.5">/ {max}</span>
      </div>
      <div className="h-2 bg-cream-300 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

// ─── Advisor Notes ────────────────────────────────────────────────────────────

function AdvisorNotes({ initialNotes, onSave }: { initialNotes: string; onSave: (notes: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialNotes)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave(value)
    setSaving(false)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-forest-900">Advisor Notes</h2>
        {!editing ? (
          <button onClick={() => setEditing(true)}
            className="text-xs font-semibold text-forest-600 hover:text-forest-900 border border-cream-300 px-3 py-1.5 rounded-lg hover:bg-cream-50 transition-colors">
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(false); setValue(initialNotes) }}
              className="text-xs font-semibold text-forest-500 hover:text-forest-700 border border-cream-300 px-3 py-1.5 rounded-lg hover:bg-cream-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="text-xs font-semibold bg-forest-900 text-cream-100 px-3 py-1.5 rounded-lg hover:bg-forest-800 disabled:opacity-60 transition-colors">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>
      {editing ? (
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={5}
          placeholder="Add notes about this client's investment goals, special circumstances, or anything relevant to their profile…"
          className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent resize-none"
        />
      ) : value ? (
        <p className="text-sm text-forest-700 leading-relaxed whitespace-pre-wrap">{value}</p>
      ) : (
        <p className="text-sm text-forest-400 italic">No notes yet. Click Edit to add advisor notes.</p>
      )}
      {saved && <p className="text-xs text-forest-500 mt-2">✓ Notes saved</p>}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

type Tab = 'overview' | 'profile'

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('overview')
  const [client, setClient] = useState<Client | null>(null)
  const [advisor, setAdvisor] = useState<Advisor | null>(null)
  const [responses, setResponses] = useState<QuestionnaireResponse | null>(null)
  const [profile, setProfile] = useState<RiskProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [household, setHousehold] = useState<{ id: string; name: string } | null>(null)
  const [advisorNotes, setAdvisorNotes] = useState('')

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [
      { data: clientData },
      { data: advisorData },
    ] = await Promise.all([
      supabase.from('clients').select('*, advisor_notes').eq('id', id).single(),
      supabase.from('advisors').select('*').eq('user_id', user.id).single(),
    ])

    setClient(clientData)
    setAdvisor(advisorData)
    setAdvisorNotes((clientData as { advisor_notes?: string | null })?.advisor_notes ?? '')

    if (clientData?.status === 'completed') {
      const { data: resp } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('client_id', id)
        .single()

      if (resp) {
        setResponses(resp)
        const p = calculateRiskProfile(resp)
        setProfile({ ...p, client_name: `${clientData.first_name} ${clientData.last_name}` } as RiskProfile & { client_name: string })
      }

    }

    // Check if this client is part of a household
    const { data: memberRow } = await supabase
      .from('household_members')
      .select('household_id, households(id, name)')
      .eq('client_id', id)
      .single()
    if (Array.isArray(memberRow?.households) && memberRow.households.length > 0) {
      const [hh] = memberRow.households as { id: string; name: string }[]
      setHousehold(hh)
    }

    setLoading(false)
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  if (loading) return (
    <div className="p-8 pt-24 lg:pt-8 flex items-center justify-center min-h-screen">
      <div className="text-forest-600 text-sm">Loading client data…</div>
    </div>
  )

  if (!client) return (
    <div className="p-8 pt-24 lg:pt-8">
      <p className="text-forest-700">Client not found.</p>
      <Link href="/dashboard/clients" className="text-forest-900 font-semibold underline mt-2 block">← Back to clients</Link>
    </div>
  )

  const categoryColor = profile ? CATEGORY_COLORS[profile.overall_category] : '#52b788'

  const handleSaveNotes = async (notes: string) => {
    await supabase.from('clients').update({ advisor_notes: notes } as never).eq('id', id)
    setAdvisorNotes(notes)
  }

  return (
    <div className="p-6 lg:p-8 pt-20 lg:pt-8">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <Link href="/dashboard/clients" className="mt-1 text-forest-600 hover:text-forest-900">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
            </svg>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-forest-900">{client.first_name} {client.last_name}</h1>
              {client.status === 'completed' ? (
                <span className="bg-forest-100 text-forest-800 text-xs font-semibold px-2.5 py-1 rounded-full">Complete</span>
              ) : (
                <span className="bg-gold-300/25 text-gold-700 text-xs font-semibold px-2.5 py-1 rounded-full">Awaiting Response</span>
              )}
            </div>
            <p className="text-sm text-forest-600 mt-0.5">{client.email}</p>
            {household && (
              <Link href={`/dashboard/households/${household.id}`}
                className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-forest-600 hover:text-forest-900 bg-forest-50 border border-forest-200 px-2.5 py-1 rounded-full transition-colors">
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-3h2v3a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                {household.name}
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-cream-200/60 p-1 rounded-xl mb-6 w-fit">
          {(['overview', 'profile'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              disabled={t !== 'overview' && client.status !== 'completed'}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t
                  ? 'bg-white text-forest-900 shadow-card'
                  : 'text-forest-600 hover:text-forest-800 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="space-y-5 max-w-2xl">
            <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
              <h2 className="font-semibold text-forest-900 mb-4">Client Information</h2>
              <dl className="space-y-3">
                {[
                  ['Full name', `${client.first_name} ${client.last_name}`],
                  ['Email', client.email],
                  ['Date of birth', client.date_of_birth ?? '—'],
                  ['Added', new Date(client.created_at).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-4 text-sm">
                    <dt className="w-32 flex-shrink-0 text-forest-500 font-medium">{label}</dt>
                    <dd className="text-forest-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {client.status === 'completed' && profile && (
              <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-forest-900">Risk Profile Summary</h2>
                  <span className="text-sm font-bold px-3 py-1 rounded-full border"
                    style={{ backgroundColor: `${categoryColor}18`, color: categoryColor, borderColor: `${categoryColor}40` }}>
                    {profile.overall_category}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setTab('profile')} className="flex-1 bg-forest-900 text-cream-100 text-sm font-semibold py-2.5 rounded-xl hover:bg-forest-800">
                    View full profile →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ──────────────────────────────────────── */}
        {tab === 'profile' && profile && responses && (
          <div className="space-y-5">
            {/* Category banner — full width */}
            <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: categoryColor }}>
              <div className="text-sm font-semibold opacity-80 mb-1">Overall Risk Category</div>
              <div className="text-3xl font-bold mb-2">{profile.overall_category}</div>
              <p className="text-sm opacity-85 leading-relaxed max-w-2xl">{CATEGORY_DESCRIPTIONS[profile.overall_category]}</p>
            </div>

            {/* Scores */}
            <div className="flex gap-4">
              <ScoreGauge score={profile.risk_capacity_score} max={100} label="Risk Capacity" color="#1b4332" primary={true} />
              <ScoreGauge score={profile.risk_tolerance_score} max={100} label="Risk Preference" color="#74c69d" />
            </div>

            {/* Preferences shown in Reports view */}

            {/* Advisor Notes */}
            <AdvisorNotes initialNotes={advisorNotes} onSave={handleSaveNotes} />

            {/* Portfolio Category Legend — full width */}
            <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
              <h2 className="font-semibold text-forest-900 mb-4">Portfolio Category Legend</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {((['Aggressive Growth', 'Growth', 'Moderate Growth', 'Conservative Growth', 'Income'] as RiskCategory[])).map(cat => {
                  const isActive = profile.overall_category === cat
                  const color = CATEGORY_COLORS[cat]
                  return (
                    <div key={cat} className={`rounded-xl p-4 border transition-all ${isActive ? 'border-2' : 'border'}`}
                      style={{ borderColor: isActive ? color : '#e8e0cc', backgroundColor: isActive ? `${color}10` : 'transparent' }}>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-xs font-bold text-forest-500 tabular-nums">{CATEGORY_SCORE_RANGES[cat]}</span>
                        <span className="text-sm font-bold text-forest-900 uppercase tracking-wide">{cat}</span>
                        {isActive && (
                          <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
                            This client
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-forest-600 leading-relaxed pl-5">{CATEGORY_DESCRIPTIONS[cat]}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Survey Q&A — full width at the bottom */}
            <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
              <h2 className="font-semibold text-forest-900 mb-5">Survey Responses</h2>
              <div className="space-y-5">
                {QUESTIONS.filter(q => q.type === 'radio').map((q) => {
                  const key = q.id as keyof QuestionnaireResponse
                  const score = responses[key]
                  if (typeof score !== 'number') return null
                  const selectedOption = q.type === 'radio'
                    ? q.options.find(o => o.score === score)
                    : null
                  return (
                    <div key={q.id} className="border-b border-cream-100 pb-5 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2"
                            style={{ color: q.category === 'capacity' ? '#1b4332' : '#74c69d' }}>
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: q.category === 'capacity' ? '#1b4332' : '#74c69d' }} />
                            {q.category === 'capacity' ? 'Risk Capacity' : 'Risk Preference'}
                          </div>
                          <p className="text-sm font-medium text-forest-900 mb-1.5">{q.question}</p>
                          <p className="text-sm text-forest-700 bg-cream-50 rounded-lg px-3 py-2 border border-cream-200 inline-block">
                            {selectedOption?.label ?? '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {responses.comments && (
                <div className="mt-5 bg-cream-100 rounded-xl p-4 border border-cream-200">
                  <div className="text-xs font-semibold text-forest-500 uppercase tracking-wider mb-1.5">Additional Comments</div>
                  <p className="text-sm text-forest-700 leading-relaxed">"{responses.comments}"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
  )
}

