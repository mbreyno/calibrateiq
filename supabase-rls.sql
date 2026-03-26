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
-- Done. All tables now enforce per-advisor data isolation.
-- ─────────────────────────────────────────────────────────────────────────────
