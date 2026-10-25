-- Event Schedule: store the Event Title in the `title` column and the Focus Area
-- dropdown (Workforce / Labs / Surveillance) in `focus_area`.
-- Previously event titles were written into `focus_area` while the dropdown went
-- into the separate `focus_area_category` column. This migration moves the data.

-- 1. Move existing event titles out of focus_area into title.
UPDATE meetings
SET title = focus_area
WHERE (title IS NULL OR title = '')
  AND focus_area IS NOT NULL AND focus_area <> '';

-- 2. Move dropdown values from focus_area_category into focus_area.
UPDATE meetings
SET focus_area = focus_area_category
WHERE focus_area_category IS NOT NULL AND focus_area_category <> '';

-- 3. focus_area_category is now redundant; clear it (the column stays, deprecated).
UPDATE meetings SET focus_area_category = NULL;

-- 4. Anything left in focus_area that is not a valid dropdown value is a
--    duplicated event title; clear it.
UPDATE meetings
SET focus_area = NULL
WHERE focus_area IS NOT NULL
  AND focus_area NOT IN ('Workforce', 'Labs', 'Surveillance');

-- Column comments: make the purpose of each column explicit.
ALTER TABLE meetings
  MODIFY title VARCHAR(255) NULL COMMENT 'Event Title',
  MODIFY focus_area TEXT NULL COMMENT 'Focus Area dropdown: Workforce / Labs / Surveillance',
  MODIFY focus_area_category VARCHAR(255) NULL COMMENT 'DEPRECATED: replaced by focus_area';
