'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Household } from '@/types'

export default function HouseholdsPage() {
  const supabase = createClient()
  const [households, setHouseholds] = useState<(Household & { members: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: hh } = await supabase
        .from('households')
        .select('*, household_members(client_id, clients(first_name, last_name))')
        .order('created_at', { ascending: false })

      if (!hh) { setLoading(false); return }

      const rows = hh.map((h: Record<string, unknown>) => {
        const members = (h.household_members as Array<{ clients: { first_name: string; last_name: string } }>)
          ?.map(m => `${m.clients.first_name} ${m.clients.last_name}`)
          .join(' & ') ?? ''
        return { ...h, members } as Household & { members: string }
      })
      setHouseholds(rows)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="p-6 lg:p-8 pt-20 lg:pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-forest-900">Households</h1>
          <p className="text-sm text-forest-600 mt-0.5">{households.length} household{households.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/dashboard/clients"
          className="inline-flex items-center gap-2 border border-forest-300 text-forest-700 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-cream-100">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
          Create Household
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-forest-500">Loading…</div>
        ) : households.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="font-semibold text-forest-900 mb-1">No households yet</p>
            <p className="text-sm text-forest-600 mb-5">Go to Surveys, select two completed surveys, and click Create Household.</p>
            <Link href="/dashboard/clients"
              className="inline-flex items-center gap-2 bg-forest-900 text-cream-100 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-forest-800">
              Go to Surveys
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-cream-200">
            {households.map(h => (
              <div key={h.id} className="flex items-center justify-between px-6 py-4 hover:bg-cream-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-forest-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-forest-700" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-3h2v3a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-forest-900 text-sm">{h.name}</div>
                    <div className="text-xs text-forest-500 mt-0.5">{h.members}</div>
                  </div>
                </div>
                <Link href={`/dashboard/households/${h.id}`}
                  className="text-xs font-semibold text-forest-700 hover:text-forest-900">
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
