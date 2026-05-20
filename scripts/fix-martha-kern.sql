-- One-time fix: upgrade affected customers to Team plan.
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
--
-- The Stripe webhook missed upgrade events (33+ failed attempts since May 14)
-- due to a redirect on the webhook URL. This manually applies the changes.

BEGIN;

-- 1. Preview the rows we're about to fix
SELECT id, email, plan, subscription_status, stripe_customer_id
FROM advisors
WHERE email IN ('martha@planfirstwealth.com', 'michael@elevationfinancial.com')
   OR id = '5a4716a9-1a92-4443-bad5-f7453ebc6c21';

-- 2. Apply the upgrades
UPDATE advisors
SET
  plan                = 'team',
  subscription_status = 'active'
WHERE email IN ('martha@planfirstwealth.com', 'michael@elevationfinancial.com')
   OR id = '5a4716a9-1a92-4443-bad5-f7453ebc6c21';

-- 3. Confirm both rows are updated
SELECT id, email, plan, subscription_status, stripe_customer_id
FROM advisors
WHERE email IN ('martha@planfirstwealth.com', 'michael@elevationfinancial.com')
   OR id = '5a4716a9-1a92-4443-bad5-f7453ebc6c21';

COMMIT;
