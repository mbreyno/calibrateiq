'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  calculateRiskProfile,
  CATEGORY_COLORS,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_SCORE_RANGES,
  QUESTIONS,
  getOverallCategory,
} from '@/lib/scoring'
import type {
  Client,
  QuestionnaireResponse,
  RiskProfile,
  RiskCategory,
} from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function householdCategory(p1: RiskProfile, p2: RiskProfile): RiskCategory {
  const combined = Math.min(
    p1.capacity_normalized,
    p1.tolerance_normalized,
    p2.capacity_normalized,
    p2.tolerance_normalized,
  )
  return getOverallCategory(combined)
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const ShieldIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd"/>
  </svg>
)

const SlidersIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"/>
  </svg>
)

function MiniGauge({ score, max, label, primary }: { score: number; max: number; label: string; primary: boolean }) {
  const pct = Math.round((score / max) * 100)
  const color = primary ? '#1b4332' : '#74c69d'
  return (
    <div className={`flex-1 rounded-xl p-4 ${primary ? 'bg-white border-2' : 'bg-cream-50 border'}`}
      style={{ borderColor: primary ? color : '#e8e0cc' }}>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: primary ? color : '#6b7d6a' }}>
        {primary ? <ShieldIcon /> : <SlidersIcon />}
        {label}
        {primary && <span className="ml-1 text-xs font-medium opacity-60 normal-case tracking-normal">Primary</span>}
      </div>
      <div className="flex items-end gap-1.5 mb-2">
        <span className={`font-bold leading-none ${primary ? 'text-4xl text-forest-900' : 'text-2xl text-forest-600'}`}>{score}</span>
        <span className="text-xs text-forest-400 mb-0.5">/ {max}</span>
      </div>
      <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

// ─── Survey Q&A for one member ────────────────────────────────────────────────

function MemberSurveyResponses({ responses }: { responses: QuestionnaireResponse }) {
  return (
    <div className="space-y-4">
      {QUESTIONS.filter(q => q.type === 'radio').map((q) => {
        const key = q.id as keyof QuestionnaireResponse
        const score = responses[key]
        if (typeof score !== 'number') return null
        const selectedOption = q.type === 'radio'
          ? q.options.find(o => o.score === score)
          : null
        return (
          <div key={q.id} className="border-b border-cream-100 pb-4 last:border-0 last:pb-0">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: q.category === 'capacity' ? '#1b4332' : '#74c69d' }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: q.category === 'capacity' ? '#1b4332' : '#74c69d' }} />
              {q.category === 'capacity' ? 'Risk Capacity' : 'Risk Preference'}
            </div>
            <p className="text-sm font-medium text-forest-900 mb-1.5">{q.question}</p>
            <p className="text-sm text-forest-700 bg-cream-50 rounded-lg px-3 py-2 border border-cream-200 inline-block">
              {selectedOption?.label ?? '—'}
            </p>
          </div>
        )
      })}
      {responses.comments && (
        <div className="mt-2 bg-cream-100 rounded-xl p-4 border border-cream-200">
          <div className="text-xs font-semibold text-forest-500 uppercase tracking-wider mb-1.5">Additional Comments</div>
          <p className="text-sm text-forest-700 leading-relaxed">"{responses.comments}"</p>
        </div>
      )}
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
          placeholder="Add notes about this household's investment goals, special circumstances, or anything relevant to their combined profile…"
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

// ─── Main Page ────────────────────────────────────────────────────────────────

interface MemberData {
  client: Client
  responses: QuestionnaireResponse
  profile: RiskProfile
}

