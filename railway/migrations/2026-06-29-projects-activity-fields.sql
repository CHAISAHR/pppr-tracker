-- Add activity tracker fields to projects table
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS activity_id VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS sub_activity_id VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS implementing_entity TEXT NULL;
