-- Quarterly Report: admins create & publish a report; each organisation submits one response.
CREATE TABLE IF NOT EXISTS quarterly_reports (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  quarter VARCHAR(100) NULL,
  due_date DATE NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Draft',
  published_at DATETIME NULL,
  created_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quarterly_report_responses (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  report_id CHAR(36) NOT NULL,
  organisation VARCHAR(255) NOT NULL,
  answers TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Draft',
  submitted_by VARCHAR(255) NULL,
  submitted_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_report_org (report_id, organisation),
  FOREIGN KEY (report_id) REFERENCES quarterly_reports(id) ON DELETE CASCADE
);
