-- Add organisation types to existing Railway MySQL database
-- Run this if you already created the organisations table before this feature

SET @dbname = DATABASE();
SET @tablename = 'organisations';
SET @columnname = 'types';

SET @sql = (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = @dbname
        AND table_name = @tablename
        AND column_name = @columnname
    ),
    'SELECT 1',
    'ALTER TABLE organisations ADD COLUMN types JSON AFTER description'
  )
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
