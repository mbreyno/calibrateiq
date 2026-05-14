import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.calibrateiq.app'

// Sub-user limits per plan
const PLAN_LIMITS: Record<string, number> = {
  solo: 0,
  team: 9,
  plus: 24,
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await req.json().catch(() => ({}))
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Load admin's advisor row
  const { data: advisor } = await admin
    .from('advisors')
    .select('id, plan, parent_advisor_id, subscription_status')
    .eq('user_id', user.id)
    .single()

  if (!advisor) return NextResponse.json({ error: 'Advisor not found.' }, { status: 404 })
  if (advisor.parent_advisor_id) {
    return NextResponse.json({ error: 'Sub-users cannot invite team members.' }, { status: 403 })
  }
  if (advisor.subscription_status !== 'active') {
    return NextResponse.json({ error: 'An active subscription is required to invite team members.' }, { status: 403 })
  }

  const plan = advisor.plan ?? 'solo'
  const limit = PLAN_LIMITS[plan] ?? 0

  if (limit === 0) {
    return NextResponse.json({
      error: 'Your current plan (Solo) does not support team members. Upgrade to Team or Plus to invite sub-users.',
    }, { status: 403 })
  }

  // Count existing sub-users
  const { count } = await admin
    .from('advisors')
    .select('id', { count: 'exact', head: true })
    .eq('parent_advisor_id', advisor.id)

  if ((count ?? 0) >= limit) {
    return NextResponse.json({
      error: `You've reached the maximum of ${limit} sub-user${limit === 1 ? '' : 's'} for your plan.`,
    }, { status: 403 })
  }

  // Send Supabase invite — user.user_metadata will carry parent_advisor_id on first login
  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      parent_advisor_id: advisor.id,
      role: 'sub_user',
    },
    redirectTo: `${APP_URL}/auth/callback`,
  })

  if (inviteError) {
    // Surface friendly errors
    const msg = inviteError.message.includes('already registered')
      ? 'That email address already has a CalibrateIQ account.'
      : inviteError.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
