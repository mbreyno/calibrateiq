-- ─────────────────────────────────────────────────────────────────────────────
-- CalibrateIQ — Subscription columns migration
-- Run once in: Supabase dashboard → SQL Editor → New query → paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE advisors
  ADD COLUMN IF NOT EXISTS stripe_customer_id      TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id  TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status     TEXT NOT NULL DEFAULT 'trialing',
  ADD COLUMN IF NOT EXISTS trial_ends_at           TIMESTAMPTZ;

-- Existing advisors: leave trial_ends_at NULL so they're prompted to upgrade
-- immediately on next login. New advisors get trial_ends_at set by the app.
