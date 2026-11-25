/**
 * Migration: 008_create_sessions_table
 * Creates the 'sessions' table compatible with express-mysql-session.
 * Automatic table creation in express-mysql-session is disabled so migrations own the schema.
 */

module.exports = {
  name: '008_create_sessions_table',
  async up(connection) {
    const sql = `
      CREATE TABLE IF NOT EXISTS sessions (
        session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
        expires INT UNSIGNED NOT NULL,
        data MEDIUMTEXT COLLATE utf8mb4_bin,
        PRIMARY KEY (session_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
    `;
    await connection.query(sql);
  },
  async down(connection) {
    await connection.query('DROP TABLE IF EXISTS sessions;');
  }
};
