import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/emulation/reports
 *
 * Returns the households (reports), clients, and questionnaire response
 * timestamps for the sub-user currently being emulated by an admin.
 * Uses the admin client so RLS never blocks the cross-user read.
 */
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cookieStore = cookies()
  const emulatedId = cookieStore.get('iq_emulate')?.value
  if (!emulatedId) return NextResponse.json({ error: 'No emulation active.' }, { status: 400 })

  const admin = createAdminClient()

  // Verify the caller is the parent of the emulated advisor
  const { data: callerAdvisor } = await admin
    .from('advisors')
    .select('id, parent_advisor_id')
    .eq('user_id', user.id)
    .single()

  if (!callerAdvisor || callerAdvisor.parent_advisor_id) {
    return NextResponse.json({ error: 'Only admin users can emulate.' }, { status: 403 })
  }

  const { data: target } = await admin
    .from('advisors')
    .select('id, timezone')
    .eq('id', emulatedId)
    .eq('parent_advisor_id', callerAdvisor.id)
    .single()

  if (!target) {
    return NextResponse.json({ error: 'Sub-user not found or not yours.' }, { status: 404 })
  }

  // Fetch all data for the emulated advisor using admin client (bypasses RLS)
  const [{ data: households }, { data: clients }] = await Promise.all([
    admin
      .from('households')
      .select('id, name, created_at, household_members(client_id)')
      .eq('advisor_id', target.id)
      .order('created_at', { ascending: false }),
    admin.from('clients').select('*').eq('advisor_id', target.id).order('first_name'),
  ])

  const completedIds = (clients ?? []).filter(c => c.status === 'completed').map(c => c.id)
  let responses: { client_id: string; completed_at: string }[] = []
  if (completedIds.length > 0) {
    const { data: resps } = await admin
      .from('questionnaire_responses')
      .select('client_id, completed_at')
      .in('client_id', completedIds)
    responses = resps ?? []
  }

  return NextResponse.json({
    advisor: { id: target.id, timezone: target.timezone },
    households: households ?? [],
    clients: clients ?? [],
    responses,
  })
}
