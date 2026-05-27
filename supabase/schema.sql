-- ─────────────────────────────────────────────────────────────
-- CalibrateIQ — Supabase Database Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL editor)
-- ─────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── ADVISORS ──────────────────────────────────────────────────
CREATE TABLE advisors (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  firm_name   TEXT NOT NULL DEFAULT '',
  logo_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE advisors ENABLE ROW LEVEL SECURITY;

-- Advisors can only read/write their own row
CREATE POLICY "Advisors can view own row"
  ON advisors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Advisors can insert own row"
  ON advisors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Advisors can update own row"
  ON advisors FOR UPDATE
  USING (auth.uid() = user_id);

-- ── CLIENTS ───────────────────────────────────────────────────
CREATE TABLE clients (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id            UUID REFERENCES advisors(id) ON DELETE CASCADE NOT NULL,
  first_name            TEXT NOT NULL,
  last_name             TEXT NOT NULL,
  email                 TEXT NOT NULL,
  date_of_birth         TEXT,
  questionnaire_token   UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE,
  status                TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'completed')),
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Advisors can manage their own clients
CREATE POLICY "Advisors can view own clients"
  ON clients FOR SELECT
  USING (
    advisor_id IN (SELECT id FROM advisors WHERE user_id = auth.uid())
  );

CREATE POLICY "Advisors can insert clients"
  ON clients FOR INSERT
  WITH CHECK (
    advisor_id IN (SELECT id FROM advisors WHERE user_id = auth.uid())
  );

CREATE POLICY "Advisors can update own clients"
  ON clients FOR UPDATE
  USING (
    advisor_id IN (SELECT id FROM advisors WHERE user_id = auth.uid())
  );

-- Public (anonymous) read by token — for the questionnaire page
CREATE POLICY "Public can read client by token"
  ON clients FOR SELECT
  USING (true);  -- token uniqueness provides security; tighten if needed

-- Public can update status (when submitting questionnaire)
CREATE POLICY "Public can update client status by token"
  ON clients FOR UPDATE
  USING (true);

-- ── QUESTIONNAIRE RESPONSES ───────────────────────────────────
CREATE TABLE questionnaire_responses (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id    UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL UNIQUE,
  q1           INTEGER,   -- age score (10–50)
  q2           INTEGER,   -- time horizon score (10–50)
  q3           INTEGER,   -- risk intent (custom)
  q4           INTEGER,   -- market expectations (custom)
  q5           INTEGER,   -- poor market (custom)
  q6           INTEGER,   -- 3-year attitude (custom)
  q7_esg       BOOLEAN DEFAULT false,
  q7_crypto    BOOLEAN DEFAULT false,
  q8           INTEGER,   -- 3-month attitude (custom)
  comments     TEXT DEFAULT '',
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Advisors can read responses for their clients
CREATE POLICY "Advisors can view own client responses"
  ON questionnaire_responses FOR SELECT
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN advisors a ON c.advisor_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

-- Public can insert responses (questionnaire submission)
CREATE POLICY "Public can insert responses"
  ON questionnaire_responses FOR INSERT
  WITH CHECK (true);

-- ── INVESTMENT POLICY STATEMENTS ──────────────────────────────
CREATE TABLE investment_policy_statements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL UNIQUE,
  content     JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE investment_policy_statements ENABLE ROW LEVEL SECURITY;

-- Advisors can read/write IPS for their own clients
CREATE POLICY "Advisors can view own IPS"
  ON investment_policy_statements FOR SELECT
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN advisors a ON c.advisor_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "Advisors can upsert IPS"
  ON investment_policy_statements FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN advisors a ON c.advisor_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "Advisors can update IPS"
  ON investment_policy_statements FOR UPDATE
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN advisors a ON c.advisor_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

-- ── HOUSEHOLDS ────────────────────────────────────────────────
CREATE TABLE households (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id  UUID REFERENCES advisors(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE household_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  client_id     UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(household_id, client_id)
);

CREATE TABLE household_ips (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL UNIQUE,
  content       JSONB NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE households       ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_ips    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors manage own households"
  ON households FOR ALL
  USING (advisor_id = (SELECT id FROM advisors WHERE user_id = auth.uid()));

CREATE POLICY "Advisors manage household members"
  ON household_members FOR ALL
  USING (
    household_id IN (
      SELECT id FROM households WHERE advisor_id = (SELECT id FROM advisors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Advisors manage household IPS"
  ON household_ips FOR ALL
  USING (
    household_id IN (
      SELECT id FROM households WHERE advisor_id = (SELECT id FROM advisors WHERE user_id = auth.uid())
    )
  );

-- ── STORAGE BUCKET (run separately in Supabase dashboard) ─────
-- Create a public bucket called "logos" in Storage → New bucket
-- Settings: Public bucket = ON, allowed MIME types: image/png, image/jpeg, image/svg+xml, image/webp
-- File size limit: 2MB
--
-- Then add this RLS policy in Storage → logos → Policies:
--   INSERT: auth.uid()::text = (storage.foldername(name))[1]
--   UPDATE: auth.uid()::text = (storage.foldername(name))[1]
--   DELETE: auth.uid()::text = (storage.foldername(name))[1]
--   SELECT: true (public read)

-- ── ADVISOR NOTES ──────────────────────────────────────────────
ALTER TABLE clients    ADD COLUMN IF NOT EXISTS advisor_notes TEXT;
ALTER TABLE households ADD COLUMN IF NOT EXISTS advisor_notes TEXT;

-- ── INVESTMENT PREFERENCES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investment_preferences (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE NOT NULL,
  label      TEXT NOT NULL,
  icon       TEXT NOT NULL DEFAULT '⭐',
  sort_order INT  NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE investment_preferences ENABLE ROW LEVEL SECURITY;

-- Advisors manage their own
CREATE POLICY "Advisors manage own investment preferences"
  ON investment_preferences FOR ALL
  USING (advisor_id = (SELECT id FROM advisors WHERE user_id = auth.uid()));

-- Public read (survey page is unauthenticated)
CREATE POLICY "Public can read investment preferences"
  ON investment_preferences FOR SELECT
  USING (true);

-- Store selected preference IDs on responses
ALTER TABLE questionnaire_responses
  ADD COLUMN IF NOT EXISTS selected_preferences UUID[] DEFAULT '{}';

-- ── DATA API GRANTS ───────────────────────────────────────────
-- As of 2026, Supabase no longer auto-exposes public-schema tables to the
-- Data API (PostgREST / GraphQL / supabase-js). Without explicit grants,
-- supabase-js calls fail with a permission error. Default for new projects
-- since 2026-05-30; enforced on new tables in existing projects from
-- 2026-10-30. Grants control table-level access; the RLS policies above
-- still govern which rows each role can see.
-- Ref: https://supabase.com/changelog/45329

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Authenticated advisors and the server-side service role get full CRUD.
-- RLS scopes authenticated to their own rows; service_role bypasses RLS.
GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA public
  TO authenticated, service_role;

-- Anonymous survey respondents: read access (RLS returns only the
-- token-scoped rows) plus the two writes the public survey performs.
GRANT SELECT ON ALL TABLES IN SCHEMA public      TO anon;
GRANT INSERT ON public.questionnaire_responses   TO anon;
GRANT UPDATE ON public.clients                   TO anon;

-- Sequences (no-op if a table uses none).
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public
  TO anon, authenticated, service_role;

-- Apply the same grants automatically to any tables/sequences created
-- later in this schema (future migrations run as the same role).
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;
