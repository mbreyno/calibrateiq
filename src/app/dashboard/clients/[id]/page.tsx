'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { calculateRiskProfile, ASSET_ALLOCATIONS, CATEGORY_COLORS, CATEGORY_DESCRIPTIONS, CATEGORY_SCORE_RANGES, QUESTIONS } from '@/lib/scoring'
import type { RiskCategory } from '@/types'
import { generateIPSContent } from '@/lib/ips-generator'
import type { Client, Advisor, QuestionnaireResponse, RiskProfile, IPSContent } from '@/types'

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreGauge({ score, max, label, color }: { score: number; max: number; label: string; color: string }) {
  const pct = Math.round((score / max) * 100)
  return (
    <div className="flex-1 bg-white rounded-2xl border border-cream-300 shadow-card p-5">
      <div className="text-xs font-semibold text-forest-600 uppercase tracking-wider mb-3">{label}</div>
      <div className="flex items-end gap-3 mb-3">
        <span className="text-4xl font-bold text-forest-900">{score}</span>
        <span className="text-sm text-forest-500 mb-1">/ {max}</span>
      </div>
      <div className="h-2.5 bg-cream-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="text-xs text-forest-500 mt-1.5">{pct}%</div>
    </div>
  )
}

function AllocationBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-xs font-medium text-forest-700 text-right">{label}</div>
      <div className="flex-1 h-5 bg-cream-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700"
          style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: color }}>
          <span className="text-xs font-bold text-white text-shadow">{pct}%</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

