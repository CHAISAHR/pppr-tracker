-- Add participant email address to capacity_assessments
ALTER TABLE capacity_assessments
  ADD COLUMN email VARCHAR(255) NULL AFTER participant_name;
