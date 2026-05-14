import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.calibrateiq.app'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sub_advisor_id } = await req.json().catch(() => ({}))
  if (!sub_advisor_id) return NextResponse.json({ error: 'sub_advisor_id is required.' }, { status: 400 })

  const admin = createAdminClient()

  const { data: advisor } = await admin
    .from('advisors')
    .select('id, parent_advisor_id')
    .eq('user_id', user.id)
    .single()

  if (!advisor || advisor.parent_advisor_id) {
    return NextResponse.json({ error: 'Only admin users can emulate sub-users.' }, { status: 403 })
  }

  // Verify the target belongs to this admin
  const { data: target } = await admin
    .from('advisors')
    .select('id')
    .eq('id', sub_advisor_id)
    .eq('parent_advisor_id', advisor.id)
    .single()

  if (!target) {
    return NextResponse.json({ error: 'Sub-user not found.' }, { status: 404 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set('iq_emulate', sub_advisor_id, {
    path: '/',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8,   // 8-hour emulation window
    httpOnly: false,         // allow client pages to read it for data scoping
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}
