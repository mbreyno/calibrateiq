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
  getOverallCategory,
} from '@/lib/scoring'
import { generateHouseholdIPSContent } from '@/lib/ips-generator'
import type {
  Client,
  Advisor,
  QuestionnaireResponse,
  RiskProfile,
  IPSContent,
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

function MiniGauge({ score, max, label, primary }: { score: number; max: number; label: string; primary: boolean }) {
  const pct = Math.round((score / max) * 100)
  const color = primary ? '#1b4332' : '#74c69d'
  return (
    <div className={`flex-1 rounded-xl p-4 ${primary ? 'bg-white border-2' : 'bg-cream-50 border'}`}
      style={{ borderColor: primary ? color : '#e8e0cc' }}>
      <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: primary ? color : '#6b7d6a' }}>{label}</div>
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

// ─── IPS Editor ──────────────────────────────────────────────────────────────

function IPSEditor({ content, onChange }: { content: IPSContent; onChange: (c: IPSContent) => void }) {
  const update = (key: keyof IPSContent, value: string) => onChange({ ...content, [key]: value })
  const sectionClass = 'bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4'
  const labelClass = 'block text-xs font-bold text-forest-600 uppercase tracking-wider mb-1.5'
  const taClass = 'w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent resize-none'
  return (
    <div className="space-y-4">
      <div className={sectionClass}>
        <h3 className="font-semibold text-forest-900">Document Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Household Name</label>
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
      {(['investment_objectives', 'time_horizon', 'risk_summary', 'investment_guidelines', 'special_considerations', 'advisor_notes'] as (keyof IPSContent)[]).map(field => (
        <div key={field} className={sectionClass}>
          <h3 className="font-semibold text-forest-900 capitalize">{field.replace(/_/g, ' ')}</h3>
          <textarea rows={field === 'risk_summary' ? 12 : field === 'investment_guidelines' ? 10 : 5}
            value={content[field] as string} onChange={e => update(field, e.target.value)} className={taClass} />
        </div>
      ))}
    </div>
  )
}

// ─── Print View ──────────────────────────────────────────────────────────────

function IPSPrintView({ content }: { content: IPSContent }) {
  return (
    <div className="print-only" style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', padding: '0', lineHeight: '1.6' }}>
      <div style={{ borderBottom: '2px solid #1b4332', paddingBottom: '20px', marginBottom: '28px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'system-ui, sans-serif', color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{content.advisor_firm}</div>
        <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#1b4332', marginBottom: '4px' }}>Investment Policy Statement</div>
        <div style={{ fontSize: '13px', color: '#555' }}>Prepared for <strong>{content.client_name}</strong> · {content.date_generated}</div>
        <div style={{ marginTop: '8px' }}>
          <span style={{ display: 'inline-block', background: '#1b4332', color: 'white', fontSize: '11px', fontFamily: 'system-ui', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>{content.risk_category}</span>
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
          <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '10px', fontWeight: '700', color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', borderBottom: '1px solid #d4c9a8', paddingBottom: '4px' }}>{title}</div>
          <div style={{ fontSize: '12px', whiteSpace: 'pre-wrap', color: '#2a2a2a' }}>{body}</div>
        </div>
      ))}
      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #d4c9a8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {['Client Signature & Date', 'Advisor Signature & Date'].map(label => (
          <div key={label}>
            <div style={{ borderBottom: '1px solid #1b4332', marginBottom: '6px', height: '40px' }} />
            <div style={{ fontSize: '10px', fontFamily: 'system-ui', color: '#777', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '20px', fontSize: '9px', fontFamily: 'system-ui', color: '#aaa', textAlign: 'center' }}>
        Generated by CalibrateIQ · {content.advisor_firm} · This document is confidential and intended solely for the named household.
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'profiles' | 'ips'

interface MemberData {
  client: Client
  responses: QuestionnaireResponse
  profile: RiskProfile
}

export default function HouseholdDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('profiles')
  const [householdName, setHouseholdName] = useState('')
  const [advisor, setAdvisor] = useState<Advisor | null>(null)
  const [members, setMembers] = useState<MemberData[]>([])
  const [loading, setLoading] = useState(true)
  const [ipsContent, setIpsContent] = useState<IPSContent | null>(null)
  const [ipsExists, setIpsExists] = useState(false)
  const [generatingIPS, setGeneratingIPS] = useState(false)
  const [savingIPS, setSavingIPS] = useState(false)
  const [ipsSaved, setIpsSaved] = useState(false)

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: hh }, { data: advisorData }] = await Promise.all([
      supabase.from('households').select('*, household_members(client_id)').eq('id', id).single(),
      supabase.from('advisors').select('*').eq('user_id', user.id).single(),
    ])

    if (!hh) { setLoading(false); return }
    setHouseholdName(hh.name)
    setAdvisor(advisorData)

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

    const { data: existingIPS } = await supabase
      .from('household_ips')
      .select('*')
      .eq('household_id', id)
      .single()
    if (existingIPS) {
      setIpsContent(existingIPS.content as IPSContent)
      setIpsExists(true)
    }

    setLoading(false)
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  const handleGenerateIPS = async () => {
    if (!advisor || members.length < 2) return
    setGeneratingIPS(true)
    const content = generateHouseholdIPSContent(
      householdName,
      members[0].client,
      members[1].client,
      advisor,
      members[0].profile,
      members[1].profile,
    )
    setIpsContent(content)
    const { error } = await supabase
      .from('household_ips')
      .upsert({ household_id: id, content }, { onConflict: 'household_id' })
    if (!error) { setIpsExists(true); setTab('ips') }
    setGeneratingIPS(false)
  }

  const handleSaveIPS = async () => {
    if (!ipsContent) return
    setSavingIPS(true)
    await supabase
      .from('household_ips')
      .upsert({ household_id: id, content: ipsContent, updated_at: new Date().toISOString() }, { onConflict: 'household_id' })
    setSavingIPS(false)
    setIpsSaved(true)
    setTimeout(() => setIpsSaved(false), 2500)
  }

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

  return (
    <>
      {ipsContent && <IPSPrintView content={ipsContent} />}

      <div className="p-6 lg:p-8 pt-20 lg:pt-8 no-print">
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
              <span className="text-sm font-bold px-3 py-1 rounded-full border text-white" style={{ backgroundColor: combinedColor, borderColor: combinedColor }}>
                {combinedCategory}
              </span>
            </div>
            <p className="text-sm text-forest-600 mt-0.5">
              {m1.client.first_name} {m1.client.last_name} &amp; {m2.client.first_name} {m2.client.last_name}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-cream-200/60 p-1 rounded-xl mb-6 w-fit">
          {(['profiles', 'ips'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-white text-forest-900 shadow-card' : 'text-forest-600 hover:text-forest-800'
              }`}>
              {t === 'ips' ? 'IPS' : 'Profiles'}
            </button>
          ))}
        </div>

        {/* ── PROFILES TAB ──────────────────────────────────── */}
        {tab === 'profiles' && (
          <div className="space-y-5">
            {/* Combined household banner */}
            <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: combinedColor }}>
              <div className="text-sm font-semibold opacity-80 mb-1">Combined Household Category</div>
              <div className="text-3xl font-bold mb-2">{combinedCategory}</div>
              <p className="text-sm opacity-85 leading-relaxed max-w-2xl">{CATEGORY_DESCRIPTIONS[combinedCategory]}</p>
              <p className="text-xs opacity-70 mt-2">Determined by taking the most conservative score across both members' Risk Capacity and Risk Preference.</p>
            </div>

            {/* Side-by-side member profiles */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {[m1, m2].map(({ client, profile }) => {
                const catColor = CATEGORY_COLORS[profile.overall_category]
                return (
                  <div key={client.id} className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
                    {/* Member header */}
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

                    {/* Scores */}
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
                    <div key={cat} className={`rounded-xl p-4 border transition-all ${isHousehold ? 'border-2' : 'border'}`}
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

            <div className="flex gap-3">
              {!ipsExists ? (
                <button onClick={handleGenerateIPS} disabled={generatingIPS}
                  className="bg-forest-900 text-cream-100 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-forest-800 disabled:opacity-60">
                  {generatingIPS ? 'Generating…' : 'Generate Household IPS'}
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

        {/* ── IPS TAB ───────────────────────────────────────── */}
        {tab === 'ips' && (
          <div className="space-y-5">
            {!ipsContent ? (
              <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-10 text-center">
                <h3 className="font-bold text-forest-900 mb-2">No household IPS generated yet</h3>
                <p className="text-sm text-forest-600 mb-5">Generate a combined Investment Policy Statement for this household.</p>
                <button onClick={handleGenerateIPS} disabled={generatingIPS}
                  className="bg-forest-900 text-cream-100 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-forest-800 disabled:opacity-60">
                  {generatingIPS ? 'Generating…' : 'Generate Household IPS'}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-forest-900">Household Investment Policy Statement</h2>
                  <div className="flex gap-2">
                    <button onClick={() => window.print()}
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
                <p className="text-sm text-forest-600 -mt-2">Edit any section below before exporting.</p>
                <IPSEditor content={ipsContent} onChange={setIpsContent} />
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
