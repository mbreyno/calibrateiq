import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

// ── Stripe signature verification (no SDK needed) ─────────────────────────────
function verifyStripeSignature(payload: string, header: string, secret: string): boolean {
  const parts   = header.split(',')
  const tsEntry = parts.find(p => p.startsWith('t='))
  const sigEntry = parts.find(p => p.startsWith('v1='))
  if (!tsEntry || !sigEntry) return false

  const timestamp = tsEntry.slice(2)
  const expected  = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex')

  const provided = sigEntry.slice(3)
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== provided.length) return false
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'))
}

// ── Map Stripe subscription status → our status ───────────────────────────────
function mapStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active':   return 'active'
    case 'trialing': return 'active'   // Stripe-managed trials treated as active
    case 'past_due': return 'past_due'
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired': return 'canceled'
    default: return stripeStatus
  }
}

// ── Map Stripe price ID → our plan name ───────────────────────────────────────
function getPlanFromPriceId(priceId: string | undefined): string | null {
  if (!priceId) return null
  if (priceId === process.env.STRIPE_PRICE_ID)      return 'solo'
  if (priceId === process.env.STRIPE_PRICE_TEAM_ID) return 'team'
  if (priceId === process.env.STRIPE_PRICE_PLUS_ID) return 'plus'
  return null
}

export async function POST(req: NextRequest) {
  const payload   = await req.text()
  const sigHeader = req.headers.get('stripe-signature') ?? ''

  if (!verifyStripeSignature(payload, sigHeader, WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(payload)
  const admin = createAdminClient()

  switch (event.type) {
    // ── Subscription created (after checkout) ──────────────────────────────
    case 'checkout.session.completed': {
      const session = event.data.object
      if (session.mode !== 'subscription') break

      const advisorId    = session.metadata?.advisor_id ?? session.subscription_data?.metadata?.advisor_id
      const customerId   = session.customer
      const subscriptionId = session.subscription

      if (!advisorId) {
        console.error('stripe-webhook: missing advisor_id on checkout session', session.id)
        break
      }

      await admin.from('advisors').update({
        stripe_customer_id:     customerId,
        stripe_subscription_id: subscriptionId,
        subscription_status:    'active',
      }).eq('id', advisorId)
      break
    }

    // ── Subscription updated (renewal, cancel, payment failure, etc.) ──────
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub        = event.data.object
      const customerId = sub.customer

      // Look up advisor by Stripe customer ID
      const { data: advisor } = await admin
        .from('advisors')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (!advisor) {
        console.warn('stripe-webhook: no advisor found for customer', customerId)
        break
      }

      const newStatus = mapStatus(sub.status)
      const priceId   = sub.items?.data?.[0]?.price?.id
      const plan      = getPlanFromPriceId(priceId)

      const updatePayload: Record<string, string> = {
        subscription_status:    newStatus,
        stripe_subscription_id: sub.id,
      }
      if (plan) updatePayload.plan = plan

      await admin.from('advisors').update(updatePayload).eq('id', advisor.id)
      break
    }

    // ── Payment failed ─────────────────────────────────────────────────────
    case 'invoice.payment_failed': {
      const invoice    = event.data.object
      const customerId = invoice.customer

      const { data: advisor } = await admin
        .from('advisors')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (advisor) {
        await admin.from('advisors')
          .update({ subscription_status: 'past_due' })
          .eq('id', advisor.id)
      }
      break
    }

    default:
      // Ignore unhandled event types
      break
  }

  return NextResponse.json({ received: true })
}
