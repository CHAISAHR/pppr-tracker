-- Migration: add Capacity Tracker + Org Logos tables (moved from Supabase to Railway)
-- Run once on existing Railway databases that predate this change.

CREATE TABLE IF NOT EXISTS capacity_assessments (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  event_id CHAR(36) NULL,
  event_focus_area VARCHAR(255) NOT NULL,
  event_date DATE NULL,
  participant_name VARCHAR(255) NOT NULL,
  competency VARCHAR(255) NOT NULL,
  pre_score INT NULL,
  post_score INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_capacity_event_id ON capacity_assessments(event_id);
CREATE INDEX idx_capacity_event_date ON capacity_assessments(event_date);

CREATE TABLE IF NOT EXISTS org_logos (
  name VARCHAR(255) PRIMARY KEY,
  data_url LONGTEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
