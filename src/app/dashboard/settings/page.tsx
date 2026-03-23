'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [firmName, setFirmName] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [advisorId, setAdvisorId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      }
    }
    load()
  }, [])

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
        <p className="text-forest-600 text-sm">Your firm name and logo appear on every client questionnaire and IPS you generate.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Logo upload */}
        <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
          <h2 className="font-semibold text-forest-900 mb-4">Firm Logo</h2>
          <div className="flex items-center gap-5">
            {/* Preview */}
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
            <p className="text-xs text-forest-500 mt-2">This name appears on your client questionnaires and Investment Policy Statements.</p>
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
            <div className="text-xs text-forest-500">This is how your branding appears at the top of your client's questionnaire.</div>
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
    </div>
  )
}
