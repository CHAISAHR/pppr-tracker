-- Remove remaining 255-character limits from Activity Tracker IDs.
-- This fixes "Data too long" errors when Activity ID or Sub-Activity ID
-- values from imported spreadsheets exceed VARCHAR(255).

ALTER TABLE projects
  MODIFY COLUMN activity_id TEXT NULL,
  MODIFY COLUMN sub_activity_id TEXT NULL;