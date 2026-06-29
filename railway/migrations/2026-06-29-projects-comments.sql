-- Add comments column to projects to persist front-end Comments field
ALTER TABLE projects ADD COLUMN comments TEXT NULL;
