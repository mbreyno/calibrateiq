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
    .select('id, firm_name, logo_url, brand_color, brand_accent, brand_surface, brand_text, ips_notes, signature_block')
    .eq('master_token', token)
    .single()

  if (error || !advisor) {
    return NextResponse.json({ error: 'Advisor not found.' }, { status: 404 })
  }

  // Also fetch investment preferences for this advisor
  const { data: preferences } = await admin
    .from('investment_preferences')
    .select('*')
    .eq('advisor_id', advisor.id)
    .order('sort_order', { ascending: true })

  return NextResponse.json({ advisor, preferences: preferences ?? [] })
}
