import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!
const APP_URL           = process.env.NEXT_PUBLIC_APP_URL || 'https://app.calibrateiq.app'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: advisor } = await admin
    .from('advisors')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!advisor?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account found.' }, { status: 404 })
  }

  const params = new URLSearchParams({
    customer: advisor.stripe_customer_id,
    return_url: `${APP_URL}/dashboard/settings`,
  })

  const res = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const session = await res.json()
  if (!session.url) {
    console.error('Stripe portal error:', session)
    return NextResponse.json({ error: 'Failed to open billing portal.' }, { status: 500 })
  }

  return NextResponse.json({ url: session.url })
}
