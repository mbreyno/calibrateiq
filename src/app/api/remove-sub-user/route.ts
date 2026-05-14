import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sub_advisor_id } = await req.json().catch(() => ({}))
  if (!sub_advisor_id) return NextResponse.json({ error: 'sub_advisor_id is required.' }, { status: 400 })

  const admin = createAdminClient()

  // Load admin's advisor row
  const { data: advisor } = await admin
    .from('advisors')
    .select('id, parent_advisor_id')
    .eq('user_id', user.id)
    .single()

  if (!advisor) return NextResponse.json({ error: 'Advisor not found.' }, { status: 404 })
  if (advisor.parent_advisor_id) {
    return NextResponse.json({ error: 'Sub-users cannot remove team members.' }, { status: 403 })
  }

  // Verify the sub-user belongs to this admin
  const { data: subAdvisor } = await admin
    .from('advisors')
    .select('id, user_id')
    .eq('id', sub_advisor_id)
    .eq('parent_advisor_id', advisor.id)
    .single()

  if (!subAdvisor) {
    return NextResponse.json({ error: 'Sub-user not found or does not belong to your account.' }, { status: 404 })
  }

  // Clear the parent_advisor_id link (detach the sub-user without deleting their account or data)
  await admin.from('advisors').update({ parent_advisor_id: null, subscription_status: 'canceled' }).eq('id', subAdvisor.id)

  return NextResponse.json({ success: true })
}
