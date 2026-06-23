-- =============================================
-- Migration: User access requests
-- Run this in MySQL Workbench against your Railway DB
-- =============================================

CREATE TABLE IF NOT EXISTS user_requests (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME NULL,
  reviewed_by CHAR(36) NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_requests_status ON user_requests(status);
CREATE INDEX idx_user_requests_email ON user_requests(email);
