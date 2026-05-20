-- Restore q1 scores to the continuous formula (95 - age).
-- Run this if you previously ran fix-age-scores.sql, which overwrote
-- the continuous values with bracket values.
--
-- Run in the Supabase SQL editor.

UPDATE questionnaire_responses qr
SET q1 = CASE
  WHEN EXTRACT(YEAR FROM AGE(NOW(), c.date_of_birth::date))::int < 45 THEN 50
  WHEN EXTRACT(YEAR FROM AGE(NOW(), c.date_of_birth::date))::int > 85 THEN 10
  ELSE 95 - EXTRACT(YEAR FROM AGE(NOW(), c.date_of_birth::date))::int
END
FROM clients c
WHERE qr.client_id = c.id
  AND c.date_of_birth IS NOT NULL
  AND c.date_of_birth != '';

-- Verify: shows each client's name, age, and restored q1
SELECT c.first_name, c.last_name,
       EXTRACT(YEAR FROM AGE(NOW(), c.date_of_birth::date))::int AS age,
       qr.q1
FROM questionnaire_responses qr
JOIN clients c ON c.id = qr.client_id
WHERE c.date_of_birth IS NOT NULL
  AND c.date_of_birth != ''
ORDER BY c.last_name;