export default function HouseholdDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [householdName, setHouseholdName] = useState('')
  const [members, setMembers] = useState<MemberData[]>([])
  const [loading, setLoading] = useState(true)
  const [advisorNotes, setAdvisorNotes] = useState('')

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: hh } = await supabase
      .from('households')
      .select('*, advisor_notes, household_members(client_id)')
      .eq('id', id)
      .single()

    if (!hh) { setLoading(false); return }
    setHouseholdName(hh.name)
    setAdvisorNotes((hh as { advisor_notes?: string | null }).advisor_notes ?? '')

    const memberRows: MemberData[] = []
    for (const m of (hh.household_members as { client_id: string }[])) {
      const [{ data: client }, { data: resp }] = await Promise.all([
        supabase.from('clients').select('*').eq('id', m.client_id).single(),
        supabase.from('questionnaire_responses').select('*').eq('client_id', m.client_id).single(),
      ])
      if (client && resp) {
        const profile = calculateRiskProfile(resp)
        memberRows.push({ client, responses: resp, profile: { ...profile, client_name: `${client.first_name} ${client.last_name}` } })
      }
    }
    setMembers(memberRows)
    setLoading(false)
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  if (loading) return (
    <div className="p-8 pt-24 lg:pt-8 flex items-center justify-center min-h-screen">
      <div className="text-forest-600 text-sm">Loading household…</div>
    </div>
  )

  if (members.length < 2) return (
    <div className="p-8 pt-24 lg:pt-8">
      <p className="text-forest-700">Could not load household members. Make sure both surveys are completed.</p>
      <Link href="/dashboard/households" className="text-forest-900 font-semibold underline mt-2 block">← Back to Households</Link>
    </div>
  )

  const [m1, m2] = members
  const combinedCategory = householdCategory(m1.profile, m2.profile)
  const combinedColor = CATEGORY_COLORS[combinedCategory]

  const handleSaveNotes = async (notes: string) => {
    await supabase.from('households').update({ advisor_notes: notes } as never).eq('id', id)
    setAdvisorNotes(notes)
  }

  return (
    <div className="p-6 lg:p-8 pt-20 lg:pt-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Link href="/dashboard/households" className="mt-1 text-forest-600 hover:text-forest-900">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-forest-900">{householdName}</h1>
            <span className="text-sm font-bold px-3 py-1 rounded-full border text-white"
              style={{ backgroundColor: combinedColor, borderColor: combinedColor }}>
              {combinedCategory}
            </span>
          </div>
          <p className="text-sm text-forest-600 mt-0.5">
            {m1.client.first_name} {m1.client.last_name} &amp; {m2.client.first_name} {m2.client.last_name}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Combined household banner */}
        <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: combinedColor }}>
          <div className="text-sm font-semibold opacity-80 mb-1">Combined Household Category</div>
          <div className="text-3xl font-bold mb-2">{combinedCategory}</div>
          <p className="text-sm opacity-85 leading-relaxed max-w-2xl">{CATEGORY_DESCRIPTIONS[combinedCategory]}</p>
          <p className="text-xs opacity-70 mt-2">Determined by taking the most conservative score across both members' Risk Capacity and Risk Preference.</p>
        </div>

        {/* Side-by-side member score cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {[m1, m2].map(({ client, profile }) => {
            const catColor = CATEGORY_COLORS[profile.overall_category]
            return (
              <div key={client.id} className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-forest-200 flex items-center justify-center text-sm font-bold text-forest-800 flex-shrink-0">
                      {client.first_name[0]}{client.last_name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-forest-900">{client.first_name} {client.last_name}</div>
                      <div className="text-xs text-forest-500">{client.email}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: catColor }}>
                    {profile.overall_category}
                  </span>
                </div>
                <div className="flex gap-3">
                  <MiniGauge score={profile.risk_capacity_score} max={100} label="Risk Capacity" primary={true} />
                  <MiniGauge score={profile.risk_tolerance_score} max={100} label="Risk Preference" primary={false} />
                </div>
                <Link href={`/dashboard/clients/${client.id}`}
                  className="block text-center text-xs font-semibold text-forest-600 hover:text-forest-900 border border-cream-300 rounded-xl py-2 hover:bg-cream-50 transition-colors">
                  View full profile →
                </Link>
              </div>
            )
          })}
        </div>

        {/* Advisor Notes */}
        <AdvisorNotes initialNotes={advisorNotes} onSave={handleSaveNotes} />

        {/* Portfolio Category Legend */}
        <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
          <h2 className="font-semibold text-forest-900 mb-4">Portfolio Category Legend</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {(['Aggressive Growth', 'Growth', 'Moderate Growth', 'Conservative Growth', 'Income'] as RiskCategory[]).map(cat => {
              const isHousehold = combinedCategory === cat
              const isMember1 = m1.profile.overall_category === cat
              const isMember2 = m2.profile.overall_category === cat
              const color = CATEGORY_COLORS[cat]
              return (
                <div key={cat} className={`rounded-xl p-4 transition-all ${isHousehold ? 'border-2' : 'border'}`}
                  style={{ borderColor: isHousehold ? color : '#e8e0cc', backgroundColor: isHousehold ? `${color}10` : 'transparent' }}>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-xs font-bold text-forest-500 tabular-nums">{CATEGORY_SCORE_RANGES[cat]}</span>
                    <span className="text-sm font-bold text-forest-900 uppercase tracking-wide">{cat}</span>
                    <div className="ml-auto flex gap-1.5">
                      {isHousehold && <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>Household</span>}
                      {isMember1 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-forest-100 text-forest-700">{m1.client.first_name}</span>}
                      {isMember2 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-forest-100 text-forest-700">{m2.client.first_name}</span>}
                    </div>
                  </div>
                  <p className="text-xs text-forest-600 leading-relaxed pl-5">{CATEGORY_DESCRIPTIONS[cat]}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Survey Q&A — side by side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {[m1, m2].map(({ client, responses }) => (
            <div key={client.id} className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-full bg-forest-200 flex items-center justify-center text-xs font-bold text-forest-800 flex-shrink-0">
                  {client.first_name[0]}{client.last_name[0]}
                </div>
                <h2 className="font-semibold text-forest-900">
                  {client.first_name} {client.last_name} — Survey Responses
                </h2>
              </div>
              <MemberSurveyResponses responses={responses} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
