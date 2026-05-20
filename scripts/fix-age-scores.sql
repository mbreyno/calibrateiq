-- Fix q1 (age score) in questionnaire_responses for all clients.
-- The old formula used 95 - age (continuous), which gave values like 43 for
-- age 52 instead of the correct bracket score of 40 (45–55 bracket).
-- This migration recalculates q1 using the correct brackets that match QUESTIONS.
--
-- Run this in the Supabase SQL editor.
-- Safe to re-run — only updates rows where q1 is actually wrong.

UPDATE questionnaire_responses qr
SET q1 = CASE
  WHEN sub.age < 45  THEN 50
  WHEN sub.age <= 55 THEN 40
  WHEN sub.age <= 65 THEN 30
  WHEN sub.age <= 75 THEN 20
  ELSE 10
END
FROM (
  SELECT
    qr2.id,
    EXTRACT(YEAR FROM AGE(NOW(), c.date_of_birth::date))::int AS age
  FROM questionnaire_responses qr2
  JOIN clients c ON c.id = qr2.client_id
  WHERE c.date_of_birth IS NOT NULL
    AND c.date_of_birth != ''
) sub
WHERE qr.id = sub.id
  AND qr.q1 IS DISTINCT FROM (
    CASE
      WHEN sub.age < 45  THEN 50
      WHEN sub.age <= 55 THEN 40
      WHEN sub.age <= 65 THEN 30
      WHEN sub.age <= 75 THEN 20
      ELSE 10
    END
  );

-- Verify — should return 0 rows after the fix
SELECT qr.id, c.first_name, c.last_name, c.date_of_birth,
       EXTRACT(YEAR FROM AGE(NOW(), c.date_of_birth::date))::int AS age,
       qr.q1 AS stored_q1,
       CASE
         WHEN EXTRACT(YEAR FROM AGE(NOW(), c.date_of_birth::date))::int < 45  THEN 50
         WHEN EXTRACT(YEAR FROM AGE(NOW(), c.date_of_birth::date))::int <= 55 THEN 40
         WHEN EXTRACT(YEAR FROM AGE(NOW(), c.date_of_birth::date))::int <= 65 THEN 30
         WHEN EXTRACT(YEAR FROM AGE(NOW(), c.date_of_birth::date))::int <= 75 THEN 20
         ELSE 10
       END AS expected_q1
FROM questionnaire_responses qr
JOIN clients c ON c.id = qr.client_id
WHERE c.date_of_birth IS NOT NULL
  AND c.date_of_birth != ''
  AND qr.q1 IS DISTINCT FROM (
    CASE
      WHEN EXTRACT(YEAR FROM AGE(NOW(), c.date_of_birth::date))::int < 45  THEN 50
      WHEN EXTRACT(YEAR FROM AGE(NOW(), c.date_of_birth::date))::int <= 55 THEN 40
      WHEN EXTRACT(YEAR FROM AGE(NOW(), c.date_of_birth::date))::int <= 65 THEN 30
      WHEN EXTRACT(YEAR FROM AGE(NOW(), c.date_of_birth::date))::int <= 75 THEN 20
      ELSE 10
    END
  );
