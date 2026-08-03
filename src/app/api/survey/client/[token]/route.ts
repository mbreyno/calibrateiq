import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/survey/client/[token]
 *
 * Public endpoint — no auth required.
 * Looks up a client by questionnaire_token using the admin client, then the
 * owning advisor (RLS blocks anonymous reads of advisors, which is why the
 * legacy /q page rendered unbranded). Returns only public-facing fields.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params
  if (!token) return NextResponse.json({ error: 'Token required.' }, { status: 400 })

  const admin = createAdminClient()

  const { data: client, error: clientError } = await admin
    .from('clients')
    .select('id, advisor_id, first_name, last_name, email, date_of_birth, status')
    .eq('questionnaire_token', token)
    .single()

  if (clientError || !client) {
    return NextResponse.json({ error: 'Client not found.' }, { status: 404 })
  }

  const { data: advisor, error: advisorError } = await admin
    .from('advisors')
    .select('id, firm_name, logo_url, brand_color, brand_accent, brand_surface, brand_text, parent_advisor_id')
    .eq('id', client.advisor_id)
    .single()

  if (advisorError || !advisor) {
    return NextResponse.json({ error: 'Advisor not found.' }, { status: 404 })
  }

  // Sub-users inherit branding from their parent firm
  let brandingAdvisor = advisor
  if (advisor.parent_advisor_id) {
    const { data: parent } = await admin
      .from('advisors')
      .select('firm_name, logo_url, brand_color, brand_accent, brand_surface, brand_text')
      .eq('id', advisor.parent_advisor_id)
      .single()

    if (parent) {
      brandingAdvisor = { ...advisor, ...parent }
    }
  }

  return NextResponse.json({ client, advisor: brandingAdvisor })
}
