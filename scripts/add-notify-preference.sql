-- Add notification preference column to advisors table.
-- Default true so existing accounts stay opted in.
-- Run this in the Supabase SQL editor.

ALTER TABLE advisors
  ADD COLUMN IF NOT EXISTS notify_on_completion boolean NOT NULL DEFAULT true;
