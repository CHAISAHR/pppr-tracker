-- Add Focus Area and Sector columns to capacity_assessments
ALTER TABLE capacity_assessments
  ADD COLUMN focus_area VARCHAR(255) NULL AFTER event_date,
  ADD COLUMN sector VARCHAR(255) NULL AFTER focus_area;
