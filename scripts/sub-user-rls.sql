-- ─────────────────────────────────────────────────────────────────────────────
-- Sub-user RLS policies
-- Allows sub-users to read their parent firm's clients, responses, households,
-- household_members, and investment_preferences via the browser supabase client
-- (used by detail pages: clients/[id] and reports/[id]).
--
-- Run this in the Supabase SQL editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper: returns the "effective" advisor ID for the current user —
-- either their own advisor ID, or their parent's if they are a sub-user.
CREATE OR REPLACE FUNCTION get_effective_advisor_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(a.parent_advisor_id, a.id)
  FROM advisors a
  WHERE a.user_id = auth.uid()
  LIMIT 1;
$$;

-- ── clients ──────────────────────────────────────────────────────────────────

-- Drop the old own-only select policy if it exists
DROP POLICY IF EXISTS "advisors can read own clients" ON clients;
DROP POLICY IF EXISTS "Users can view their firm clients" ON clients;

CREATE POLICY "Users can view their firm clients"
  ON clients
  FOR SELECT
  USING (advisor_id = get_effective_advisor_id());

-- ── questionnaire_responses ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "advisors can read own responses" ON questionnaire_responses;
DROP POLICY IF EXISTS "Users can view their firm responses" ON questionnaire_responses;

CREATE POLICY "Users can view their firm responses"
  ON questionnaire_responses
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE advisor_id = get_effective_advisor_id()
    )
  );

-- ── households ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "advisors can read own households" ON households;
DROP POLICY IF EXISTS "Users can view their firm households" ON households;

CREATE POLICY "Users can view their firm households"
  ON households
  FOR SELECT
  USING (advisor_id = get_effective_advisor_id());

-- ── household_members ─────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "advisors can read own household members" ON household_members;
DROP POLICY IF EXISTS "Users can view their firm household members" ON household_members;

CREATE POLICY "Users can view their firm household members"
  ON household_members
  FOR SELECT
  USING (
    household_id IN (
      SELECT id FROM households WHERE advisor_id = get_effective_advisor_id()
    )
  );

-- ── investment_preferences ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "advisors can read own preferences" ON investment_preferences;
DROP POLICY IF EXISTS "Users can view their firm investment preferences" ON investment_preferences;

CREATE POLICY "Users can view their firm investment preferences"
  ON investment_preferences
  FOR SELECT
  USING (advisor_id = get_effective_advisor_id());

-- ── Write policies (added 2026-11-20) ────────────────────────────────────────
-- The SELECT policies above let sub-users read firm reports, but writes still
-- fell under own-id-only policies, so a sub-user's edits to advisor notes, the
-- recommended risk category, accounts, and the Edit Report modal silently
-- affected 0 rows. Applied to production as "sub_user_firm_report_writes".

DROP POLICY IF EXISTS "Users can update their firm households" ON households;
CREATE POLICY "Users can update their firm households"
  ON households
  FOR UPDATE
  USING (advisor_id = get_effective_advisor_id())
  WITH CHECK (advisor_id = get_effective_advisor_id());

DROP POLICY IF EXISTS "Users can manage their firm household members" ON household_members;
CREATE POLICY "Users can manage their firm household members"
  ON household_members
  FOR ALL
  USING (household_id IN (SELECT id FROM households WHERE advisor_id = get_effective_advisor_id()))
  WITH CHECK (household_id IN (SELECT id FROM households WHERE advisor_id = get_effective_advisor_id()));

-- ── clients write policy (added 2026-11-20) ──────────────────────────────────
-- Sub-users' client-notes edits previously persisted only via the over-broad
-- "Public can update client status by token" (USING true) policy, removed in
-- scripts/lock-down-anon-access.sql. Applied as "sub_user_firm_client_updates".
DROP POLICY IF EXISTS "Users can update their firm clients" ON clients;
CREATE POLICY "Users can update their firm clients"
  ON clients
  FOR UPDATE
  USING (advisor_id = get_effective_advisor_id())
  WITH CHECK (advisor_id = get_effective_advisor_id());
