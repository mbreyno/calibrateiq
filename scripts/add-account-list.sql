-- "List out accounts and individual strategy" feature.
--
-- households.accounts: JSONB array of account rows, each
-- { id, label, last_four, tax_treatment, strategy, purpose }.
-- strategy holds one of the five risk categories ('' if unset);
-- purpose ("Investment Purpose") is advisor free text.
--
-- The section is available on every report by default and only prints
-- when accounts exist. (An advisors.list_accounts toggle shipped briefly
-- on 2026-08-03 and was removed the same day; the column was dropped.)
--
-- Applied to production via Supabase migrations "add_account_list_feature"
-- and "drop_list_accounts_toggle" on 2026-08-03.

ALTER TABLE households
  ADD COLUMN IF NOT EXISTS accounts JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE advisors DROP COLUMN IF EXISTS list_accounts;
