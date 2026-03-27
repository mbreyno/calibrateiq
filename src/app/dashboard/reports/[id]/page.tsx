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
import type { Client, QuestionnaireResponse, RiskProfile, RiskCategory, InvestmentPreference } from '@/types'

// ─── Date helper ──────────────────────────────────────────────────────────────

function formatSurveyDate(ts: string | undefined, tz: string): string {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: tz }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcAge(dob: string | null | undefined): string {
  if (!dob) return 'Age unknown'
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age--
  return `Age ${age}`
}

function combinedCategory(members: MemberData[]): RiskCategory {
  if (members.length === 1) return members[0].profile.overall_category
  const [p1, p2] = members.map(m => m.profile)
  return getOverallCategory((p1.capacity_normalized + p2.capacity_normalized) / 2)
}

interface MemberData {
  client: Client
  responses: QuestionnaireResponse
  profile: RiskProfile
}

// ─── Icons ───────────────────────────────────────────────────────────────────

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

// ─── Score Gauges ─────────────────────────────────────────────────────────────

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

function MiniGauge({ score, max, label, primary, brandColor }: { score: number; max: number; label: string; primary: boolean; brandColor?: string }) {
  const pct = Math.round((score / max) * 100)
  const color = primary ? (brandColor ?? '#1b4332') : '#74c69d'
  return (
    <div className={`flex-1 rounded-xl p-4 print:p-3 ${primary ? 'bg-white border-2' : 'bg-cream-50 border'}`}
      style={{ borderColor: primary ? color : '#e8e0cc' }}>
      <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide print:tracking-normal mb-2" style={{ color: primary ? color : '#6b7d6a' }}>
        {primary ? <ShieldIcon /> : <SlidersIcon />}
        <span className="truncate">{label}</span>
      </div>
      <div className="flex items-end gap-1.5 mb-2">
        <span className={`font-bold leading-none ${primary ? 'text-4xl print:text-2xl text-forest-900' : 'text-2xl print:text-xl text-forest-600'}`}>{score}</span>
        <span className="text-xs text-forest-400 mb-0.5">/ {max}</span>
      </div>
      <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

// ─── Survey Q&A ───────────────────────────────────────────────────────────────

function ageFromDob(dob: string | null | undefined): string {
  if (!dob) return 'Not provided'
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return `${age} years old`
}

function SurveyResponses({ responses, clientDob }: { responses: QuestionnaireResponse; clientDob?: string | null }) {
  return (
    <div className="space-y-5 print:space-y-2">
      {QUESTIONS.filter(q => q.type === 'radio').map((q) => {
        const key = q.id as keyof QuestionnaireResponse
        const score = responses[key]
        if (typeof score !== 'number') return null

        // Q1 (age) is stored as a computed score from DOB — display the actual age instead
        let displayLabel: string
        if (q.id === 'q1') {
          displayLabel = ageFromDob(clientDob)
        } else {
          const selectedOption = q.options.find(o => o.score === score)
          displayLabel = selectedOption?.label ?? '—'
        }

        return (
          <div key={q.id} className="border-b border-cream-100 pb-5 print:pb-2 last:border-0 last:pb-0">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2 print:mb-0.5"
              style={{ color: q.category === 'capacity' ? '#1b4332' : '#74c69d' }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: q.category === 'capacity' ? '#1b4332' : '#74c69d' }} />
              {q.category === 'capacity' ? 'Risk Capacity' : 'Risk Preference'}
            </div>
            <p className="text-sm print:text-xs font-medium text-forest-900 mb-1.5 print:mb-0.5">{q.question}</p>
            <p className="text-sm print:text-xs text-forest-700 bg-cream-50 rounded-lg px-3 print:px-2 py-2 print:py-1 border border-cream-200 inline-block">
              {displayLabel}
            </p>
          </div>
        )
      })}
      {responses.comments && (
        <div className="bg-cream-100 rounded-xl p-4 print:p-2 border border-cream-200">
          <div className="text-xs font-semibold text-forest-500 uppercase tracking-wider mb-1.5 print:mb-0.5">Additional Comments</div>
          <p className="text-sm print:text-xs text-forest-700 leading-relaxed">&ldquo;{responses.comments}&rdquo;</p>
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
            className="no-print text-xs font-semibold text-forest-600 hover:text-forest-900 border border-cream-300 px-3 py-1.5 rounded-lg hover:bg-cream-50 transition-colors">
            Edit
          </button>
        ) : (
          <div className="no-print flex gap-2">
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
        <textarea value={value} onChange={e => setValue(e.target.value)} rows={5}
          placeholder="Add notes about investment goals, special circumstances, or anything relevant to this report…"
          className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent resize-none" />
      ) : value ? (
        <p className="text-sm text-forest-700 leading-relaxed whitespace-pre-wrap">{value}</p>
      ) : (
        <p className="text-sm text-forest-400 italic">No notes yet. Click Edit to add advisor notes.</p>
      )}
      {saved && <p className="text-xs text-forest-500 mt-2">✓ Notes saved</p>}
    </div>
  )
}

// ─── Investor Understanding & Acceptance ─────────────────────────────────────

function InvestorAcceptance() {
  return (
    <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
      <h2 className="font-semibold text-forest-900 mb-3">Investor Understanding &amp; Acceptance</h2>
      <p className="text-sm text-forest-700 leading-relaxed">
        Receipt of this Investment Policy Statement certifies the following: I have discussed my current financial situation, including my assets, debts, income sources and expenses, and my financial objectives with my advisor. I understand the risks inherent in investing. Investments are not guaranteed and may lose value. I agree to inform my financial advisor whenever my circumstances or preferences regarding these accounts change in order to determine if a revised Investment Policy Statement should be prepared.
      </p>
    </div>
  )
}

// ─── Portfolio Legend ─────────────────────────────────────────────────────────

function PortfolioLegend({ members, category }: { members: MemberData[]; category: RiskCategory }) {
  const isCouple = members.length === 2
  return (
    <div className="portfolio-legend-card bg-white rounded-2xl border border-cream-300 shadow-card p-6">
      <h2 className="font-semibold text-forest-900 mb-4">Portfolio Category Legend</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {(['Aggressive Growth', 'Growth', 'Moderate Growth', 'Conservative Growth', 'Income'] as RiskCategory[]).map(cat => {
          const isActive = category === cat
          const color = CATEGORY_COLORS[cat]
          const isMember1 = members[0]?.profile.overall_category === cat
          const isMember2 = isCouple && members[1]?.profile.overall_category === cat
          return (
            <div key={cat} className={`rounded-xl p-4 transition-all ${isActive ? 'border-2' : 'border'}`}
              style={{ borderColor: isActive ? color : '#e8e0cc', backgroundColor: isActive ? `${color}10` : 'transparent' }}>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs font-bold text-forest-500 tabular-nums">{CATEGORY_SCORE_RANGES[cat]}</span>
                <span className="text-sm font-bold text-forest-900 uppercase tracking-wide">{cat}</span>
                <div className="ml-auto flex gap-1.5">
                  {isActive && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
                      {isCouple ? 'Household' : 'This client'}
                    </span>
                  )}
                  {isCouple && isMember1 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-forest-100 text-forest-700">{members[0].client.first_name}</span>
                  )}
                  {isCouple && isMember2 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-forest-100 text-forest-700">{members[1].client.first_name}</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-forest-600 leading-relaxed pl-5">{CATEGORY_DESCRIPTIONS[cat]}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Signature Block ─────────────────────────────────────────────────────────

function SignatureBlock({ members }: { members: MemberData[] }) {
  return (
    <div>
      <div className="text-xs font-semibold text-forest-500 uppercase tracking-wider mb-8">
        Client Acknowledgment
      </div>
      <div className={`grid gap-12 ${members.length >= 2 ? 'grid-cols-2' : 'grid-cols-1 max-w-sm'}`}>
        {members.map(({ client }) => (
          <div key={client.id}>
            <div className="border-b border-forest-400 mb-2 pb-10" />
            <div className="text-xs font-medium text-forest-700">
              {client.first_name} {client.last_name}
            </div>
            <div className="text-xs text-forest-400 mt-0.5">Signature &amp; Date</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Investment Preferences display ───────────────────────────────────────────

function PreferenceBadges({ selectedIds, allPreferences }: { selectedIds?: string[] | null; allPreferences: InvestmentPreference[] }) {
  const selected = allPreferences.filter(p => selectedIds?.includes(p.id))
  if (selected.length === 0) {
    return <p className="text-sm text-forest-400 italic">No investment preferences indicated.</p>
  }
  return (
    <div className="flex gap-2 flex-wrap">
      {selected.map(p => (
        <span key={p.id} className="bg-forest-100 text-forest-800 text-sm font-medium px-3 py-1.5 rounded-full">
          {p.icon} {p.label}
        </span>
      ))}
    </div>
  )
}

// ─── Single Client Layout ─────────────────────────────────────────────────────

function SingleClientReport({ member, category, advisorNotes, onSaveNotes, preferences, advisorFirmName, advisorLogoUrl, reportName, signatureBlock, brandColor }: {
  member: MemberData
  category: RiskCategory
  advisorNotes: string
  onSaveNotes: (n: string) => Promise<void>
  preferences: InvestmentPreference[]
  advisorFirmName: string
  advisorLogoUrl: string | null
  reportName: string
  signatureBlock: boolean
  brandColor?: string
}) {
  const { profile, responses } = member
  const color = CATEGORY_COLORS[category]
  const bc = brandColor ?? '#1b4332'

  return (
    <div className="space-y-5 print:space-y-0">

      {/* ── Print Page 1: category banner + scores + prefs + notes ── */}
      <div className="print-page-1 space-y-5">

        {/* Print-only branded header */}
        <div className="print-only mb-6 pb-4 border-b-2" style={{ borderColor: bc + '60' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {advisorLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={advisorLogoUrl} alt="Firm logo" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8 }} />
              ) : (
                <svg style={{ width: 40, height: 40 }} viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="10" fill={bc} />
                  <path d="M8 28 L16 18 L22 23 L30 13" stroke="#d4a017" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="30" cy="13" r="3" fill="#d4a017"/>
                </svg>
              )}
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: bc }}>{advisorFirmName || 'CalibrateIQ'}</div>
                <div style={{ fontSize: 11, color: '#6b7d6a' }}>Investment Policy Statement</div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 11, color: '#6b7d6a' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: bc }}>{reportName}</div>
              <div>Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: color }}>
          <div className="text-sm font-semibold opacity-80 mb-1">Overall Risk Category</div>
          <div className="text-3xl font-bold mb-2">{category}</div>
          <p className="text-sm opacity-85 leading-relaxed max-w-2xl">{CATEGORY_DESCRIPTIONS[category]}</p>
          <p className="text-xs opacity-70 mt-2">{calcAge(member.client.date_of_birth)}</p>
        </div>

        <div className="flex gap-4">
          <ScoreGauge score={profile.risk_capacity_score} max={100} label="Risk Capacity" color={bc} primary={true} />
          <ScoreGauge score={profile.risk_tolerance_score} max={100} label="Risk Preference" color="#74c69d" />
        </div>

        {preferences.length > 0 && (
          <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
            <h2 className="font-semibold text-forest-900 mb-3">Investment Preferences</h2>
            <PreferenceBadges selectedIds={profile.selected_preferences} allPreferences={preferences} />
          </div>
        )}

        <AdvisorNotes initialNotes={advisorNotes} onSave={onSaveNotes} />
      </div>

      {/* ── Print Page 2: Investor Acceptance + Portfolio Legend, centered ── */}
      <div className="print-center-page space-y-5">
        <InvestorAcceptance />
        <PortfolioLegend members={[member]} category={category} />
      </div>

      {/* ── Print Page 3: Survey responses, centered ── */}
      <div className="print-center-page">
        <div className="survey-card bg-white rounded-2xl border border-cream-300 shadow-card p-6 print:p-4">
          <h2 className="font-semibold text-forest-900 mb-5 print:mb-3">Survey Responses</h2>
          <SurveyResponses responses={responses} clientDob={member.client.date_of_birth} />
        </div>
      </div>

      {/* ── Print Page 4 (optional): Signature block ── */}
      {signatureBlock && (
        <div className="print-only print-sig-page">
          <SignatureBlock members={[member]} />
        </div>
      )}

    </div>
  )
}

// ─── Couple Layout ────────────────────────────────────────────────────────────

function CoupleReport({ members, category, advisorNotes, onSaveNotes, preferences, advisorFirmName, advisorLogoUrl, reportName, signatureBlock, brandColor }: {
  members: MemberData[]
  category: RiskCategory
  advisorNotes: string
  onSaveNotes: (n: string) => Promise<void>
  preferences: InvestmentPreference[]
  advisorFirmName: string
  advisorLogoUrl: string | null
  reportName: string
  signatureBlock: boolean
  brandColor?: string
}) {
  const [m1, m2] = members
  const color = CATEGORY_COLORS[category]
  const bc = brandColor ?? '#1b4332'

  return (
    <div className="space-y-5 print:space-y-0">

      {/* ── Print Page 1: category banner + member cards + prefs + notes ── */}
      <div className="print-page-1 space-y-5">

        {/* Print-only branded header */}
        <div className="print-only mb-6 pb-4 border-b-2" style={{ borderColor: bc + '60' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {advisorLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={advisorLogoUrl} alt="Firm logo" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8 }} />
              ) : (
                <svg style={{ width: 40, height: 40 }} viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="10" fill={bc} />
                  <path d="M8 28 L16 18 L22 23 L30 13" stroke="#d4a017" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="30" cy="13" r="3" fill="#d4a017"/>
                </svg>
              )}
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: bc }}>{advisorFirmName || 'CalibrateIQ'}</div>
                <div style={{ fontSize: 11, color: '#6b7d6a' }}>Investment Policy Statement</div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 11, color: '#6b7d6a' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: bc }}>{reportName}</div>
              <div>Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: color }}>
          <div className="text-sm font-semibold opacity-80 mb-1">Combined Household Category</div>
          <div className="text-3xl font-bold mb-2">{category}</div>
          <p className="text-sm opacity-85 leading-relaxed max-w-2xl">{CATEGORY_DESCRIPTIONS[category]}</p>
          <p className="text-xs opacity-70 mt-2">Determined by averaging both members&apos; Risk Capacity scores. Risk Preference is shown for reference only.</p>
        </div>

        {/* Side-by-side member score cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {members.map(({ client, profile }) => {
            const catColor = CATEGORY_COLORS[profile.overall_category]
            return (
              <div key={client.id} className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 print:p-4 space-y-4 print:space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-forest-200 flex items-center justify-center text-sm font-bold text-forest-800 flex-shrink-0">
                      {client.first_name[0]}{client.last_name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-forest-900">{client.first_name} {client.last_name}</div>
                      <div className="text-xs text-forest-500">{calcAge(client.date_of_birth)}</div>
                    </div>
                  </div>
                  <span className="text-xs print:text-[10px] font-bold px-2.5 print:px-2 py-1 rounded-full text-white flex-shrink-0" style={{ backgroundColor: catColor }}>
                    {profile.overall_category}
                  </span>
                </div>
                <div className="flex gap-3 print:gap-2">
                  <MiniGauge score={profile.risk_capacity_score} max={100} label="Risk Capacity" primary={true} brandColor={bc} />
                  <MiniGauge score={profile.risk_tolerance_score} max={100} label="Risk Preference" primary={false} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Investment preferences — per member */}
        {preferences.length > 0 && (
          <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
            <h2 className="font-semibold text-forest-900 mb-4">Investment Preferences</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {members.map(({ client, profile }) => (
                <div key={client.id} className="bg-cream-50 rounded-xl border border-cream-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-forest-200 flex items-center justify-center text-xs font-bold text-forest-800 flex-shrink-0">
                      {client.first_name[0]}{client.last_name[0]}
                    </div>
                    <span className="font-semibold text-forest-900 text-sm">{client.first_name} {client.last_name}</span>
                  </div>
                  <PreferenceBadges selectedIds={profile.selected_preferences} allPreferences={preferences} />
                </div>
              ))}
            </div>
          </div>
        )}

        <AdvisorNotes initialNotes={advisorNotes} onSave={onSaveNotes} />
      </div>

      {/* ── Print Page 2: Investor Acceptance + Portfolio Legend, centered ── */}
      <div className="print-center-page space-y-5">
        <InvestorAcceptance />
        <PortfolioLegend members={members} category={category} />
      </div>

      {/* ── Print Page 3: Survey Q&A side-by-side, centered ── */}
      <div className="print-center-page">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {[m1, m2].map(({ client, responses }) => (
            <div key={client.id} className="survey-card bg-white rounded-2xl border border-cream-300 shadow-card p-6 print:p-4">
              <div className="flex items-center gap-2 mb-5 print:mb-3">
                <div className="w-7 h-7 rounded-full bg-forest-200 flex items-center justify-center text-xs font-bold text-forest-800 flex-shrink-0">
                  {client.first_name[0]}{client.last_name[0]}
                </div>
                <h2 className="font-semibold print:text-sm text-forest-900">{client.first_name} {client.last_name} — Survey Responses</h2>
              </div>
              <SurveyResponses responses={responses} clientDob={client.date_of_birth} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Print Page 4 (optional): Signature block ── */}
      {signatureBlock && (
        <div className="print-only print-sig-page">
          <SignatureBlock members={members} />
        </div>
      )}

    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [reportName, setReportName] = useState('')
  const [members, setMembers] = useState<MemberData[]>([])
  const [advisorNotes, setAdvisorNotes] = useState('')
  const [preferences, setPreferences] = useState<InvestmentPreference[]>([])
  const [loading, setLoading] = useState(true)
  const [advisorFirmName, setAdvisorFirmName] = useState('')
  const [advisorLogoUrl, setAdvisorLogoUrl] = useState<string | null>(null)
  const [advisorSignatureBlock, setAdvisorSignatureBlock] = useState(false)
  const [advisorBrandColor, setAdvisorBrandColor] = useState('#1b4332')

  // Edit modal
  const [allClients, setAllClients] = useState<Client[]>([])
  const [completedAtMap, setCompletedAtMap] = useState<Record<string, string>>({})
  const [advisorTimezone, setAdvisorTimezone] = useState('America/New_York')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editMember1, setEditMember1] = useState('')
  const [editMember2, setEditMember2] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const { data: hh } = await supabase
      .from('households')
      .select('*, advisor_notes, household_members(client_id)')
      .eq('id', id)
      .single()

    if (!hh) { setLoading(false); return }
    setReportName(hh.name)
    setAdvisorNotes((hh as { advisor_notes?: string | null }).advisor_notes ?? '')

    const advisorId = (hh as { advisor_id: string }).advisor_id

    // Load advisor preferences, timezone, and all completed clients in parallel
    const [{ data: prefs }, { data: advisorRow }, { data: allCls }, { data: resps }] = await Promise.all([
      supabase.from('investment_preferences').select('*').eq('advisor_id', advisorId).order('sort_order', { ascending: true }),
      supabase.from('advisors').select('timezone, firm_name, logo_url, signature_block, brand_color').eq('id', advisorId).single(),
      supabase.from('clients').select('*').eq('advisor_id', advisorId).eq('status', 'completed').order('first_name'),
      supabase.from('questionnaire_responses').select('client_id, completed_at'),
    ])
    setPreferences(prefs ?? [])
    if (advisorRow?.timezone) setAdvisorTimezone(advisorRow.timezone)
    if (advisorRow?.firm_name) setAdvisorFirmName(advisorRow.firm_name)
    setAdvisorLogoUrl(advisorRow?.logo_url ?? null)
    setAdvisorSignatureBlock(advisorRow?.signature_block ?? false)
    setAdvisorBrandColor(advisorRow?.brand_color ?? '#1b4332')
    setAllClients(allCls ?? [])
    const map: Record<string, string> = {}
    for (const r of (resps ?? [])) { map[r.client_id] = r.completed_at }
    setCompletedAtMap(map)

    const memberRows: MemberData[] = []
    for (const m of (hh.household_members as { client_id: string }[])) {
      const [{ data: client }, { data: resp }] = await Promise.all([
        supabase.from('clients').select('*').eq('id', m.client_id).single(),
        supabase.from('questionnaire_responses').select('*').eq('client_id', m.client_id).single(),
      ])
      if (client && resp) {
        const profile = calculateRiskProfile(resp)
        memberRows.push({ client, responses: resp, profile })
      }
    }
    setMembers(memberRows)
    setLoading(false)
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  const sortedClients = [...allClients].sort((a, b) => {
    const ta = completedAtMap[a.id] ? new Date(completedAtMap[a.id]).getTime() : 0
    const tb = completedAtMap[b.id] ? new Date(completedAtMap[b.id]).getTime() : 0
    return tb - ta
  })

  const handleOpenEdit = () => {
    setEditName(reportName)
    setEditMember1(members[0]?.client.id ?? '')
    setEditMember2(members[1]?.client.id ?? '')
    setEditError(null)
    setShowEditModal(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editMember2 && editMember1 === editMember2) {
      setEditError('Please select two different clients.')
      return
    }
    setEditSaving(true)
    setEditError(null)

    // Update report name
    const { error: nameErr } = await supabase
      .from('households')
      .update({ name: editName })
      .eq('id', id)

    if (nameErr) { setEditError(nameErr.message); setEditSaving(false); return }

    // Replace members: delete existing, insert new
    await supabase.from('household_members').delete().eq('household_id', id)

    const newMembers = [{ household_id: id, client_id: editMember1 }]
    if (editMember2) newMembers.push({ household_id: id, client_id: editMember2 })

    const { error: membersErr } = await supabase.from('household_members').insert(newMembers)

    if (membersErr) { setEditError(membersErr.message); setEditSaving(false); return }

    setShowEditModal(false)
    setEditSaving(false)
    loadData()
  }

  const handleSaveNotes = async (notes: string) => {
    await supabase.from('households').update({ advisor_notes: notes } as never).eq('id', id)
    setAdvisorNotes(notes)
  }

  if (loading) return (
    <div className="p-8 pt-24 lg:pt-8 flex items-center justify-center min-h-screen">
      <div className="text-forest-600 text-sm">Loading report…</div>
    </div>
  )

  if (members.length === 0) return (
    <div className="p-8 pt-24 lg:pt-8">
      <p className="text-forest-700">Could not load report data. Make sure the survey is completed.</p>
      <Link href="/dashboard/reports" className="text-forest-900 font-semibold underline mt-2 block">← Back to Reports</Link>
    </div>
  )

  const category = combinedCategory(members)
  const categoryColor = CATEGORY_COLORS[category]
  const isCouple = members.length === 2

  return (
    <div className="p-6 lg:p-8 pt-20 lg:pt-8">
      {/* Screen header */}
      <div className="no-print flex items-start gap-4 mb-6">
        <Link href="/dashboard/reports" className="mt-1 text-forest-600 hover:text-forest-900">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-forest-900">{reportName}</h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: categoryColor }}>
              {category}
            </span>
            <span className="text-xs font-medium text-forest-500 bg-cream-100 px-2.5 py-1 rounded-full">
              {isCouple ? 'Couple' : 'Individual'}
            </span>
          </div>
          <p className="text-sm text-forest-600 mt-0.5">
            {members.map(m => `${m.client.first_name} ${m.client.last_name} (${calcAge(m.client.date_of_birth)})`).join(' & ')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-sm font-medium bg-forest-900 text-cream-100 px-4 py-2 rounded-xl hover:bg-forest-800 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              {/* Document body */}
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="currentColor" opacity="0.9"/>
              {/* Folded corner */}
              <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
              {/* PDF label */}
              <text x="5" y="19.5" fontSize="5.5" fontWeight="900" fill="#1b4332" fontFamily="Arial, sans-serif" letterSpacing="0.5">PDF</text>
            </svg>
            Export PDF
          </button>
          <button
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 text-sm font-medium border border-cream-300 text-forest-700 px-4 py-2 rounded-xl hover:bg-cream-50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
            Edit Report
          </button>
        </div>
      </div>

      {/* Edit Report Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-elevated w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-forest-900 mb-1">Edit Report</h2>
            <p className="text-sm text-forest-600 mb-5">Update the report name or change which surveys are included.</p>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{editError}</div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest-800 mb-1.5">Report name *</label>
                <input type="text" required value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-800 mb-1.5">Client *</label>
                <select required value={editMember1} onChange={e => setEditMember1(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent">
                  <option value="">Select a completed survey…</option>
                  {sortedClients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} — {formatSurveyDate(completedAtMap[c.id], advisorTimezone)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-800 mb-1.5">
                  Second client <span className="text-forest-500 font-normal">(optional — for couples)</span>
                </label>
                <select value={editMember2} onChange={e => setEditMember2(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent">
                  <option value="">Individual report (no second client)</option>
                  {sortedClients.filter(c => c.id !== editMember1).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} — {formatSurveyDate(completedAtMap[c.id], advisorTimezone)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-cream-300 text-forest-700 font-medium text-sm py-3 rounded-xl hover:bg-cream-50">
                  Cancel
                </button>
                <button type="submit" disabled={editSaving}
                  className="flex-1 bg-forest-900 text-cream-100 font-semibold text-sm py-3 rounded-xl hover:bg-forest-800 disabled:opacity-60">
                  {editSaving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCouple ? (
        <CoupleReport
          members={members}
          category={category}
          advisorNotes={advisorNotes}
          onSaveNotes={handleSaveNotes}
          preferences={preferences}
          advisorFirmName={advisorFirmName}
          advisorLogoUrl={advisorLogoUrl}
          reportName={reportName}
          signatureBlock={advisorSignatureBlock}
          brandColor={advisorBrandColor}
        />
      ) : (
        <SingleClientReport
          member={members[0]}
          category={category}
          advisorNotes={advisorNotes}
          onSaveNotes={handleSaveNotes}
          preferences={preferences}
          advisorFirmName={advisorFirmName}
          advisorLogoUrl={advisorLogoUrl}
          reportName={reportName}
          signatureBlock={advisorSignatureBlock}
          brandColor={advisorBrandColor}
        />
      )}
    </div>
  )
}
