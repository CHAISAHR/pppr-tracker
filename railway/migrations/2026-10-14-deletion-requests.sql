-- Deletion requests: general users ask admins to delete a record, with a reason
CREATE TABLE IF NOT EXISTS deletion_requests (
  id CHAR(36) PRIMARY KEY,
  record_type VARCHAR(32) NOT NULL,
  record_id CHAR(36) NOT NULL,
  record_label TEXT NULL,
  reason TEXT NOT NULL,
  requested_by CHAR(36) NULL,
  requested_by_name VARCHAR(255) NULL,
  organisation VARCHAR(255) NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_by CHAR(36) NULL,
  reviewed_at DATETIME NULL,
  INDEX idx_deletion_requests_status (status)
);
