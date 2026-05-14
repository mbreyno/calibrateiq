import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/parent-settings
 * Returns the parent advisor's ips_notes and investment_preferences for sub-users.
 * Uses the admin client so RLS doesn't block the cross-user read.
 */
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Get this user's advisor row to find parent_advisor_id
  const { data: advisor } = await admin
    .from('advisors')
    .select('id, parent_advisor_id')
    .eq('user_id', user.id)
    .single()

  if (!advisor?.parent_advisor_id) {
    return NextResponse.json({ error: 'Not a sub-user.' }, { status: 403 })
  }

  const parentId = advisor.parent_advisor_id

  // Fetch parent's ips_notes and preferences in parallel
  const [{ data: parent }, { data: prefs }] = await Promise.all([
    admin.from('advisors').select('ips_notes').eq('id', parentId).single(),
    admin
      .from('investment_preferences')
      .select('*')
      .eq('advisor_id', parentId)
      .order('sort_order', { ascending: true }),
  ])

  return NextResponse.json({
    ips_notes:   parent?.ips_notes ?? '',
    preferences: prefs ?? [],
  })
}
