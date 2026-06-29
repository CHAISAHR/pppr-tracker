-- Align meetings table with the Event Schedule frontend Meeting model.
-- Adds all fields exposed in the UI so bulk uploads and edits persist.
-- Idempotent: uses IF NOT EXISTS where possible (MySQL 8+).

ALTER TABLE meetings
  ADD COLUMN IF NOT EXISTS activity_id           VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS sub_activity_id       VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS quarter               VARCHAR(50)  NULL,
  ADD COLUMN IF NOT EXISTS focus_area            TEXT         NULL,
  ADD COLUMN IF NOT EXISTS implementing_entities JSON         NULL,
  ADD COLUMN IF NOT EXISTS delivery_partners     JSON         NULL,
  ADD COLUMN IF NOT EXISTS key_objectives        TEXT         NULL,
  ADD COLUMN IF NOT EXISTS format                VARCHAR(50)  NULL,
  ADD COLUMN IF NOT EXISTS links                 TEXT         NULL,
  ADD COLUMN IF NOT EXISTS organiser_name        VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS organiser_email       VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS organiser_phone       VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS pre_survey_link       TEXT         NULL,
  ADD COLUMN IF NOT EXISTS post_survey_link      TEXT         NULL,
  ADD COLUMN IF NOT EXISTS pre_survey_qr_code    LONGTEXT     NULL,
  ADD COLUMN IF NOT EXISTS post_survey_qr_code   LONGTEXT     NULL,
  ADD COLUMN IF NOT EXISTS attachments           TEXT         NULL;
