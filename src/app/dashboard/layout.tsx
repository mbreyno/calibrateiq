import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import DashboardNav from './DashboardNav'

/** Returns true if the advisor currently has valid access (active sub or live trial). */
function hasAccess(advisor: {
  subscription_status?: string | null
  trial_ends_at?: string | null
}): boolean {
  const status = advisor.subscription_status ?? 'trialing'
  if (status === 'active') return true
  if (status === 'trialing') {
    return !!advisor.trial_ends_at && new Date(advisor.trial_ends_at) > new Date()
  }
  return false
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch or create advisor profile
  let { data: advisor } = await supabase
    .from('advisors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!advisor) {
    // First login — create advisor row and start 7-day trial
    const meta = user.user_metadata
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const admin = createAdminClient()
    const { data: newAdvisor } = await admin
      .from('advisors')
      .insert({
        user_id: user.id,
        firm_name: meta?.firm_name ?? '',
        subscription_status: 'trialing',
        trial_ends_at: trialEndsAt,
      })
      .select()
      .single()
    advisor = newAdvisor
  }

  // Subscription gate — skip for the upgrade page itself
  if (!hasAccess(advisor ?? {})) {
    redirect('/upgrade')
  }

  return (
    <div className="min-h-screen bg-cream-100 flex">
      <DashboardNav advisor={advisor} />
      <main className="flex-1 lg:ml-60 min-h-screen">
        {children}
      </main>
    </div>
  )
}
