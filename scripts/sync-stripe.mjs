/**
 * One-time script: sync active Stripe subscriptions → Supabase advisors table.
 *
 * Usage:
 *   node scripts/sync-stripe.mjs
 *
 * Requires these env vars (copy from .env.local):
 *   STRIPE_SECRET_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

const STRIPE_SECRET_KEY      = process.env.STRIPE_SECRET_KEY
const SUPABASE_URL           = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing env vars. Run with:\n  STRIPE_SECRET_KEY=... NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/sync-stripe.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function stripeGet(path) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  })
  return res.json()
}

async function fetchAllSubscriptions() {
  const subs = []
  let startingAfter = null

  while (true) {
    const qs = new URLSearchParams({ limit: '100', status: 'active' })
    if (startingAfter) qs.set('starting_after', startingAfter)

    const page = await stripeGet(`subscriptions?${qs}`)
    if (page.error) { console.error('Stripe error:', page.error); break }

    subs.push(...page.data)
    if (!page.has_more) break
    startingAfter = page.data[page.data.length - 1].id
  }

  return subs
}

async function main() {
  console.log('Fetching active subscriptions from Stripe…')
  const subscriptions = await fetchAllSubscriptions()
  console.log(`Found ${subscriptions.length} active subscription(s)`)

  let updated = 0
  let skipped = 0
  let notFound = 0

  for (const sub of subscriptions) {
    const customerId     = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
    const subscriptionId = sub.id
    const advisorId      = sub.metadata?.advisor_id ?? null

    // Try to find the advisor row — first by advisor_id in metadata, then by stripe_customer_id
    let query = supabase.from('advisors').select('id, email, subscription_status')

    if (advisorId) {
      query = query.eq('id', advisorId)
    } else if (customerId) {
      query = query.eq('stripe_customer_id', customerId)
    } else {
      console.log(`  ⚠ Sub ${subscriptionId}: no advisor_id metadata or customer ID — skipping`)
      skipped++
      continue
    }

    const { data: rows, error } = await query
    if (error || !rows?.length) {
      console.log(`  ✗ Sub ${subscriptionId} (customer ${customerId}): no matching advisor row`)
      notFound++
      continue
    }

    const row = rows[0]

    if (row.subscription_status === 'active') {
      console.log(`  ✓ ${row.email ?? row.id} already active — skipping`)
      skipped++
      continue
    }

    const { error: updateError } = await supabase
      .from('advisors')
      .update({
        subscription_status:    'active',
        stripe_subscription_id: subscriptionId,
        stripe_customer_id:     customerId,
      })
      .eq('id', row.id)

    if (updateError) {
      console.error(`  ✗ Failed to update ${row.email ?? row.id}:`, updateError.message)
    } else {
      console.log(`  ✔ Updated ${row.email ?? row.id} → active (sub: ${subscriptionId})`)
      updated++
    }
  }

  console.log(`\nDone. Updated: ${updated} | Already active: ${skipped} | Not matched: ${notFound}`)
}

main().catch(err => { console.error(err); process.exit(1) })
