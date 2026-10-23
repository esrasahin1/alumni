-- Migration: 005_add_user_id_to_job_postings
-- Description: Adds user_id column to job_postings table referencing users(id)
-- Engine: InnoDB, Charset: utf8mb4

ALTER TABLE job_postings
  ADD COLUMN user_id INT UNSIGNED DEFAULT NULL AFTER id,
  ADD CONSTRAINT fk_job_postings_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;
