-- =============================================
-- Railway MySQL Schema
-- Run this in MySQL Workbench
-- =============================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  organization VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Projects table (aligned to Activity Tracker import template)
CREATE TABLE IF NOT EXISTS projects (
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

-- 3. Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NULL,
  description TEXT,
  meeting_date_from DATE NULL,
  meeting_date_to DATE NULL,
  time VARCHAR(50),
  venue VARCHAR(255),
  meeting_type VARCHAR(100),
  attendees JSON,
  minutes TEXT,
  action_items TEXT,
  status VARCHAR(50) NULL DEFAULT 'scheduled',
  created_by CHAR(36),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 4. Workshops table
CREATE TABLE IF NOT EXISTS workshops (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  activity VARCHAR(255),
  date DATE NOT NULL,
  venue VARCHAR(255),
  number_of_days INT DEFAULT 1,
  registrations INT DEFAULT 0,
  created_by CHAR(36),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 5. Workshop Attendance table
CREATE TABLE IF NOT EXISTS workshop_attendance (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  workshop_id CHAR(36),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  organization VARCHAR(255),
  phone_number VARCHAR(50),
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE
);

-- 6. Indicators table (aligned to import template + audit trail)
CREATE TABLE IF NOT EXISTS indicators (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  country TEXT NULL,
  activity_id TEXT NULL,
  activity TEXT NULL,
  long_term_outcome TEXT NULL,
  core_indicators TEXT NULL,
  workstream TEXT NULL,
  indicator_type TEXT NULL,
  name TEXT NOT NULL,
  indicator_definition TEXT NULL,
  naphs TEXT NULL,
  responsibility TEXT NULL,
  organisation TEXT NULL,
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
  created_by CHAR(36) NULL,
  modified_by CHAR(36) NULL,
  modified_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. Sub-Activities table
CREATE TABLE IF NOT EXISTS sub_activities (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id VARCHAR(255) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 8. Indicator Values table
CREATE TABLE IF NOT EXISTS indicator_values (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  indicator_id CHAR(36) NOT NULL,
  sub_activity_id CHAR(36),
  project_id VARCHAR(255),
  reporting_period VARCHAR(100),
  target_value DECIMAL(15,2),
  actual_value DECIMAL(15,2),
  notes TEXT,
  recorded_by CHAR(36),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE CASCADE,
  FOREIGN KEY (sub_activity_id) REFERENCES sub_activities(id) ON DELETE SET NULL,
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- =============================================
-- Create indexes for common queries
-- =============================================
CREATE INDEX idx_indicators_country ON indicators(country);
CREATE INDEX idx_indicators_organisation ON indicators(organisation);
CREATE INDEX idx_indicators_implementing_entity ON indicators(implementing_entity);
CREATE INDEX idx_indicators_year ON indicators(year);
CREATE INDEX idx_indicators_activity ON indicators(activity);
CREATE INDEX idx_indicator_values_indicator_id ON indicator_values(indicator_id);
CREATE INDEX idx_workshop_attendance_workshop_id ON workshop_attendance(workshop_id);
CREATE INDEX idx_projects_status ON projects(status);

-- 9. Organisations table
CREATE TABLE IF NOT EXISTS organisations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  types JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_organisations_name ON organisations(name);

-- =============================================
-- Seed an admin user (password: admin123)
-- Replace the password_hash with a bcrypt hash in production
-- =============================================
INSERT IGNORE INTO users (id, email, password_hash, name, role)
VALUES (UUID(), 'admin@example.com', '$2b$10$placeholder_hash_replace_me', 'Admin User', 'admin');

-- 10. User Access Requests table
CREATE TABLE IF NOT EXISTS user_requests (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME NULL,
  reviewed_by CHAR(36) NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_requests_status ON user_requests(status);
CREATE INDEX idx_user_requests_email ON user_requests(email);

-- 11. Capacity Assessments table (Capacity Tracker)
CREATE TABLE IF NOT EXISTS capacity_assessments (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  event_id CHAR(36) NULL,
  event_focus_area VARCHAR(255) NOT NULL,
  event_date DATE NULL,
  focus_area VARCHAR(255) NULL,
  sector VARCHAR(255) NULL,
  participant_name VARCHAR(255) NOT NULL,
  competency VARCHAR(255) NOT NULL,
  pre_score INT NULL,
  post_score INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_capacity_event_id ON capacity_assessments(event_id);
CREATE INDEX idx_capacity_event_date ON capacity_assessments(event_date);

-- 12. Organisation Logos table (partner logos)
CREATE TABLE IF NOT EXISTS org_logos (
  name VARCHAR(255) PRIMARY KEY,
  data_url LONGTEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
