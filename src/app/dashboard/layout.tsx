import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import DashboardNav from './DashboardNav'
import type { Advisor } from '@/types'

/** Returns true if the advisor currently has valid access. */
function hasAccess(advisor: {
  subscription_status?: string | null
  trial_ends_at?: string | null
  stripe_subscription_id?: string | null
}): boolean {
  const status = advisor.subscription_status ?? 'trialing'
  if (status === 'active') return true
  if (advisor.stripe_subscription_id && status !== 'canceled') return true
  if (status === 'trialing') {
    return !!advisor.trial_ends_at && new Date(advisor.trial_ends_at) > new Date()
  }
  return false
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const adminClient = createAdminClient()

  let { data: advisor } = await adminClient
    .from('advisors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!advisor) {
    const meta = user.user_metadata
    const parentAdvisorId = (meta?.parent_advisor_id as string | null) ?? null
    const isSubUserInvite = meta?.role === 'sub_user' && !!parentAdvisorId

    const { data: newAdvisor } = await adminClient
      .from('advisors')
      .insert({
        user_id: user.id,
        email: user.email ?? null,
        firm_name: isSubUserInvite ? '' : (meta?.firm_name ?? ''),
        subscription_status: isSubUserInvite ? 'active' : 'trialing',
        trial_ends_at: isSubUserInvite ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        parent_advisor_id: parentAdvisorId,
        plan: isSubUserInvite ? null : 'solo',
      })
      .select()
      .single()
    advisor = newAdvisor
  }

  const isSubUser = !!(advisor as Advisor)?.parent_advisor_id
  let advisorForNav: Advisor = advisor as Advisor

  if (isSubUser) {
    // Sub-user: gate access on parent's subscription and inherit parent branding
    const { data: parentAdvisor } = await adminClient
      .from('advisors')
      .select('*')
      .eq('id', (advisor as Advisor).parent_advisor_id!)
      .single()

    if (!parentAdvisor || !hasAccess(parentAdvisor)) {
      redirect('/upgrade')
    }

    // Sub-users see parent firm's branding in the nav
    advisorForNav = {
      ...(advisor as Advisor),
      firm_name:     parentAdvisor.firm_name,
      logo_url:      parentAdvisor.logo_url,
      brand_color:   parentAdvisor.brand_color,
      brand_accent:  parentAdvisor.brand_accent,
      brand_surface: parentAdvisor.brand_surface,
      brand_text:    parentAdvisor.brand_text,
      ips_notes:     parentAdvisor.ips_notes,
    }
  } else {
    if (!hasAccess(advisor ?? {})) {
      redirect('/upgrade')
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 print:bg-white flex">
      <DashboardNav advisor={advisorForNav} isSubUser={isSubUser} />
      <main className="flex-1 lg:ml-60 min-h-screen">
        {children}
      </main>
    </div>
  )
}
