-- "List out accounts and individual strategy" feature.
--
-- advisors.list_accounts: per-firm toggle, OFF by default for all current and
-- future advisors. households.accounts: JSONB array of account rows, each
-- { id, label, last_four, tax_treatment, strategy }.
--
-- Applied to production via Supabase migration "add_account_list_feature"
-- on 2026-08-03.

ALTER TABLE advisors
  ADD COLUMN IF NOT EXISTS list_accounts BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE households
  ADD COLUMN IF NOT EXISTS accounts JSONB NOT NULL DEFAULT '[]'::jsonb;
