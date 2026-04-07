import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!
const STRIPE_PRICE_ID   = process.env.STRIPE_PRICE_ID!
const APP_URL           = process.env.NEXT_PUBLIC_APP_URL || 'https://app.calibrateiq.app'

async function stripePost(path: string, body: Record<string, string>) {
  const params = new URLSearchParams(body)
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
  return res.json()
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: advisor } = await admin
    .from('advisors')
    .select('id, stripe_customer_id, subscription_status')
    .eq('user_id', user.id)
    .single()

  if (!advisor) return NextResponse.json({ error: 'Advisor not found' }, { status: 404 })

  // Reuse existing Stripe customer or create a new one
  let customerId = advisor.stripe_customer_id
  if (!customerId) {
    const customer = await stripePost('/customers', {
      email: user.email ?? '',
      'metadata[advisor_id]': advisor.id,   // bracket notation required by Stripe REST API
    })
    customerId = customer.id

    // Persist the new customer ID
    await admin.from('advisors').update({ stripe_customer_id: customerId }).eq('id', advisor.id)
  }

  // Create a Checkout Session
  const session = await stripePost('/checkout/sessions', {
    customer: customerId,
    mode: 'subscription',
    'line_items[0][price]': STRIPE_PRICE_ID,
    'line_items[0][quantity]': '1',
    success_url: `${APP_URL}/api/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/upgrade`,
    'subscription_data[metadata][advisor_id]': advisor.id,
  })

  if (!session.url) {
    console.error('Stripe checkout error:', session)
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 })
  }

  return NextResponse.json({ url: session.url })
}
