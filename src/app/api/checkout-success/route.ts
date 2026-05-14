import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.calibrateiq.app'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.redirect(`${APP_URL}/upgrade`)

  try {
    // Fetch the completed session from Stripe to verify payment and get IDs
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    })
    const session = await res.json()

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.redirect(`${APP_URL}/upgrade`)
    }

    const advisorId      = session.metadata?.advisor_id
    const customerId     = session.customer
    const subscriptionId = session.subscription

    const admin = createAdminClient()

    // Immediately mark the advisor as active — don't wait for the webhook
    const plan = (['solo', 'team', 'plus'].includes(session.metadata?.plan)
      ? session.metadata.plan
      : 'solo') as string

    if (advisorId) {
      await admin.from('advisors').update({
        subscription_status:    'active',
        plan,
        stripe_customer_id:     customerId,
        stripe_subscription_id: subscriptionId,
      }).eq('id', advisorId)
    } else if (customerId) {
      // Fallback: look up by Stripe customer ID (covers edge cases)
      await admin.from('advisors').update({
        subscription_status:    'active',
        plan,
        stripe_subscription_id: subscriptionId,
      }).eq('stripe_customer_id', customerId)
    } else {
      console.error('checkout-success: cannot identify advisor for session', sessionId)
    }

  } catch (err) {
    console.error('checkout-success error:', err)
  }

  return NextResponse.redirect(`${APP_URL}/dashboard`)
}
