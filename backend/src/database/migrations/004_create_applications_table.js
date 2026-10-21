/**
 * Migration: 004_create_applications_table
 * Creates the 'applications' table based on the Application specification in ddd.md:
 * - id: INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
 * - job_posting_id: INT UNSIGNED NOT NULL
 * - user_id: INT UNSIGNED DEFAULT NULL
 * - applicant_name: VARCHAR(255) NOT NULL
 * - applicant_email: VARCHAR(255) NOT NULL
 * - resume_url: VARCHAR(255) DEFAULT NULL
 * - cover_letter: TEXT DEFAULT NULL
 * - status: VARCHAR(50) NOT NULL DEFAULT 'PENDING'
 * - created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * - updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 */

module.exports = {
  name: '004_create_applications_table',
  async up(connection) {
    const sql = `
      CREATE TABLE IF NOT EXISTS applications (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        job_posting_id INT UNSIGNED NOT NULL,
        user_id INT UNSIGNED DEFAULT NULL,
        applicant_name VARCHAR(255) NOT NULL,
        applicant_email VARCHAR(255) NOT NULL,
        resume_url VARCHAR(255) DEFAULT NULL,
        cover_letter TEXT DEFAULT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await connection.query(sql);
  },
  async down(connection) {
    await connection.query(`DROP TABLE IF EXISTS applications;`);
  }
};
