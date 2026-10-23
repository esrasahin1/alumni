/**
 * Migration: 005_add_user_id_to_job_postings
 * Adds user_id column to job_postings table referencing users(id).
 * Existing job postings remain with user_id = NULL.
 */

module.exports = {
  name: '005_add_user_id_to_job_postings',
  async up(connection) {
    const sql = `
      ALTER TABLE job_postings
        ADD COLUMN user_id INT UNSIGNED DEFAULT NULL AFTER id,
        ADD CONSTRAINT fk_job_postings_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;
    `;
    await connection.query(sql);
  },
  async down(connection) {
    await connection.query(`
      ALTER TABLE job_postings
        DROP FOREIGN KEY fk_job_postings_user_id,
        DROP COLUMN user_id;
    `);
  }
};
