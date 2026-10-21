/**
 * Migration: 003_create_job_postings_table
 * Creates the 'job_postings' table based on the Job Posting specification in ddd.md:
 * - id: INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
 * - title: VARCHAR(255) NOT NULL
 * - company: VARCHAR(255) NOT NULL
 * - location: VARCHAR(255) DEFAULT NULL
 * - description: TEXT NOT NULL
 * - contact_email: VARCHAR(255) DEFAULT NULL
 * - created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * - updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 */

module.exports = {
  name: '003_create_job_postings_table',
  async up(connection) {
    const sql = `
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
    `;
    await connection.query(sql);
  },
  async down(connection) {
    await connection.query(`DROP TABLE IF EXISTS job_postings;`);
  }
};
