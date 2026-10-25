-- Event Schedule: add a Focus Area dropdown (Workforce / Labs / Surveillance).
-- The existing focus_area column keeps storing the Event Title.
ALTER TABLE meetings
  ADD COLUMN focus_area_category VARCHAR(255) NULL AFTER focus_area;
