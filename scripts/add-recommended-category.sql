-- Phase 2: advisor-recommended risk category for the household IPS.
--
-- Adds two nullable columns to `households` so an advisor can record a
-- recommended risk category that differs from the survey result, along
-- with a documented reason. The UI treats NULL as "matches the survey"
-- so no backfill is required.
--
-- This was applied to the production database via the Supabase migration
-- "add_recommended_category_to_households" on 2026-06-19.

ALTER TABLE households
  ADD COLUMN IF NOT EXISTS recommended_risk_category TEXT,
  ADD COLUMN IF NOT EXISTS recommendation_reason TEXT;
