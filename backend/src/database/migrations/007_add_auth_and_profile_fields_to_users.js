/**
 * Migration: 007_add_auth_and_profile_fields_to_users
 * Adds nullable password_hash, role, department, and graduation_year columns to the users table.
 * Existing user records remain valid with NULL values for these columns.
 */

module.exports = {
  name: '007_add_auth_and_profile_fields_to_users',
  async up(connection) {
    const sql = `
      ALTER TABLE users
        ADD COLUMN password_hash VARCHAR(255) NULL AFTER email,
        ADD COLUMN role VARCHAR(50) NULL AFTER password_hash,
        ADD COLUMN department VARCHAR(150) NULL AFTER role,
        ADD COLUMN graduation_year SMALLINT UNSIGNED NULL AFTER department;
    `;
    await connection.query(sql);
  },
  async down(connection) {
    const sql = `
      ALTER TABLE users
        DROP COLUMN graduation_year,
        DROP COLUMN department,
        DROP COLUMN role,
        DROP COLUMN password_hash;
    `;
    await connection.query(sql);
  }
};
