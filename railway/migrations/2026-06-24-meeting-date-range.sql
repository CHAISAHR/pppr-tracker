-- Split meeting date into a from/to range and relax mandatory fields.
-- Safe to re-run.

ALTER TABLE meetings
  ADD COLUMN IF NOT EXISTS meeting_date_from DATE NULL AFTER description,
  ADD COLUMN IF NOT EXISTS meeting_date_to DATE NULL AFTER meeting_date_from;

-- Backfill from the legacy single `date` column where missing
UPDATE meetings
   SET meeting_date_from = COALESCE(meeting_date_from, date)
 WHERE meeting_date_from IS NULL AND date IS NOT NULL;

-- Make all previously-required fields optional (no mandatory fields)
ALTER TABLE meetings
  MODIFY COLUMN title VARCHAR(255) NULL,
  MODIFY COLUMN date DATE NULL,
  MODIFY COLUMN status VARCHAR(50) NULL DEFAULT 'scheduled';
