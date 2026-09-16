-- Custom question builder (documentation only, unscored, max 3 per firm).
-- Supersedes the hardcoded investment-experience questions from
-- add-experience-questions.sql.
--
-- advisors.custom_questions: [{ id, question, options: [] }]
--   (empty options = free-text answer; UI enforces max 3 questions)
-- questionnaire_responses.custom_answers: [{ question, answer }]
--   (literal text captured at submission, robust to later question edits)
--
-- The production migration "add_custom_questions_builder" (2026-09-16) also
-- seeded custom_questions for the two firms that had ask_experience on, and
-- carried the three existing experience answers into custom_answers. The
-- legacy columns (advisors.ask_experience, questionnaire_responses.
-- experience_level / check_frequency) were dropped afterwards via
-- "drop_legacy_experience_columns".

ALTER TABLE advisors
  ADD COLUMN IF NOT EXISTS custom_questions JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE questionnaire_responses
  ADD COLUMN IF NOT EXISTS custom_answers JSONB NOT NULL DEFAULT '[]'::jsonb;
