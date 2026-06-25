-- =============================================
-- Migration: Enforce organisation NOT NULL on users and user_requests
-- Run in MySQL Workbench against your Railway DB
-- =============================================

-- Backfill any existing NULL/empty organisation values so the ALTER won't fail.
UPDATE users SET organization = 'Unassigned'
  WHERE organization IS NULL OR organization = '';

UPDATE user_requests SET organization = 'Unassigned'
  WHERE organization IS NULL OR organization = '';

-- Enforce NOT NULL
ALTER TABLE users
  MODIFY COLUMN organization VARCHAR(255) NOT NULL;

ALTER TABLE user_requests
  MODIFY COLUMN organization VARCHAR(255) NOT NULL;
