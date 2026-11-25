-- Migration: 008_create_sessions_table
-- Description: Creates the sessions table matching express-mysql-session schema
-- Engine: InnoDB, Charset: utf8mb4, Collation: utf8mb4_bin

-- UP
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
  expires INT UNSIGNED NOT NULL,
  data MEDIUMTEXT COLLATE utf8mb4_bin,
  PRIMARY KEY (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- DOWN (Rollback)
-- DROP TABLE IF EXISTS sessions;
