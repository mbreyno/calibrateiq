-- Optional investment-experience questions (documentation only, unscored).
--
-- advisors.ask_experience: per-firm opt-in toggle, OFF by default. When on,
-- two questions ("How would you describe your investing experience today?"
-- and "How often do you find yourself checking your investments?") appear at
-- the end of the client survey, before the free-form comments step.
-- Answers store the literal option text the client selected and are shown
-- on the report under "Other Information". They never affect scoring.
--
-- Applied to production via Supabase migration "add_experience_questions"
-- on 2026-09-10.

ALTER TABLE advisors
  ADD COLUMN IF NOT EXISTS ask_experience BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE questionnaire_responses
  ADD COLUMN IF NOT EXISTS experience_level TEXT,
  ADD COLUMN IF NOT EXISTS check_frequency  TEXT;
