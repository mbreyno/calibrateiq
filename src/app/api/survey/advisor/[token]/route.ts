import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/survey/advisor/[token]
 *
 * Public endpoint — no auth required.
 * Looks up an advisor by master_token using the admin client (bypasses RLS)
 * and returns only the public-facing fields needed by the survey page.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params
  if (!token) return NextResponse.json({ error: 'Token required.' }, { status: 400 })

  const admin = createAdminClient()

  const { data: advisor, error } = await admin
    .from('advisors')
    .select('id, firm_name, logo_url, brand_color, brand_accent, brand_surface, brand_text, ips_notes, signature_block, parent_advisor_id')
    .eq('master_token', token)
    .single()

  if (error || !advisor) {
    return NextResponse.json({ error: 'Advisor not found.' }, { status: 404 })
  }

  // Sub-users inherit branding and IPS notes from their parent firm
  let brandingAdvisor = advisor
  if (advisor.parent_advisor_id) {
    const { data: parent } = await admin
      .from('advisors')
      .select('firm_name, logo_url, brand_color, brand_accent, brand_surface, brand_text, ips_notes')
      .eq('id', advisor.parent_advisor_id)
      .single()

    if (parent) {
      brandingAdvisor = { ...advisor, ...parent }
    }
  }

  // Fetch investment preferences — use parent's if sub-user, own if admin
  const prefAdvisorId = advisor.parent_advisor_id ?? advisor.id
  const { data: preferences } = await admin
    .from('investment_preferences')
    .select('*')
    .eq('advisor_id', prefAdvisorId)
    .order('sort_order', { ascending: true })

  return NextResponse.json({ advisor: brandingAdvisor, preferences: preferences ?? [] })
}
