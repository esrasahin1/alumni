/**
 * Migration: 009_add_auth_role_to_users
 * Adds auth_role ('user' | 'admin', default 'user') with a MySQL 8 CHECK constraint,
 * separates authorization role from Student/Alumni account type in users.role,
 * and adds a generated UNIQUE guard column ensuring at most 1 admin exists.
 */

module.exports = {
  name: '009_add_auth_role_to_users',
  async up(connection) {
    const sql = `
      ALTER TABLE users
        ADD COLUMN auth_role VARCHAR(50) NOT NULL DEFAULT 'user' AFTER role,
        ADD CONSTRAINT chk_users_auth_role CHECK (auth_role IN ('user', 'admin')),
        ADD COLUMN single_admin_guard TINYINT GENERATED ALWAYS AS (CASE WHEN auth_role = 'admin' THEN 1 ELSE NULL END) STORED,
        ADD UNIQUE KEY uq_users_single_admin (single_admin_guard);
    `;
    await connection.query(sql);
  },
  async down(connection) {
    const sql = `
      ALTER TABLE users
        DROP INDEX uq_users_single_admin,
        DROP COLUMN single_admin_guard,
        DROP CHECK chk_users_auth_role,
        DROP COLUMN auth_role;
    `;
    await connection.query(sql);
  }
};
