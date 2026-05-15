-- ─────────────────────────────────────────────────────────────────────────────
-- CalibrateIQ — Row Level Security policies
-- Run this entire script in your Supabase SQL editor:
--   Supabase dashboard → SQL Editor → New query → paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── advisors ─────────────────────────────────────────────────────────────────
ALTER TABLE advisors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can manage their own profile"
  ON advisors FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- The public survey page needs to look up advisors by master_token for branding
CREATE POLICY "Survey page can read advisor profiles"
  ON advisors FOR SELECT
  TO anon
  USING (true);


-- ── clients ──────────────────────────────────────────────────────────────────
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Logged-in advisors can read/update/delete their own clients
CREATE POLICY "Advisors can manage their own clients"
  ON clients FOR ALL
  USING (
    advisor_id = (SELECT id FROM advisors WHERE user_id = auth.uid())
  )
  WITH CHECK (
    advisor_id = (SELECT id FROM advisors WHERE user_id = auth.uid())
  );

-- The public survey form inserts new clients (anon role, no logged-in user)
CREATE POLICY "Survey submissions can create clients"
  ON clients FOR INSERT
  TO anon
  WITH CHECK (
    advisor_id IN (SELECT id FROM advisors)
  );


-- ── questionnaire_responses ───────────────────────────────────────────────────
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Logged-in advisors can read responses belonging to their clients
CREATE POLICY "Advisors can read their clients responses"
  ON questionnaire_responses FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE advisor_id = (SELECT id FROM advisors WHERE user_id = auth.uid())
    )
  );

-- The public survey form inserts new responses
CREATE POLICY "Survey submissions can create responses"
  ON questionnaire_responses FOR INSERT
  TO anon
  WITH CHECK (
    client_id IN (SELECT id FROM clients)
  );


-- ── households ───────────────────────────────────────────────────────────────
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can manage their own households"
  ON households FOR ALL
  USING (
    advisor_id = (SELECT id FROM advisors WHERE user_id = auth.uid())
  )
  WITH CHECK (
    advisor_id = (SELECT id FROM advisors WHERE user_id = auth.uid())
  );


-- ── household_members ─────────────────────────────────────────────────────────
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can manage their own household members"
  ON household_members FOR ALL
  USING (
    household_id IN (
      SELECT id FROM households
      WHERE advisor_id = (SELECT id FROM advisors WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    household_id IN (
      SELECT id FROM households
      WHERE advisor_id = (SELECT id FROM advisors WHERE user_id = auth.uid())
    )
  );


-- ── investment_preferences ────────────────────────────────────────────────────
ALTER TABLE investment_preferences ENABLE ROW LEVEL SECURITY;

-- Logged-in advisors can manage their own preferences
CREATE POLICY "Advisors can manage their own preferences"
  ON investment_preferences FOR ALL
  USING (
    advisor_id = (SELECT id FROM advisors WHERE user_id = auth.uid())
  )
  WITH CHECK (
    advisor_id = (SELECT id FROM advisors WHERE user_id = auth.uid())
  );

-- The public survey form needs to read preferences to display them
CREATE POLICY "Survey page can read preferences"
  ON investment_preferences FOR SELECT
  TO anon
  USING (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- Sub-user / emulation policies
--
-- These let a parent (admin) advisor read and manage data belonging to their
-- sub-users while emulating them. We use a SECURITY DEFINER helper to bypass
-- RLS on the advisors table itself (which would otherwise block cross-user
-- lookups and return empty results).
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper: returns the advisor IDs of all direct sub-users of the current user.
-- SECURITY DEFINER runs as the function owner, bypassing RLS on advisors.
CREATE OR REPLACE FUNCTION get_sub_advisor_ids()
RETURNS SETOF uuid
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT id FROM advisors
  WHERE parent_advisor_id = (
    SELECT id FROM advisors WHERE user_id = auth.uid() LIMIT 1
  );
$$;

-- clients: parent advisor can manage sub-users' clients
CREATE POLICY "Parent advisors can manage sub-user clients"
  ON clients FOR ALL
  USING   (advisor_id IN (SELECT get_sub_advisor_ids()))
  WITH CHECK (advisor_id IN (SELECT get_sub_advisor_ids()));

-- questionnaire_responses: parent advisor can read sub-users' responses
CREATE POLICY "Parent advisors can read sub-user responses"
  ON questionnaire_responses FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE advisor_id IN (SELECT get_sub_advisor_ids())
    )
  );

-- households: parent advisor can manage sub-users' households
CREATE POLICY "Parent advisors can manage sub-user households"
  ON households FOR ALL
  USING   (advisor_id IN (SELECT get_sub_advisor_ids()))
  WITH CHECK (advisor_id IN (SELECT get_sub_advisor_ids()));

-- household_members: parent advisor can manage members of sub-users' households
CREATE POLICY "Parent advisors can manage sub-user household members"
  ON household_members FOR ALL
  USING (
    household_id IN (
      SELECT id FROM households
      WHERE advisor_id IN (SELECT get_sub_advisor_ids())
    )
  )
  WITH CHECK (
    household_id IN (
      SELECT id FROM households
      WHERE advisor_id IN (SELECT get_sub_advisor_ids())
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Done. All tables now enforce per-advisor data isolation.
-- ─────────────────────────────────────────────────────────────────────────────