type Tab = 'overview' | 'profile' | 'ips'

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('overview')
  const [client, setClient] = useState<Client | null>(null)
  const [advisor, setAdvisor] = useState<Advisor | null>(null)
  const [responses, setResponses] = useState<QuestionnaireResponse | null>(null)
  const [profile, setProfile] = useState<RiskProfile | null>(null)
  const [ipsContent, setIpsContent] = useState<IPSContent | null>(null)
  const [ipsExists, setIpsExists] = useState(false)
  const [loading, setLoading] = useState(true)
  const [generatingIPS, setGeneratingIPS] = useState(false)
  const [savingIPS, setSavingIPS] = useState(false)
  const [ipsSaved, setIpsSaved] = useState(false)

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [
      { data: clientData },
      { data: advisorData },
    ] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('advisors').select('*').eq('user_id', user.id).single(),
    ])

    setClient(clientData)
    setAdvisor(advisorData)

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

      const { data: ips } = await supabase
        .from('investment_policy_statements')
        .select('*')
        .eq('client_id', id)
        .single()

      if (ips) {
        setIpsContent(ips.content as IPSContent)
        setIpsExists(true)
      }
    }

    setLoading(false)
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  const handleGenerateIPS = async () => {
    if (!client || !advisor || !profile) return
    setGeneratingIPS(true)

    const content = generateIPSContent(client, advisor, profile)
    setIpsContent(content)

    // Save to database
    const { error } = await supabase
      .from('investment_policy_statements')
      .upsert({ client_id: client.id, content }, { onConflict: 'client_id' })

    if (!error) { setIpsExists(true); setTab('ips') }
    setGeneratingIPS(false)
  }

  const handleSaveIPS = async () => {
    if (!client || !ipsContent) return
    setSavingIPS(true)
    await supabase
      .from('investment_policy_statements')
      .upsert({ client_id: client.id, content: ipsContent, updated_at: new Date().toISOString() }, { onConflict: 'client_id' })
    setSavingIPS(false)
    setIpsSaved(true)
    setTimeout(() => setIpsSaved(false), 2500)
  }

  const handlePrintIPS = () => window.print()

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

  const alloc = profile ? ASSET_ALLOCATIONS[profile.overall_category] : null
  const categoryColor = profile ? CATEGORY_COLORS[profile.overall_category] : '#52b788'

  return (
    <>
      {/* Print-only IPS */}
      {ipsContent && <IPSPrintView content={ipsContent} />}

      <div className="p-6 lg:p-8 pt-20 lg:pt-8 no-print">
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
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-cream-200/60 p-1 rounded-xl mb-6 w-fit">
          {(['overview', 'profile', 'ips'] as Tab[]).map(t => (
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
              {t === 'ips' ? 'IPS' : t.charAt(0).toUpperCase() + t.slice(1)}
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
                  <button onClick={() => setTab('profile')} className="flex-1 border border-forest-300 text-forest-800 text-sm font-medium py-2.5 rounded-xl hover:bg-forest-50">
                    View full profile
                  </button>
                  {ipsExists ? (
                    <button onClick={() => setTab('ips')} className="flex-1 bg-forest-900 text-cream-100 text-sm font-semibold py-2.5 rounded-xl hover:bg-forest-800">
                      View IPS
                    </button>
                  ) : (
                    <button onClick={handleGenerateIPS} disabled={generatingIPS}
                      className="flex-1 bg-forest-900 text-cream-100 text-sm font-semibold py-2.5 rounded-xl hover:bg-forest-800 disabled:opacity-60">
                      {generatingIPS ? 'Generating…' : 'Generate IPS'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ──────────────────────────────────────── */}
        {tab === 'profile' && profile && responses && (
          <div className="space-y-5 max-w-3xl">
            {/* Category banner */}
            <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: categoryColor }}>
              <div className="text-sm font-semibold opacity-80 mb-1">Overall Risk Category</div>
              <div className="text-3xl font-bold mb-2">{profile.overall_category}</div>
              <p className="text-sm opacity-85 leading-relaxed max-w-xl">{CATEGORY_DESCRIPTIONS[profile.overall_category]}</p>
            </div>

            {/* Scores */}
            <div className="flex gap-4">
              <ScoreGauge score={profile.risk_capacity_score} max={100} label="Risk Capacity" color="#1b4332" />
              <ScoreGauge score={profile.risk_tolerance_score} max={100} label="Risk Tolerance" color="#2d6a4f" />
            </div>

            {/* Asset allocation */}
            {alloc && (
              <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
                <h2 className="font-semibold text-forest-900 mb-4">Recommended Asset Allocation</h2>
                <div className="space-y-3">
                  <AllocationBar label="Equities" pct={alloc.equities} color="#1b4332" />
                  <AllocationBar label="Fixed Income" pct={alloc.fixed_income} color="#2d6a4f" />
                  <AllocationBar label="Alternatives" pct={alloc.alternatives} color="#40916c" />
                  <AllocationBar label="Cash" pct={alloc.cash} color="#74c69d" />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-5">
                  {[
                    ['Equities', alloc.equities],
                    ['Fixed Income', alloc.fixed_income],
                    ['Alternatives', alloc.alternatives],
                    ['Cash', alloc.cash],
                  ].map(([l, v]) => (
                    <div key={l} className="text-center bg-forest-50 rounded-xl p-3 border border-forest-100">
                      <div className="text-xl font-bold text-forest-900">{v}%</div>
                      <div className="text-xs text-forest-600 mt-0.5">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences */}
            {(profile.esg_preference || profile.crypto_preference) && (
              <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
                <h2 className="font-semibold text-forest-900 mb-3">Investment Preferences</h2>
                <div className="flex gap-2 flex-wrap">
                  {profile.esg_preference && (
                    <span className="bg-forest-100 text-forest-800 text-sm font-medium px-3 py-1.5 rounded-full">🌱 ESG / Socially Responsible</span>
                  )}
                  {profile.crypto_preference && (
                    <span className="bg-purple-50 text-purple-800 text-sm font-medium px-3 py-1.5 rounded-full border border-purple-100">₿ Digital Assets / Crypto</span>
                  )}
                </div>
              </div>
            )}

            {/* Question responses */}
            <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
              <h2 className="font-semibold text-forest-900 mb-4">Questionnaire Responses</h2>
              <div className="space-y-4">
                {QUESTIONS.filter(q => q.type === 'radio').map((q, i) => {
                  const key = `q${i + 1}` as keyof QuestionnaireResponse
                  const score = responses[key]
                  if (typeof score !== 'number') return null
                  const selectedOption = 'options' in q && q.type === 'radio'
                    ? q.options.find(o => o.score === score)
                    : null
                  return (
                    <div key={q.id} className="border-b border-cream-200 pb-4 last:border-0 last:pb-0">
                      <div className="text-xs font-semibold text-forest-500 uppercase tracking-wider mb-1">
                        {q.category === 'capacity' ? 'Risk Capacity' : 'Risk Tolerance'} · Q{i + 1}
                      </div>
                      <div className="text-sm font-medium text-forest-900 mb-1">{q.question}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-forest-700">{selectedOption?.label ?? '—'}</span>
                        <span className="text-xs font-bold text-forest-600 bg-forest-100 px-2 py-0.5 rounded-full">
                          {score} pts
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              {responses.comments && (
                <div className="mt-4 bg-cream-100 rounded-xl p-4 border border-cream-200">
                  <div className="text-xs font-semibold text-forest-500 uppercase tracking-wider mb-1">Client Comments</div>
                  <p className="text-sm text-forest-700 leading-relaxed">"{responses.comments}"</p>
                </div>
              )}
            </div>

            {/* Portfolio Category Legend */}
            <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
              <h2 className="font-semibold text-forest-900 mb-4">Portfolio Category Legend</h2>
              <div className="space-y-3">
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

            <div className="flex gap-3">
              {!ipsExists ? (
                <button onClick={handleGenerateIPS} disabled={generatingIPS}
                  className="bg-forest-900 text-cream-100 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-forest-800 disabled:opacity-60">
                  {generatingIPS ? 'Generating IPS…' : 'Generate Investment Policy Statement'}
                </button>
              ) : (
                <button onClick={() => setTab('ips')}
                  className="bg-forest-900 text-cream-100 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-forest-800">
                  View IPS →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── IPS TAB ───────────────────────────────────────────── */}
        {tab === 'ips' && (
          <div className="max-w-3xl space-y-5">
            {!ipsContent ? (
              <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-10 text-center">
                <div className="w-14 h-14 bg-forest-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-forest-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                  </svg>
                </div>
                <h3 className="font-bold text-forest-900 mb-2">No IPS generated yet</h3>
                <p className="text-sm text-forest-600 mb-5">Generate an Investment Policy Statement from this client's risk profile.</p>
                <button onClick={handleGenerateIPS} disabled={generatingIPS}
                  className="bg-forest-900 text-cream-100 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-forest-800 disabled:opacity-60">
                  {generatingIPS ? 'Generating…' : 'Generate IPS'}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-forest-900">Investment Policy Statement</h2>
                  <div className="flex gap-2">
                    <button onClick={handlePrintIPS}
                      className="inline-flex items-center gap-1.5 border border-forest-300 text-forest-800 text-sm font-medium px-4 py-2 rounded-xl hover:bg-cream-100">
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd"/>
                      </svg>
                      Export PDF
                    </button>
                    <button onClick={handleSaveIPS} disabled={savingIPS}
                      className="inline-flex items-center gap-1.5 bg-forest-900 text-cream-100 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-forest-800 disabled:opacity-60">
                      {savingIPS ? 'Saving…' : ipsSaved ? '✓ Saved' : 'Save changes'}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-forest-600 -mt-2">Edit any section below before exporting. Changes are saved to your account.</p>

                <IPSEditor content={ipsContent} onChange={setIpsContent} />
              </>
            )}
          </div>
        )}
      </div>

    </>
  )
}

// ─── IPS Editor ──────────────────────────────────────────────────────────────

function IPSEditor({ content, onChange }: { content: IPSContent; onChange: (c: IPSContent) => void }) {
  const update = (key: keyof IPSContent, value: string) => {
    onChange({ ...content, [key]: value })
  }

  const sectionClass = "bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4"
  const labelClass = "block text-xs font-bold text-forest-600 uppercase tracking-wider mb-1.5"
  const textareaClass = "w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent resize-none"

  return (
    <div className="space-y-4">
      <div className={sectionClass}>
        <h3 className="font-semibold text-forest-900">Document Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Client Name</label>
            <input type="text" value={content.client_name} onChange={e => update('client_name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent" />
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input type="text" value={content.date_generated} onChange={e => update('date_generated', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent" />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className="font-semibold text-forest-900">Investment Objectives</h3>
        <textarea rows={5} value={content.investment_objectives} onChange={e => update('investment_objectives', e.target.value)} className={textareaClass} />
      </div>

      <div className={sectionClass}>
        <h3 className="font-semibold text-forest-900">Time Horizon</h3>
        <textarea rows={3} value={content.time_horizon} onChange={e => update('time_horizon', e.target.value)} className={textareaClass} />
      </div>

      <div className={sectionClass}>
        <h3 className="font-semibold text-forest-900">Risk Profile Summary</h3>
        <textarea rows={7} value={content.risk_summary} onChange={e => update('risk_summary', e.target.value)} className={textareaClass} />
      </div>

      <div className={sectionClass}>
        <h3 className="font-semibold text-forest-900">Investment Guidelines & Asset Allocation</h3>
        <textarea rows={10} value={content.investment_guidelines} onChange={e => update('investment_guidelines', e.target.value)} className={textareaClass} />
      </div>

      <div className={sectionClass}>
        <h3 className="font-semibold text-forest-900">Special Considerations</h3>
        <textarea rows={4} value={content.special_considerations} onChange={e => update('special_considerations', e.target.value)} className={textareaClass} />
      </div>

      <div className={sectionClass}>
        <h3 className="font-semibold text-forest-900">Advisor Notes</h3>
        <textarea rows={4} value={content.advisor_notes} onChange={e => update('advisor_notes', e.target.value)}
          placeholder="Add any additional notes for this client's file…"
          className={textareaClass} />
      </div>
    </div>
  )
}

// ─── Print View ──────────────────────────────────────────────────────────────

function IPSPrintView({ content }: { content: IPSContent }) {
  return (
    <div className="print-only" style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', padding: '0', lineHeight: '1.6' }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid #1b4332', paddingBottom: '20px', marginBottom: '28px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'system-ui, sans-serif', color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          {content.advisor_firm}
        </div>
        <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#1b4332', marginBottom: '4px' }}>
          Investment Policy Statement
        </div>
        <div style={{ fontSize: '13px', color: '#555' }}>
          Prepared for <strong>{content.client_name}</strong> · {content.date_generated}
        </div>
        <div style={{ marginTop: '8px' }}>
          <span style={{ display: 'inline-block', background: '#1b4332', color: 'white', fontSize: '11px', fontFamily: 'system-ui', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>
            {content.risk_category}
          </span>
        </div>
      </div>

      {[
        ['Investment Objectives', content.investment_objectives],
        ['Time Horizon', content.time_horizon],
        ['Risk Profile Summary', content.risk_summary],
        ['Investment Guidelines & Asset Allocation', content.investment_guidelines],
        ['Special Considerations', content.special_considerations],
        ...(content.advisor_notes ? [['Advisor Notes', content.advisor_notes]] : []),
      ].map(([title, body]) => (
        <div key={title} style={{ marginBottom: '24px', pageBreakInside: 'avoid' }}>
          <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '10px', fontWeight: '700', color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', borderBottom: '1px solid #d4c9a8', paddingBottom: '4px' }}>
            {title}
          </div>
          <div style={{ fontSize: '12px', whiteSpace: 'pre-wrap', color: '#2a2a2a' }}>{body}</div>
        </div>
      ))}

      {/* Signature block */}
      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #d4c9a8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {['Client Signature & Date', 'Advisor Signature & Date'].map(label => (
          <div key={label}>
            <div style={{ borderBottom: '1px solid #1b4332', marginBottom: '6px', height: '40px' }} />
            <div style={{ fontSize: '10px', fontFamily: 'system-ui', color: '#777', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', fontSize: '9px', fontFamily: 'system-ui', color: '#aaa', textAlign: 'center' }}>
        Generated by CalibrateIQ · {content.advisor_firm} · This document is confidential and intended solely for the named client.
      </div>
    </div>
  )
}
