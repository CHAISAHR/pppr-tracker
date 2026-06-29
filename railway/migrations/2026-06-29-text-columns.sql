-- Convert capped VARCHAR(255) text fields to TEXT to remove length limits
-- on names, activities, indicators, and other descriptive columns.

-- Projects (Activity Tracker)
ALTER TABLE projects MODIFY title TEXT NOT NULL;
ALTER TABLE projects MODIFY country TEXT NULL;
ALTER TABLE projects MODIFY organisation TEXT NULL;

-- Indicators (Indicator Tracker)
ALTER TABLE indicators MODIFY name TEXT NOT NULL;
ALTER TABLE indicators MODIFY country TEXT NULL;
ALTER TABLE indicators MODIFY workstream TEXT NULL;
ALTER TABLE indicators MODIFY organisation TEXT NULL;
ALTER TABLE indicators MODIFY implementing_entity TEXT NULL;
ALTER TABLE indicators MODIFY activity_id TEXT NULL;
ALTER TABLE indicators MODIFY activity TEXT NULL;
ALTER TABLE indicators MODIFY core_indicators TEXT NULL;
ALTER TABLE indicators MODIFY indicator_type TEXT NULL;
ALTER TABLE indicators MODIFY naphs TEXT NULL;
ALTER TABLE indicators MODIFY responsibility TEXT NULL;
ALTER TABLE indicators MODIFY data_source TEXT NULL;
ALTER TABLE indicators MODIFY baseline_proposal_year TEXT NULL;
ALTER TABLE indicators MODIFY target_year_1 TEXT NULL;
ALTER TABLE indicators MODIFY target_year_2 TEXT NULL;
ALTER TABLE indicators MODIFY target_year_3 TEXT NULL;
ALTER TABLE indicators MODIFY target_year_4 TEXT NULL;
ALTER TABLE indicators MODIFY target_year_5 TEXT NULL;
ALTER TABLE indicators MODIFY target_year_6 TEXT NULL;
ALTER TABLE indicators MODIFY subactivity_id TEXT NULL;

-- Sub-activities
ALTER TABLE sub_activities MODIFY name TEXT NOT NULL;
