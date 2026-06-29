-- Realign projects table to match the Activity Tracker import template exactly.
-- Columns: Activity ID, Activity Description, Sub-Activity ID, Sub-Activity Description,
-- Implementing Entity, Delivery Partner, Status, Start Date, End Date, Comments
-- Plus audit trail.

DROP TABLE IF EXISTS projects;

CREATE TABLE projects (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  activity_id TEXT NULL,
  activity_description TEXT NULL,
  sub_activity_id TEXT NULL,
  sub_activity_description TEXT NULL,
  implementing_entity TEXT NULL,
  delivery_partner TEXT NULL,
  status VARCHAR(50) NULL DEFAULT 'Not Yet Started',
  start_date DATE NULL,
  end_date DATE NULL,
  comments TEXT NULL,
  created_by CHAR(36) NULL,
  modified_by CHAR(36) NULL,
  modified_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_projects_status ON projects(status);
