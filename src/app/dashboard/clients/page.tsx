'use client'

import { useState, useEffect } from 'react'
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
  const [clients, setClients] = useState<Client[]>([])
  const [completedAtMap, setCompletedAtMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  const [newFirst, setNewFirst] = useState('')
  const [newLast, setNewLast] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newDOB, setNewDOB] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadClients = async () => {
    setLoading(true)
    const res = await fetch('/api/firm/clients')
    if (res.ok) {
      const { clients: clientsData, responses: responsesData } = await res.json()
      setClients(clientsData ?? [])
      const map: Record<string, string> = {}
      for (const r of (responsesData ?? [])) map[r.client_id] = r.completed_at
      setCompletedAtMap(map)
    }
    setLoading(false)
  }

  useEffect(() => { loadClients() }, [])

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)

    const res = await fetch('/api/firm/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: newFirst, last_name: newLast, email: newEmail, date_of_birth: newDOB || null }),
    })

    const body = await res.json()
    if (!res.ok) {
      setFormError(body.error ?? 'Failed to add client.')
    } else {
      setShowModal(false)
      setNewFirst(''); setNewLast(''); setNewEmail(''); setNewDOB('')
      loadClients()
    }
    setSaving(false)
  }

  const handleDeleteClient = async () => {
    if (!clientToDelete) return
    setDeleting(true)
    await fetch(`/api/firm/clients?id=${clientToDelete.id}`, { method: 'DELETE' })
    setClientToDelete(null)
    setDeleting(false)
    loadClients()
  }

  const filtered = clients.filter(c =>
    `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const formatCompletedAt = (client: Client) => {
    const ts = completedAtMap[client.id]
    if (!ts) return '—'
    const d = new Date(ts)
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="p-6 lg:p-8 pt-20 lg:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-forest-900">Surveys</h1>
          <p className="text-sm text-forest-600 mt-0.5">{clients.length} total survey{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 border border-forest-300 text-forest-700 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-cream-100"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
          Add manually
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
          placeholder="Search surveys by name or email…"
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-cream-300 bg-white text-forest-900 placeholder-forest-700/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-forest-500">Loading surveys…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="font-semibold text-forest-900 mb-1">
              {clients.length === 0 ? 'No surveys yet' : 'No results found'}
            </p>
            <p className="text-sm text-forest-600 mb-5">
              {clients.length === 0 ? 'Send your master link to clients to get started.' : 'Try a different search term.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="text-left text-xs font-semibold text-forest-600 uppercase tracking-wider px-6 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-forest-600 uppercase tracking-wider px-6 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-forest-600 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-forest-600 uppercase tracking-wider px-6 py-3">Completed</th>
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
                    <td className="px-6 py-4 text-sm text-forest-600 whitespace-nowrap">
                      {formatCompletedAt(client)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setClientToDelete(client)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Delete survey"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setClientToDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-elevated w-full max-w-sm p-6">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-forest-900 mb-1">Delete survey?</h2>
            <p className="text-sm text-forest-600 mb-6">
              This will permanently delete <span className="font-semibold text-forest-900">{clientToDelete.first_name} {clientToDelete.last_name}</span>&apos;s survey and all their responses. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setClientToDelete(null)}
                className="flex-1 border border-cream-300 text-forest-700 font-medium text-sm py-3 rounded-xl hover:bg-cream-50">
                Cancel
              </button>
              <button onClick={handleDeleteClient} disabled={deleting}
                className="flex-1 bg-red-600 text-white font-semibold text-sm py-3 rounded-xl hover:bg-red-700 disabled:opacity-60">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-elevated w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-forest-900 mb-1">Add Survey Manually</h2>
            <p className="text-sm text-forest-600 mb-5">A unique questionnaire link will be generated for this person.</p>

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
