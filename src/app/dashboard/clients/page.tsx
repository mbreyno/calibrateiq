'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Client } from '@/types'

function StatusBadge({ status }: { status: Client['status'] }) {
  return status === 'completed' ? (
    <span className="inline-flex items-center gap-1.5 bg-forest-100 text-forest-800 text-xs font-semibold px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-forest-600" />
      Complete
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 bg-gold-300/25 text-gold-700 text-xs font-semibold px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
      Pending
    </span>
  )
}

export default function ClientsPage() {
  const supabase = createClient()

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  const [newFirst, setNewFirst] = useState('')
  const [newLast, setNewLast] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newDOB, setNewDOB] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const loadClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    setClients(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadClients() }, [])

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: advisor } = await supabase
      .from('advisors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!advisor) { setFormError('Advisor profile not found.'); setSaving(false); return }

    const { error } = await supabase.from('clients').insert({
      advisor_id: advisor.id,
      first_name: newFirst,
      last_name: newLast,
      email: newEmail,
      date_of_birth: newDOB || null,
    })

    if (error) {
      setFormError(error.message)
    } else {
      setShowModal(false)
      setNewFirst(''); setNewLast(''); setNewEmail(''); setNewDOB('')
      loadClients()
    }
    setSaving(false)
  }

  const copyLink = (token: string, clientId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    navigator.clipboard.writeText(`${baseUrl}/q/${token}`)
    setCopiedId(clientId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filtered = clients.filter(c =>
    `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-8 pt-20 lg:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-forest-900">Clients</h1>
          <p className="text-sm text-forest-600 mt-0.5">{clients.length} total client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-forest-900 text-cream-100 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-forest-800 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clients by name or email…"
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-cream-300 bg-white text-forest-900 placeholder-forest-700/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-forest-500">Loading clients…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="font-semibold text-forest-900 mb-1">
              {clients.length === 0 ? 'No clients yet' : 'No results found'}
            </p>
            <p className="text-sm text-forest-600 mb-5">
              {clients.length === 0 ? 'Add a client to get started.' : 'Try a different search term.'}
            </p>
            {clients.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-forest-900 text-cream-100 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-forest-800"
              >
                Add your first client
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="text-left text-xs font-semibold text-forest-600 uppercase tracking-wider px-6 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-forest-600 uppercase tracking-wider px-6 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-forest-600 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-forest-600 uppercase tracking-wider px-6 py-3">Questionnaire Link</th>
                  <th className="text-left text-xs font-semibold text-forest-600 uppercase tracking-wider px-6 py-3">Added</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {filtered.map(client => (
                  <tr key={client.id} className="hover:bg-cream-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-forest-200 flex items-center justify-center text-sm font-bold text-forest-800 flex-shrink-0">
                          {client.first_name[0]}{client.last_name[0]}
                        </div>
                        <span className="font-medium text-forest-900 text-sm whitespace-nowrap">
                          {client.first_name} {client.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-forest-600">{client.email}</td>
                    <td className="px-6 py-4"><StatusBadge status={client.status} /></td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => copyLink(client.questionnaire_token, client.id)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                          copiedId === client.id
                            ? 'bg-forest-100 border-forest-300 text-forest-700'
                            : 'bg-cream-50 border-cream-300 text-forest-700 hover:bg-cream-100'
                        }`}
                      >
                        {copiedId === client.id ? (
                          <>
                            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                            </svg>
                            Copy link
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-forest-600 whitespace-nowrap">
                      {new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/clients/${client.id}`} className="text-xs font-semibold text-forest-700 hover:text-forest-900 whitespace-nowrap">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-elevated w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-forest-900 mb-1">Add New Client</h2>
            <p className="text-sm text-forest-600 mb-5">A unique questionnaire link will be generated automatically.</p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{formError}</div>
            )}

            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-forest-800 mb-1.5">First name *</label>
                  <input type="text" required value={newFirst} onChange={e => setNewFirst(e.target.value)} placeholder="Jane"
                    className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 placeholder-forest-700/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-800 mb-1.5">Last name *</label>
                  <input type="text" required value={newLast} onChange={e => setNewLast(e.target.value)} placeholder="Smith"
                    className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 placeholder-forest-700/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-800 mb-1.5">Email *</label>
                <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="jane@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 placeholder-forest-700/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-800 mb-1.5">Date of Birth <span className="text-forest-500 font-normal">(optional)</span></label>
                <input type="date" value={newDOB} onChange={e => setNewDOB(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-forest-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-cream-300 text-forest-700 font-medium text-sm py-3 rounded-xl hover:bg-cream-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-forest-900 text-cream-100 font-semibold text-sm py-3 rounded-xl hover:bg-forest-800 disabled:opacity-60">
                  {saving ? 'Adding…' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
