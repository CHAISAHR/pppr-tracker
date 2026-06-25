-- Add Modified By / Modified Date tracking to projects
ALTER TABLE projects
  ADD COLUMN modified_by CHAR(36) NULL AFTER created_by,
  ADD COLUMN modified_at DATETIME NULL AFTER modified_by,
  ADD CONSTRAINT fk_projects_modified_by FOREIGN KEY (modified_by) REFERENCES users(id);
