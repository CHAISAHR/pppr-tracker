-- =============================================
-- DROP ALL TABLES (Railway MySQL)
-- Run this in MySQL Workbench BEFORE re-running schema.sql
-- WARNING: This deletes ALL data in these tables.
-- =============================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS org_logos;
DROP TABLE IF EXISTS capacity_assessments;
DROP TABLE IF EXISTS user_requests;
DROP TABLE IF EXISTS indicator_values;
DROP TABLE IF EXISTS sub_activities;
DROP TABLE IF EXISTS indicators;
DROP TABLE IF EXISTS workshop_attendance;
DROP TABLE IF EXISTS workshops;
DROP TABLE IF EXISTS meetings;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS organisations;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;
