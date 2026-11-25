-- Migration: 007_add_auth_and_profile_fields_to_users
-- Description: Adds nullable password_hash, role, department, and graduation_year columns to users
-- Engine: InnoDB, Charset: utf8mb4

-- UP
ALTER TABLE users
  ADD COLUMN password_hash VARCHAR(255) NULL AFTER email,
  ADD COLUMN role VARCHAR(50) NULL AFTER password_hash,
  ADD COLUMN department VARCHAR(150) NULL AFTER role,
  ADD COLUMN graduation_year SMALLINT UNSIGNED NULL AFTER department;

-- DOWN (Rollback)
-- ALTER TABLE users
--   DROP COLUMN graduation_year,
--   DROP COLUMN department,
--   DROP COLUMN role,
--   DROP COLUMN password_hash;
