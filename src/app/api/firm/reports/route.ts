import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function getEffectiveAdvisorId(userId: string) {
  const admin = createAdminClient()
  const { data: advisor } = await admin
    .from('advisors')
    .select('id, parent_advisor_id, timezone')
    .eq('user_id', userId)
    .single()
  if (!advisor) return null
  return { effectiveId: advisor.parent_advisor_id ?? advisor.id, timezone: advisor.timezone ?? 'America/New_York' }
}

/** GET /api/firm/reports — list all reports + clients + responses for the firm. */
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await getEffectiveAdvisorId(user.id)
  if (!result) return NextResponse.json({ error: 'Advisor not found' }, { status: 404 })
  const { effectiveId, timezone } = result

  const admin = createAdminClient()
  const [{ data: households }, { data: clients }] = await Promise.all([
    admin
      .from('households')
      .select('id, name, created_at, household_members(client_id)')
      .eq('advisor_id', effectiveId)
      .order('created_at', { ascending: false }),
    admin.from('clients').select('*').eq('advisor_id', effectiveId).order('first_name'),
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
    households: households ?? [],
    clients:    clients ?? [],
    responses,
    timezone,
  })
}

/** POST /api/firm/reports — create a new household/report for the firm. */
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await getEffectiveAdvisorId(user.id)
  if (!result) return NextResponse.json({ error: 'Advisor not found' }, { status: 404 })
  const { effectiveId } = result

  const { name, member1, member2 } = await req.json()
  if (!name || !member1) {
    return NextResponse.json({ error: 'name and member1 are required.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: report, error: hhError } = await admin
    .from('households')
    .insert({ advisor_id: effectiveId, name })
    .select()
    .single()

  if (hhError || !report) {
    return NextResponse.json({ error: hhError?.message ?? 'Failed to create report.' }, { status: 500 })
  }

  const members = [{ household_id: report.id, client_id: member1 }]
  if (member2) members.push({ household_id: report.id, client_id: member2 })

  const { error: membersError } = await admin.from('household_members').insert(members)
  if (membersError) {
    await admin.from('households').delete().eq('id', report.id)
    return NextResponse.json({ error: membersError.message }, { status: 500 })
  }

  return NextResponse.json({ report })
}

/** DELETE /api/firm/reports?id=<householdId> — remove a report from the firm. */
export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await getEffectiveAdvisorId(user.id)
  if (!result) return NextResponse.json({ error: 'Advisor not found' }, { status: 404 })
  const { effectiveId } = result

  const reportId = new URL(req.url).searchParams.get('id')
  if (!reportId) return NextResponse.json({ error: 'id is required.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('households')
    .select('id')
    .eq('id', reportId)
    .eq('advisor_id', effectiveId)
    .single()

  if (!existing) return NextResponse.json({ error: 'Report not found.' }, { status: 404 })

  await admin.from('households').delete().eq('id', reportId)
  return NextResponse.json({ success: true })
}
