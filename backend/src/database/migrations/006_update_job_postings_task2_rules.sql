-- Migration: 006_update_job_postings_task2_rules
-- Description: Updates job_postings table to enforce title max 120 chars and make description optional (NULL)
-- Engine: InnoDB, Charset: utf8mb4

-- UP
ALTER TABLE job_postings
  MODIFY COLUMN title VARCHAR(120) NOT NULL,
  MODIFY COLUMN description TEXT NULL;

-- DOWN (Rollback)
-- DİKKAT: description = NULL olan satırlar varsa MODIFY NOT NULL sorgusu Error 1138 verir.
-- Bu nedenle rollback öncesinde NULL alanlara varsayılan metin atanarak veri değişikliği yapılır:
-- UPDATE job_postings SET description = 'Açıklama belirtilmedi (Rollback)' WHERE description IS NULL;
-- ALTER TABLE job_postings MODIFY COLUMN title VARCHAR(255) NOT NULL, MODIFY COLUMN description TEXT NOT NULL;
