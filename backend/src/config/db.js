const path = require('path');
const dns = require('dns').promises;
const mysql = require('mysql2/promise');

// Load environment variables from project root .env or backend .env
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env')
];

for (const envPath of envPaths) {
  try {
    require('dotenv').config({ path: envPath });
  } catch (err) {
    // Ignore and proceed
  }
}

/**
 * Resolves database host.
 * If DB_HOST is set to docker service name 'db' but is not resolvable on the host machine,
 * it automatically falls back to 'localhost' for seamless local execution.
 */
async function resolveHost(host) {
  const targetHost = host || process.env.DB_HOST || 'localhost';
  if (targetHost === 'db') {
    try {
      await dns.lookup('db');
      return 'db';
    } catch {
      return 'localhost';
    }
  }
  return targetHost;
}

/**
 * Returns database configuration object using environment variables.
 */
function getDbConfig(resolvedHost = null) {
  return {
    host: resolvedHost || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'alumni_user',
    password: process.env.DB_PASSWORD || 'alumni_password',
    database: process.env.DB_NAME || 'alumni_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
  };
}

/**
 * Creates and returns a direct MySQL connection.
 */
async function createConnection() {
  const host = await resolveHost();
  const config = getDbConfig(host);
  return await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    multipleStatements: true
  });
}

/**
 * Creates a MySQL connection pool.
 */
let pool = null;
async function getPool() {
  if (!pool) {
    const host = await resolveHost();
    const config = getDbConfig(host);
    pool = mysql.createPool(config);
  }
  return pool;
}

/**
 * Tests database connectivity.
 */
async function testConnection() {
  const host = await resolveHost();
  const config = getDbConfig(host);
  const connection = await createConnection();
  try {
    await connection.query('SELECT 1 + 1 AS healthcheck');
    return {
      success: true,
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user
    };
  } finally {
    await connection.end();
  }
}

module.exports = {
  getDbConfig,
  createConnection,
  getPool,
  testConnection,
  resolveHost
};
