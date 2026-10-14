/**
 * Migration: 001_create_users_table
 * Creates the 'users' table based on the existing User model:
 * - id: INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
 * - name: VARCHAR(255) NOT NULL
 * - email: VARCHAR(255) NOT NULL UNIQUE
 * - created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * - updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 */

module.exports = {
  name: '001_create_users_table',
  async up(connection) {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await connection.query(sql);
  },
  async down(connection) {
    await connection.query(`DROP TABLE IF EXISTS users;`);
  }
};
