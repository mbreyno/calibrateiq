'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { InvestmentPreference } from '@/types'

// Common emoji options for investment preference icons
const EMOJI_OPTIONS = [
  '🌱', '📈', '₿', '🏠', '💰', '🛡️', '🌍', '🎯', '💎', '⚡',
  '🔵', '🟢', '⭐', '🔮', '🏦', '📊', '🌿', '💼', '🪙', '🌐',
  '♻️', '🤝', '📉', '🏗️', '🚀', '🌾', '🏥', '💡', '🛢️', '🎲',
]

function EmojiPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-12 h-12 rounded-xl border border-cream-300 bg-cream-50 text-2xl flex items-center justify-center hover:border-forest-400 transition-colors"
      >
        {value}
      </button>
      {open && (
        <div className="absolute left-0 top-14 z-10 bg-white rounded-2xl border border-cream-300 shadow-elevated p-3 w-64">
          <div className="grid grid-cols-6 gap-1">
            {EMOJI_OPTIONS.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => { onChange(emoji); setOpen(false) }}
                className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center hover:bg-cream-100 transition-colors ${value === emoji ? 'bg-forest-100 ring-2 ring-forest-700' : ''}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Firm settings
  const [firmName, setFirmName] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [advisorId, setAdvisorId] = useState<string | null>(null)
  const [masterToken, setMasterToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [copiedMaster, setCopiedMaster] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Investment preferences
  const [preferences, setPreferences] = useState<InvestmentPreference[]>([])
  const [prefLoading, setPrefLoading] = useState(true)
  const [showAddPref, setShowAddPref] = useState(false)
  const [newPrefLabel, setNewPrefLabel] = useState('')
  const [newPrefIcon, setNewPrefIcon] = useState('⭐')
  const [savingPref, setSavingPref] = useState(false)
  const [editingPref, setEditingPref] = useState<InvestmentPreference | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editIcon, setEditIcon] = useState('⭐')
  const [deletingPrefId, setDeletingPrefId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      const { data: advisor } = await supabase
        .from('advisors')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (advisor) {
        setAdvisorId(advisor.id)
        setFirmName(advisor.firm_name ?? '')
        setLogoUrl(advisor.logo_url ?? null)
        setMasterToken(advisor.master_token ?? null)
        loadPreferences(advisor.id)
      }
    }
    load()
  }, [])

  const loadPreferences = async (aid: string) => {
    setPrefLoading(true)
    const { data } = await supabase
      .from('investment_preferences')
      .select('*')
      .eq('advisor_id', aid)
      .order('sort_order', { ascending: true })
    setPreferences(data ?? [])
    setPrefLoading(false)
  }

  const handleAddPreference = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!advisorId || !newPrefLabel.trim()) return
    setSavingPref(true)

    const nextOrder = preferences.length > 0
      ? Math.max(...preferences.map(p => p.sort_order)) + 1
      : 0

    const { error: insertError } = await supabase
      .from('investment_preferences')
      .insert({ advisor_id: advisorId, label: newPrefLabel.trim(), icon: newPrefIcon, sort_order: nextOrder })

    if (!insertError) {
      setNewPrefLabel('')
      setNewPrefIcon('⭐')
      setShowAddPref(false)
      loadPreferences(advisorId)
    }
    setSavingPref(false)
  }

  const handleStartEdit = (pref: InvestmentPreference) => {
    setEditingPref(pref)
    setEditLabel(pref.label)
    setEditIcon(pref.icon)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPref || !advisorId) return
    setSavingPref(true)

    await supabase
      .from('investment_preferences')
      .update({ label: editLabel.trim(), icon: editIcon })
      .eq('id', editingPref.id)

    setEditingPref(null)
    setSavingPref(false)
    loadPreferences(advisorId)
  }

  const handleDeletePreference = async (prefId: string) => {
    if (!advisorId) return
    setDeletingPrefId(prefId)
    await supabase.from('investment_preferences').delete().eq('id', prefId)
    setDeletingPrefId(null)
    loadPreferences(advisorId)
  }

  const handleMoveUp = async (pref: InvestmentPreference, idx: number) => {
    if (idx === 0 || !advisorId) return
    const above = preferences[idx - 1]
    await Promise.all([
      supabase.from('investment_preferences').update({ sort_order: above.sort_order }).eq('id', pref.id),
      supabase.from('investment_preferences').update({ sort_order: pref.sort_order }).eq('id', above.id),
    ])
    loadPreferences(advisorId)
  }

  const handleMoveDown = async (pref: InvestmentPreference, idx: number) => {
    if (idx === preferences.length - 1 || !advisorId) return
    const below = preferences[idx + 1]
    await Promise.all([
      supabase.from('investment_preferences').update({ sort_order: below.sort_order }).eq('id', pref.id),
      supabase.from('investment_preferences').update({ sort_order: pref.sort_order }).eq('id', below.id),
    ])
    loadPreferences(advisorId)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !advisorId || !userId) return

    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be smaller than 2MB.')
      return
    }

    setUploading(true)
    setError(null)

    const ext = file.name.split('.').pop()
    const path = `${userId}/logo.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(path)

    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`

    await supabase
      .from('advisors')
      .update({ logo_url: publicUrl })
      .eq('id', advisorId)

    setLogoUrl(publicUrl)
    setUploading(false)
  }

  const handleRemoveLogo = async () => {
    if (!advisorId) return
    await supabase
      .from('advisors')
      .update({ logo_url: null })
      .eq('id', advisorId)
    setLogoUrl(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!advisorId) return

    setSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('advisors')
      .update({ firm_name: firmName })
      .eq('id', advisorId)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }

    setSaving(false)
  }

  return (
    <div className="p-6 lg:p-8 pt-20 lg:pt-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-forest-900 mb-1">Firm Settings</h1>
        <p className="text-forest-600 text-sm">Your firm name and logo appear on every client questionnaire and report you generate.</p>
      </div>

      {/* Master survey link */}
      {masterToken && (
        <div className="bg-forest-900 rounded-2xl p-6 mb-6 text-cream-100">
          <div className="flex items-start gap-3 mb-3">
            <svg className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
            </svg>
            <div>
              <h2 className="font-semibold text-cream-100">Your Master Survey Link</h2>
              <p className="text-sm text-cream-300 mt-0.5">Send this one link to any client. They enter their own details and complete the survey — no setup required on your end.</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <div className="flex-1 bg-forest-800 border border-forest-700 rounded-xl px-4 py-2.5 text-xs text-cream-300 font-mono truncate">
              {typeof window !== 'undefined' ? window.location.origin : ''}/survey/{masterToken}
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/survey/${masterToken}`)
                setCopiedMaster(true)
                setTimeout(() => setCopiedMaster(false), 2000)
              }}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all ${
                copiedMaster ? 'bg-forest-700 text-cream-100' : 'bg-gold-500 text-forest-900 hover:bg-gold-400'
              }`}
            >
              {copiedMaster ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Logo upload */}
        <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
          <h2 className="font-semibold text-forest-900 mb-4">Firm Logo</h2>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-cream-200 border-2 border-dashed border-cream-400 flex items-center justify-center overflow-hidden flex-shrink-0">
              {logoUrl ? (
                <Image src={logoUrl} alt="Firm logo" width={80} height={80} className="object-contain w-full h-full p-1" />
              ) : (
                <svg className="w-8 h-8 text-forest-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
                </svg>
              )}
            </div>
            <div>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 text-sm font-medium bg-forest-100 text-forest-800 px-4 py-2 rounded-lg hover:bg-forest-200 disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Uploading…
                    </>
                  ) : logoUrl ? 'Replace logo' : 'Upload logo'}
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-forest-500">PNG, JPG, or SVG · Max 2MB · Recommended: square, 400×400px</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Firm name */}
        <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
          <h2 className="font-semibold text-forest-900 mb-4">Firm Name</h2>
          <div>
            <label className="block text-sm font-medium text-forest-800 mb-1.5">Display name</label>
            <input
              type="text"
              value={firmName}
              onChange={e => setFirmName(e.target.value)}
              placeholder="e.g. Westbrook Wealth Management"
              className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white text-forest-900 placeholder-forest-700/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent"
            />
            <p className="text-xs text-forest-500 mt-2">This name appears on your client questionnaires and reports.</p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
          <h2 className="font-semibold text-forest-900 mb-4">Preview</h2>
          <div className="bg-cream-100 rounded-xl p-5 border border-cream-300">
            <div className="flex items-center gap-3 mb-3">
              {logoUrl ? (
                <Image src={logoUrl} alt="Logo" width={36} height={36} className="rounded-lg object-contain bg-white border border-cream-300" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-forest-200 flex items-center justify-center text-xs font-bold text-forest-700">
                  {(firmName || 'FN')[0]}
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-forest-900">{firmName || 'Your Firm Name'}</div>
                <div className="text-xs text-forest-600">Investment Profile Questionnaire</div>
              </div>
            </div>
            <div className="text-xs text-forest-500">This is how your branding appears at the top of your client&apos;s questionnaire.</div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-forest-900 text-cream-100 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-forest-800 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved && (
            <span className="text-sm text-forest-700 font-medium flex items-center gap-1.5">
              <svg className="w-4 h-4 text-forest-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Saved
            </span>
          )}
        </div>
      </form>

      {/* Investment Preferences */}
      <div className="mt-8">
        <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="font-semibold text-forest-900">Investment Preferences</h2>
              <p className="text-sm text-forest-600 mt-0.5">
                These options appear as checkboxes on your client survey. Clients can select any that apply to them.
              </p>
            </div>
            {!showAddPref && (
              <button
                type="button"
                onClick={() => setShowAddPref(true)}
                className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-forest-700 border border-forest-300 px-3 py-2 rounded-xl hover:bg-cream-50 ml-4"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
                Add option
              </button>
            )}
          </div>

          <div className="mt-5 space-y-2">
            {prefLoading ? (
              <div className="text-sm text-forest-500 py-4 text-center">Loading…</div>
            ) : preferences.length === 0 && !showAddPref ? (
              <div className="text-center py-6 border-2 border-dashed border-cream-300 rounded-xl">
                <p className="text-sm text-forest-600 font-medium">No preferences configured yet</p>
                <p className="text-xs text-forest-500 mt-1">Add options your clients can select from during their survey.</p>
              </div>
            ) : (
              preferences.map((pref, idx) => (
                <div key={pref.id}>
                  {editingPref?.id === pref.id ? (
                    /* Edit row */
                    <form onSubmit={handleSaveEdit} className="flex items-center gap-3 bg-cream-50 border border-forest-200 rounded-xl p-3">
                      <EmojiPicker value={editIcon} onChange={setEditIcon} />
                      <input
                        type="text"
                        value={editLabel}
                        onChange={e => setEditLabel(e.target.value)}
                        required
                        autoFocus
                        className="flex-1 px-3 py-2 rounded-lg border border-cream-300 bg-white text-sm text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                      />
                      <button type="submit" disabled={savingPref}
                        className="text-sm font-semibold text-white bg-forest-900 px-4 py-2 rounded-lg hover:bg-forest-800 disabled:opacity-60">
                        {savingPref ? '…' : 'Save'}
                      </button>
                      <button type="button" onClick={() => setEditingPref(null)}
                        className="text-sm text-forest-600 hover:text-forest-900 px-3 py-2 rounded-lg hover:bg-cream-100">
                        Cancel
                      </button>
                    </form>
                  ) : (
                    /* Display row */
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-cream-200 hover:border-cream-300 bg-white group">
                      {/* Reorder */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(pref, idx)}
                          disabled={idx === 0}
                          className="text-forest-300 hover:text-forest-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(pref, idx)}
                          disabled={idx === preferences.length - 1}
                          className="text-forest-300 hover:text-forest-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                          </svg>
                        </button>
                      </div>
                      <span className="text-xl w-8 text-center flex-shrink-0">{pref.icon}</span>
                      <span className="flex-1 text-sm font-medium text-forest-900">{pref.label}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(pref)}
                          className="p-1.5 rounded-lg text-forest-500 hover:text-forest-800 hover:bg-cream-100"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePreference(pref.id)}
                          disabled={deletingPrefId === pref.id}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Add new preference form */}
            {showAddPref && (
              <form onSubmit={handleAddPreference} className="flex items-center gap-3 bg-cream-50 border border-forest-200 rounded-xl p-3 mt-2">
                <EmojiPicker value={newPrefIcon} onChange={setNewPrefIcon} />
                <input
                  type="text"
                  value={newPrefLabel}
                  onChange={e => setNewPrefLabel(e.target.value)}
                  required
                  autoFocus
                  placeholder="e.g. Socially Responsible / ESG Investing"
                  className="flex-1 px-3 py-2 rounded-lg border border-cream-300 bg-white text-sm text-forest-900 placeholder-forest-700/40 focus:outline-none focus:ring-2 focus:ring-forest-700"
                />
                <button type="submit" disabled={savingPref}
                  className="text-sm font-semibold text-white bg-forest-900 px-4 py-2 rounded-lg hover:bg-forest-800 disabled:opacity-60">
                  {savingPref ? '…' : 'Add'}
                </button>
                <button type="button" onClick={() => { setShowAddPref(false); setNewPrefLabel(''); setNewPrefIcon('⭐') }}
                  className="text-sm text-forest-600 hover:text-forest-900 px-3 py-2 rounded-lg hover:bg-cream-100">
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
