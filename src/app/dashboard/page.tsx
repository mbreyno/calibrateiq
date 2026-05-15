import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const adminClient = createAdminClient()

  // Fetch the current user's own advisor row
  const { data: ownAdvisor } = await adminClient
    .from('advisors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Check if the logged-in user is a sub-user
  const isSubUser = !!ownAdvisor?.parent_advisor_id

  // Check if an emulation cookie is active and resolve the target advisor
  const cookieStore = cookies()
  const emulatedId = cookieStore.get('iq_emulate')?.value
  let advisor = ownAdvisor

  const isEmulating = !!(emulatedId && ownAdvisor && !isSubUser)

  if (isEmulating) {
    const { data: emulatedAdvisor } = await adminClient
      .from('advisors')
      .select('*')
      .eq('id', emulatedId)
      .eq('parent_advisor_id', ownAdvisor.id)
      .single()
    if (emulatedAdvisor) advisor = emulatedAdvisor
  }

  // Resolve display firm name:
  // - Emulating a sub-user → show admin's own firm name
  // - Logged in as sub-user → fetch parent's firm name
  // - Normal admin → use own firm name
  let displayFirmName: string | null = advisor?.firm_name || null

  if (isEmulating) {
    displayFirmName = ownAdvisor?.firm_name || null
  } else if (isSubUser && ownAdvisor?.parent_advisor_id) {
    const { data: parent } = await adminClient
      .from('advisors')
      .select('firm_name')
      .eq('id', ownAdvisor.parent_advisor_id)
      .single()
    displayFirmName = parent?.firm_name || null
  }

  const { data: clients } = advisor
    ? await adminClient
        .from('clients')
        .select('*')
        .eq('advisor_id', advisor.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  const totalClients = clients?.length ?? 0
  const completedClients = clients?.filter(c => c.status === 'completed').length ?? 0
  const pendingClients = totalClients - completedClients

  const recentClients = clients?.slice(0, 10) ?? []

  return (
    <div className="p-6 lg:p-8 pt-20 lg:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-forest-600 font-medium mb-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl font-bold text-forest-900">
            {displayFirmName ?? 'Your Dashboard'}
          </h1>
        </div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 bg-forest-900 text-cream-100 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-forest-800 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
          </svg>
          Master link
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Surveys', value: totalClients, color: 'bg-forest-100 text-forest-800' },
          { label: 'Profiles Complete', value: completedClients, color: 'bg-forest-100 text-forest-800' },
          { label: 'Awaiting Response', value: pendingClients, color: 'bg-gold-300/25 text-gold-800' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-cream-300 shadow-card p-5">
            <div className="text-3xl font-bold text-forest-900 mb-1">{stat.value}</div>
            <div className="text-sm text-forest-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Setup prompt — only for admins with no firm name configured */}
      {!isEmulating && !isSubUser && !advisor?.firm_name && (
        <div className="bg-gold-300/20 border border-gold-400/40 rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-forest-900 text-sm mb-0.5">Finish setting up your profile</div>
            <div className="text-sm text-forest-700/70">Add your firm name and logo so clients see your branding on every questionnaire.</div>
          </div>
          <Link
            href="/dashboard/settings"
            className="flex-shrink-0 bg-forest-900 text-cream-100 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-forest-800"
          >
            Set up
          </Link>
        </div>
      )}

      {/* Clients table */}
      <div className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
          <h2 className="font-semibold text-forest-900">Recent Surveys</h2>
          <Link href="/dashboard/clients" className="text-sm text-forest-700 hover:text-forest-900 font-medium">
            View all →
          </Link>
        </div>

        {recentClients.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 bg-forest-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-forest-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <p className="font-semibold text-forest-900 mb-1">No surveys yet</p>
            <p className="text-sm text-forest-600 mb-5">Share your master link with clients and their completed surveys will appear here.</p>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 bg-forest-900 text-cream-100 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-forest-800"
            >
              Get your master link
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="text-left text-xs font-semibold text-forest-600 uppercase tracking-wider px-6 py-3">Client</th>
                  <th className="text-left text-xs font-semibold text-forest-600 uppercase tracking-wider px-6 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-forest-600 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-forest-600 uppercase tracking-wider px-6 py-3">Added</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {recentClients.map((client: Client) => (
                  <tr key={client.id} className="hover:bg-cream-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-forest-200 flex items-center justify-center text-sm font-bold text-forest-800">
                          {client.first_name[0]}{client.last_name[0]}
                        </div>
                        <span className="font-medium text-forest-900 text-sm">
                          {client.first_name} {client.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-forest-600">{client.email}</td>
                    <td className="px-6 py-4"><StatusBadge status={client.status} /></td>
                    <td className="px-6 py-4 text-sm text-forest-600">
                      {new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="text-xs font-semibold text-forest-700 hover:text-forest-900"
                      >
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
    </div>
  )
}
