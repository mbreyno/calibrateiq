import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/** Returns the effective advisor ID for the current user.
 *  Sub-users share the parent admin's data pool. */
async function getEffectiveAdvisorId(userId: string) {
  const admin = createAdminClient()
  const { data: advisor } = await admin
    .from('advisors')
    .select('id, parent_advisor_id')
    .eq('user_id', userId)
    .single()
  if (!advisor) return null
  return advisor.parent_advisor_id ?? advisor.id
}

/** GET /api/firm/clients — list all clients + latest completion dates for the firm. */
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const advisorId = await getEffectiveAdvisorId(user.id)
  if (!advisorId) return NextResponse.json({ error: 'Advisor not found' }, { status: 404 })

  const admin = createAdminClient()
  const [{ data: clients }, { data: responses }] = await Promise.all([
    admin.from('clients').select('*').eq('advisor_id', advisorId).order('created_at', { ascending: false }),
    admin.from('questionnaire_responses').select('client_id, completed_at'),
  ])

  return NextResponse.json({ clients: clients ?? [], responses: responses ?? [] })
}

/** POST /api/firm/clients — add a new client to the firm. */
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const advisorId = await getEffectiveAdvisorId(user.id)
  if (!advisorId) return NextResponse.json({ error: 'Advisor not found' }, { status: 404 })

  const { first_name, last_name, email, date_of_birth } = await req.json()
  if (!first_name || !last_name || !email) {
    return NextResponse.json({ error: 'first_name, last_name, and email are required.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: client, error } = await admin
    .from('clients')
    .insert({ advisor_id: advisorId, first_name, last_name, email, date_of_birth: date_of_birth || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ client })
}

/** DELETE /api/firm/clients?id=<clientId> — remove a client from the firm. */
export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const advisorId = await getEffectiveAdvisorId(user.id)
  if (!advisorId) return NextResponse.json({ error: 'Advisor not found' }, { status: 404 })

  const clientId = new URL(req.url).searchParams.get('id')
  if (!clientId) return NextResponse.json({ error: 'id is required.' }, { status: 400 })

  const admin = createAdminClient()
  // Verify the client belongs to this firm before deleting
  const { data: existing } = await admin
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .eq('advisor_id', advisorId)
    .single()

  if (!existing) return NextResponse.json({ error: 'Client not found.' }, { status: 404 })

  await admin.from('clients').delete().eq('id', clientId)
  return NextResponse.json({ success: true })
}
