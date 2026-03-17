-- =============================================
-- Railway PostgreSQL Schema
-- Run this in Railway's PostgreSQL Query tab
-- =============================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  organization TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  budget NUMERIC,
  delivery_partners TEXT[], -- array of partner names
  country TEXT,
  organisation TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT,
  venue TEXT,
  meeting_type TEXT,
  attendees TEXT[],
  minutes TEXT,
  action_items TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Workshops table
CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  activity TEXT,
  date DATE NOT NULL,
  venue TEXT,
  number_of_days INTEGER DEFAULT 1,
  registrations INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Workshop Attendance table
CREATE TABLE IF NOT EXISTS workshop_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  organization TEXT,
  phone_number TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Indicators table (Indicator Tracker)
CREATE TABLE IF NOT EXISTS indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL,
  country TEXT,
  workstream TEXT,
  organisation TEXT,              -- Delivery Partner
  implementing_entity TEXT,
  activity_id TEXT,
  activity TEXT,                  -- Activity Name
  long_term_outcome TEXT,
  core_indicators TEXT,
  indicator_type TEXT,
  indicator_definition TEXT,
  naphs TEXT,
  responsibility TEXT,
  cost_usd NUMERIC,
  data_source TEXT,
  evidence TEXT,
  year INTEGER,
  target NUMERIC,
  q1 NUMERIC,
  q2 NUMERIC,
  q3 NUMERIC,
  q4 NUMERIC,
  quarter_3 NUMERIC,
  annual_performance NUMERIC,
  -- Free-text year/target columns
  baseline_proposal_year TEXT,
  target_year_1 TEXT,
  target_year_2 TEXT,
  target_year_3 TEXT,
  target_year_4 TEXT,
  target_year_5 TEXT,
  target_year_6 TEXT,
  subactivity_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Sub-Activities table
CREATE TABLE IF NOT EXISTS sub_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Indicator Values table
CREATE TABLE IF NOT EXISTS indicator_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id UUID NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  sub_activity_id UUID REFERENCES sub_activities(id) ON DELETE SET NULL,
  project_id TEXT,
  reporting_period TEXT,
  target_value NUMERIC,
  actual_value NUMERIC,
  notes TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Auto-update updated_at trigger
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workshops_updated_at BEFORE UPDATE ON workshops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_indicators_updated_at BEFORE UPDATE ON indicators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_activities_updated_at BEFORE UPDATE ON sub_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_indicator_values_updated_at BEFORE UPDATE ON indicator_values
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Create indexes for common queries
-- =============================================
CREATE INDEX IF NOT EXISTS idx_indicators_country ON indicators(country);
CREATE INDEX IF NOT EXISTS idx_indicators_organisation ON indicators(organisation);
CREATE INDEX IF NOT EXISTS idx_indicators_implementing_entity ON indicators(implementing_entity);
CREATE INDEX IF NOT EXISTS idx_indicators_year ON indicators(year);
CREATE INDEX IF NOT EXISTS idx_indicators_activity ON indicators(activity);
CREATE INDEX IF NOT EXISTS idx_indicator_values_indicator_id ON indicator_values(indicator_id);
CREATE INDEX IF NOT EXISTS idx_workshop_attendance_workshop_id ON workshop_attendance(workshop_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- =============================================
-- Seed an admin user (password: admin123)
-- Replace the password_hash with a bcrypt hash in production
-- =============================================
INSERT INTO users (email, password_hash, name, role)
VALUES ('admin@example.com', '$2b$10$placeholder_hash_replace_me', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;
