import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface SubUserRecord {
  id: string
  email: string | null
  firm_name: string
  created_at: string
}

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: advisor } = await admin
    .from('advisors')
    .select('id, parent_advisor_id')
    .eq('user_id', user.id)
    .single()

  if (!advisor) return NextResponse.json({ error: 'Advisor not found.' }, { status: 404 })
  if (advisor.parent_advisor_id) return NextResponse.json({ subUsers: [] })

  const { data: subAdvisors } = await admin
    .from('advisors')
    .select('id, email, firm_name, created_at')
    .eq('parent_advisor_id', advisor.id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ subUsers: subAdvisors ?? [] })
}
