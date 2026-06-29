-- Drop and recreate the indicators table aligned to the import template,
-- with audit trail columns and all non-name fields nullable.
-- WARNING: this DROPS all existing indicator rows.

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS indicators;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE indicators (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  -- Template columns
  country TEXT NULL,
  activity_id TEXT NULL,
  activity TEXT NULL,
  long_term_outcome TEXT NULL,
  core_indicators TEXT NULL,          -- "Core Indicator"
  workstream TEXT NULL,
  indicator_type TEXT NULL,
  name TEXT NOT NULL,                 -- "Indicator Name"
  indicator_definition TEXT NULL,
  naphs TEXT NULL,                    -- "NAPHS (Yes/No)"
  responsibility TEXT NULL,           -- "Responsibility for Implementation"
  organisation TEXT NULL,             -- "Delivery Partner"
  implementing_entity TEXT NULL,
  data_source TEXT NULL,
  cost_usd DECIMAL(15,2) NULL,
  baseline_proposal_year TEXT NULL,
  target_year_1 TEXT NULL,
  target_year_2 TEXT NULL,
  target_year_3 TEXT NULL,
  target_year_4 TEXT NULL,
  target_year_5 TEXT NULL,
  target_year_6 TEXT NULL,
  -- Extra fields used by the in-app performance tracking UI
  description TEXT NULL,
  unit VARCHAR(100) NULL,
  subactivity_id TEXT NULL,
  evidence TEXT NULL,
  year INT NULL,
  target DECIMAL(15,2) NULL,
  q1 DECIMAL(15,2) NULL,
  q2 DECIMAL(15,2) NULL,
  q3 DECIMAL(15,2) NULL,
  q4 DECIMAL(15,2) NULL,
  quarter_3 DECIMAL(15,2) NULL,
  annual_performance DECIMAL(15,2) NULL,
  comments TEXT NULL,
  -- Audit trail
  created_by CHAR(36) NULL,
  modified_by CHAR(36) NULL,
  modified_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_indicators_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_indicators_modified_by FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_indicators_country ON indicators(country(64));
CREATE INDEX idx_indicators_organisation ON indicators(organisation(64));
CREATE INDEX idx_indicators_implementing_entity ON indicators(implementing_entity(64));
CREATE INDEX idx_indicators_year ON indicators(year);
CREATE INDEX idx_indicators_activity ON indicators(activity(64));
