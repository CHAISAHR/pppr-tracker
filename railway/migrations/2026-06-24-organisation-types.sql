-- Add organisation types to existing Railway MySQL database
-- Run this if you already created the organisations table before this feature

ALTER TABLE organisations ADD COLUMN IF NOT EXISTS types JSON AFTER description;
