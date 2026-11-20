-- Close anonymous data exposure (2026-11-20).
--
-- These policies let anyone holding the public anon key (shipped in every
-- page's JavaScript) read every client and advisor row across all firms,
-- update any client, and create clients / survey responses for any firm.
-- All public survey traffic now goes through server routes that use the
-- admin client (/api/survey/advisor, /api/survey/client, /api/submit-survey),
-- so no anonymous code path needs direct table access.
--
-- Before applying, sub-users were given explicit firm-scoped write policies
-- (sub_user_firm_report_writes, sub_user_firm_client_updates) so nothing
-- that silently relied on the USING (true) update policy breaks.
--
-- Applied to production as "lock_down_anon_access" after verifying the
-- server-side /q submit deploy (d6ca6048) was live.

-- advisors: anonymous read of every advisor row (incl. master tokens)
DROP POLICY IF EXISTS "Public can view advisor for survey"   ON advisors;
DROP POLICY IF EXISTS "Survey page can read advisor profiles" ON advisors;

-- clients: read-all, update-any, and anonymous inserts into any firm
DROP POLICY IF EXISTS "Public can read client by token"          ON clients;
DROP POLICY IF EXISTS "Public can update client status by token" ON clients;
DROP POLICY IF EXISTS "Public can create survey via master link" ON clients;
DROP POLICY IF EXISTS "Survey submissions can create clients"    ON clients;

-- questionnaire_responses: anonymous inserts for any client
DROP POLICY IF EXISTS "Public can insert responses"             ON questionnaire_responses;
DROP POLICY IF EXISTS "Survey submissions can create responses" ON questionnaire_responses;

-- investment_preferences: anonymous read of every firm's preferences
DROP POLICY IF EXISTS "Public can read investment preferences" ON investment_preferences;
DROP POLICY IF EXISTS "Survey page can read preferences"       ON investment_preferences;
