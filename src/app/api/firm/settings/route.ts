import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Never cache: these responses must always reflect the current database.
export const dynamic = 'force-dynamic'

/**
 * GET /api/firm/settings
 * Returns the report-relevant settings of the caller's firm: the caller's own
 * row for admins, the parent's row for sub-users. RLS only lets a user read
 * their own advisor row, so a sub-user's browser client can't load the firm's
 * signature block, IUA text, or branding — the admin client does it here,
 * returning only the fields reports need.
 */
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: me } = await admin
    .from('advisors')
    .select('id, parent_advisor_id')
    .eq('user_id', user.id)
    .single()

  if (!me) return NextResponse.json({ error: 'Advisor not found.' }, { status: 404 })

  const firmId = me.parent_advisor_id ?? me.id

  const { data: firm } = await admin
    .from('advisors')
    .select('timezone, firm_name, logo_url, signature_block, brand_color, ips_notes')
    .eq('id', firmId)
    .single()

  return NextResponse.json({
    timezone:        firm?.timezone ?? null,
    firm_name:       firm?.firm_name ?? '',
    logo_url:        firm?.logo_url ?? null,
    signature_block: firm?.signature_block === true,
    brand_color:     firm?.brand_color ?? null,
    ips_notes:       firm?.ips_notes ?? '',
  })
}
