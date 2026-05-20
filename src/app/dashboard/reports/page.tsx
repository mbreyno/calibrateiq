'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Client } from '@/types'

interface Report {
  id: string
  name: string
  created_at: string
  household_members: { client_id: string }[]
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [completedAtMap, setCompletedAtMap] = useState<Record<string, string>>({})
  const [advisorTimezone, setAdvisorTimezone] = useState('America/New_York')
  const [loading, setLoading] = useState(true)

  // Create report modal state
  const [showModal, setShowModal] = useState(false)
  const [reportName, setReportName] = useState('')
  const [member1, setMember1] = useState('')
  const [member2, setMember2] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Delete state
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Client name lookup
  const clientMap = Object.fromEntries(clients.map(c => [c.id, `${c.first_name} ${c.last_name}`]))

  const formatSurveyDate = (clientId: string) => {
    const ts = completedAtMap[clientId]
    if (!ts) return ''
    const d = new Date(ts)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: advisorTimezone }) +
      ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: advisorTimezone })
  }

  // Sort completed clients by most recent survey first
  const sortedCompletedClients = [...clients]
    .filter(c => c.status === 'completed')
    .sort((a, b) => {
      const ta = completedAtMap[a.id] ? new Date(completedAtMap[a.id]).getTime() : 0
      const tb = completedAtMap[b.id] ? new Date(completedAtMap[b.id]).getTime() : 0
      return tb - ta
    })

  const loadData = async () => {
    setLoading(true)
    const res = await fetch('/api/firm/reports')
    if (res.ok) {
      const { households, clients: cls, responses, timezone } = await res.json()
      if (timezone) setAdvisorTimezone(timezone)
      setReports((households ?? []) as Report[])
      setClients(cls ?? [])
      const map: Record<string, string> = {}
      for (const r of (responses ?? [])) map[r.client_id] = r.completed_at
      setCompletedAtMap(map)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const completedClients = clients.filter(c => c.status === 'completed') // used for empty-state check only

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (member2 && member1 === member2) {
      setFormError('Please select two different surveys.')
      return
    }
    setSaving(true)
    setFormError(null)

    const res = await fetch('/api/firm/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: reportName, member1, member2: member2 || undefined }),
    })

    const body = await res.json()
    if (!res.ok) {
      setFormError(body.error ?? 'Failed to create report.')
      setSaving(false)
      return
    }

    setShowModal(false)
    setReportName(''); setMember1(''); setMember2('')
    window.location.href = `/dashboard/reports/${body.report.id}`
  }

  const handleDeleteReport = async () => {
    if (!reportToDelete) return
    setDeleting(true)
    await fetch(`/api/firm/reports?id=${reportToDelete.id}`, { method: 'DELETE' })
    setReportToDelete(null)
    setDeleting(false)
    loadData()
  }

  return (
    <div className="p-6 lg:p-8 pt-20 lg:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-forest-900">Reports</h1>
          <p className="text-sm text-forest-600 mt-0.5">{reports.length} report{reports.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-forest-900 text-cream-100 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-forest-800"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
          Create Report
        </button>
      </div>

      {/* Reports list */}
      <div className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-forest-500">Loading reports…</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-cream-200 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-forest-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
            </div>
            <p className="font-semibold text-forest-900 mb-1">No reports yet</p>
            <p className="text-sm text-forest-600 mb-5">Create a report for an individual or a couple to get started.</p>
            <button onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-forest-900 text-cream-100 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-forest-800">
              Create your first report
            </button>
          </div>
        ) : (
          <div className="divide-y divide-cream-200">
            {reports.map(report => {
              const memberNames = report.household_members.map(m => clientMap[m.client_id]).filter(Boolean)
              const isCouple = report.household_members.length === 2
              return (
                <div key={report.id} className="flex items-center gap-4 px-6 py-4 hover:bg-cream-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-forest-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-forest-700" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-forest-900 text-sm">{report.name}</span>
                      <span className="text-xs text-forest-500 bg-cream-100 px-2 py-0.5 rounded-full">
                        {isCouple ? 'Couple' : 'Individual'}
                      </span>
                    </div>
                    <p className="text-xs text-forest-500 mt-0.5 truncate">{memberNames.join(' & ')}</p>
                  </div>
                  <div className="text-xs text-forest-400 whitespace-nowrap hidden sm:block">
                    {new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/dashboard/reports/${report.id}`}
                      className="text-xs font-semibold text-forest-700 hover:text-forest-900 whitespace-nowrap">
                      View →
                    </Link>
                    <button onClick={() => setReportToDelete(report)}
                      className="text-red-400 hover:text-red-600 transition-colors" title="Delete report">
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-elevated w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-forest-900 mb-1">Create Report</h2>
            <p className="text-sm text-forest-600 mb-5">Select one client for an individual report, or two for a couple.</p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{formError}</div>
            )}

            {completedClients.length === 0 && (
              <div className="mb-4 p-3 rounded-xl bg-gold-50 border border-gold-200 text-sm text-gold-800">
                No completed surveys yet. Send your survey link to clients first.
              </div>
            )}

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest-800 mb-1.5">Report name *</label>
                <input type="text" required value={reportName} onChange={e => setReportName(e.target.value)}
                  placeholder="e.g. Reynolds Financial Plan 2026"
                  className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 placeholder-forest-700/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-800 mb-1.5">Client *</label>
                <select required value={member1} onChange={e => setMember1(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent">
                  <option value="">Select a completed survey…</option>
                  {sortedCompletedClients.map(c => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {formatSurveyDate(c.id)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-800 mb-1.5">
                  Second client <span className="text-forest-500 font-normal">(optional — for couples)</span>
                </label>
                <select value={member2} onChange={e => setMember2(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent">
                  <option value="">Individual report (no second client)</option>
                  {sortedCompletedClients.filter(c => c.id !== member1).map(c => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {formatSurveyDate(c.id)}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setFormError(null); setReportName(''); setMember1(''); setMember2('') }}
                  className="flex-1 border border-cream-300 text-forest-700 font-medium text-sm py-3 rounded-xl hover:bg-cream-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving || completedClients.length === 0}
                  className="flex-1 bg-forest-900 text-cream-100 font-semibold text-sm py-3 rounded-xl hover:bg-forest-800 disabled:opacity-60">
                  {saving ? 'Creating…' : 'Create Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setReportToDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-elevated w-full max-w-sm p-6">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-forest-900 mb-1">Delete report?</h2>
            <p className="text-sm text-forest-600 mb-6">
              This will permanently delete <span className="font-semibold text-forest-900">{reportToDelete.name}</span> and its advisor notes. The underlying surveys will not be affected.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setReportToDelete(null)}
                className="flex-1 border border-cream-300 text-forest-700 font-medium text-sm py-3 rounded-xl hover:bg-cream-50">
                Cancel
              </button>
              <button onClick={handleDeleteReport} disabled={deleting}
                className="flex-1 bg-red-600 text-white font-semibold text-sm py-3 rounded-xl hover:bg-red-700 disabled:opacity-60">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
