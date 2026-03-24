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
  organization VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Projects table
CREATE TABLE IF NOT EXISTS projects (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15,2),
  delivery_partners JSON,
  country VARCHAR(255),
  organisation VARCHAR(255),
  created_by CHAR(36),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 3. Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time VARCHAR(50),
  venue VARCHAR(255),
  meeting_type VARCHAR(100),
  attendees JSON,
  minutes TEXT,
  action_items TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
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

-- 6. Indicators table
CREATE TABLE IF NOT EXISTS indicators (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit VARCHAR(100) NOT NULL,
  country VARCHAR(255),
  workstream VARCHAR(255),
  organisation VARCHAR(255),
  implementing_entity VARCHAR(255),
  activity_id VARCHAR(255),
  activity VARCHAR(255),
  long_term_outcome TEXT,
  core_indicators VARCHAR(255),
  indicator_type VARCHAR(255),
  indicator_definition TEXT,
  naphs VARCHAR(255),
  responsibility VARCHAR(255),
  cost_usd DECIMAL(15,2),
  data_source VARCHAR(255),
  evidence TEXT,
  year INT,
  target DECIMAL(15,2),
  q1 DECIMAL(15,2),
  q2 DECIMAL(15,2),
  q3 DECIMAL(15,2),
  q4 DECIMAL(15,2),
  quarter_3 DECIMAL(15,2),
  annual_performance DECIMAL(15,2),
  baseline_proposal_year VARCHAR(255),
  target_year_1 VARCHAR(255),
  target_year_2 VARCHAR(255),
  target_year_3 VARCHAR(255),
  target_year_4 VARCHAR(255),
  target_year_5 VARCHAR(255),
  target_year_6 VARCHAR(255),
  subactivity_id VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Sub-Activities table
CREATE TABLE IF NOT EXISTS sub_activities (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
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
