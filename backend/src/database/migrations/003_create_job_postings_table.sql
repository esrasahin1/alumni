-- Migration: 003_create_job_postings_table
-- Description: Creates the job_postings table corresponding to the Job Posting entity in ddd.md
-- Engine: InnoDB, Charset: utf8mb4

CREATE TABLE IF NOT EXISTS job_postings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) DEFAULT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
