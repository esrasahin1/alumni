-- Migration: 009_add_auth_role_to_users
-- Description: Adds auth_role column ('user' | 'admin') separate from account type (role: 'student' | 'alumni' | NULL),
--              adds CHECK constraint chk_users_auth_role, and enforces at most one admin via single_admin_guard UNIQUE index.
-- Engine: InnoDB, Charset: utf8mb4

-- UP
ALTER TABLE users
  ADD COLUMN auth_role VARCHAR(50) NOT NULL DEFAULT 'user' AFTER role,
  ADD CONSTRAINT chk_users_auth_role CHECK (auth_role IN ('user', 'admin')),
  ADD COLUMN single_admin_guard TINYINT GENERATED ALWAYS AS (CASE WHEN auth_role = 'admin' THEN 1 ELSE NULL END) STORED,
  ADD UNIQUE KEY uq_users_single_admin (single_admin_guard);

-- DOWN (Rollback)
-- ALTER TABLE users
--   DROP INDEX uq_users_single_admin,
--   DROP COLUMN single_admin_guard,
--   DROP CHECK chk_users_auth_role,
--   DROP COLUMN auth_role;
