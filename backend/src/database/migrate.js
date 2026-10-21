const fs = require('fs');
const path = require('path');
const { createConnection, resolveHost } = require('../config/db');

const MIGRATIONS_DIR = path.resolve(__dirname, 'migrations');

/**
 * Ensures the migrations metadata tracking table exists.
 */
async function ensureMigrationsTable(connection) {
  const sql = `
    CREATE TABLE IF NOT EXISTS migrations (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      batch INT UNSIGNED NOT NULL DEFAULT 1,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  await connection.query(sql);
}

/**
 * Retrieves list of all executed migration names from database.
 */
async function getExecutedMigrations(connection) {
  const [rows] = await connection.query('SELECT name, batch, executed_at FROM migrations ORDER BY id ASC');
  return rows;
}

/**
 * Discovers available migration files in the migrations directory.
 * Deduplicates .js and .sql files with identical base names.
 */
function getAvailableMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(MIGRATIONS_DIR);
  const migrationMap = new Map();

  files.sort().forEach(file => {
    if (file.endsWith('.js') || file.endsWith('.sql')) {
      const baseName = file.replace(/\.(js|sql)$/, '');
      if (!migrationMap.has(baseName) || file.endsWith('.js')) {
        migrationMap.set(baseName, {
          name: baseName,
          file,
          fullPath: path.join(MIGRATIONS_DIR, file),
          type: file.endsWith('.js') ? 'js' : 'sql'
        });
      }
    }
  });

  return Array.from(migrationMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Runs all pending migrations (UP).
 */
async function migrateUp(connection) {
  await ensureMigrationsTable(connection);
  const executedRows = await getExecutedMigrations(connection);
  const executedNames = new Set(executedRows.map(r => r.name));

  const [batchResult] = await connection.query('SELECT IFNULL(MAX(batch), 0) + 1 AS nextBatch FROM migrations');
  const currentBatch = batchResult[0].nextBatch;

  const available = getAvailableMigrations();
  const pending = available.filter(m => !executedNames.has(m.name));

  console.log('--------------------------------------------------');
  console.log('🚀 Alumni Tracking System - Database Migration');
  console.log('--------------------------------------------------');
  console.log(`Available migration files: ${available.length}`);
  console.log(`Already applied:           ${executedNames.size}`);
  console.log(`Pending execution:         ${pending.length}`);
  console.log('--------------------------------------------------');

  if (pending.length === 0) {
    console.log('✅ Database is already up to date. Nothing to migrate.');
    return { applied: [] };
  }

  const applied = [];

  for (const migration of pending) {
    console.log(`⏳ Applying migration: [${migration.name}] ...`);
    const startTime = Date.now();

    if (migration.type === 'js') {
      const mod = require(migration.fullPath);
      if (typeof mod.up !== 'function') {
        throw new Error(`Migration ${migration.file} must export an 'up(connection)' function`);
      }
      await mod.up(connection);
    } else {
      const sql = fs.readFileSync(migration.fullPath, 'utf8');
      await connection.query(sql);
    }

    await connection.query(
      'INSERT INTO migrations (name, batch) VALUES (?, ?)',
      [migration.name, currentBatch]
    );

    const elapsed = Date.now() - startTime;
    console.log(`✅ Applied [${migration.name}] (${elapsed}ms)`);
    applied.push(migration.name);
  }

  console.log('--------------------------------------------------');
  console.log(`🎉 Successfully applied ${applied.length} migration(s).`);
  console.log('--------------------------------------------------');

  await verifyTables(connection, false);
  return { applied };
}

/**
 * Rolls back the most recent migration batch (DOWN).
 */
async function migrateDown(connection) {
  await ensureMigrationsTable(connection);
  const [maxBatchRows] = await connection.query('SELECT MAX(batch) as maxBatch FROM migrations');
  const maxBatch = maxBatchRows[0].maxBatch;

  if (!maxBatch) {
    console.log('ℹ️ No migrations found to rollback.');
    return;
  }

  const [toRollback] = await connection.query(
    'SELECT name FROM migrations WHERE batch = ? ORDER BY id DESC',
    [maxBatch]
  );

  console.log('--------------------------------------------------');
  console.log(`⏪ Rolling back migration batch #${maxBatch} (${toRollback.length} migration(s))...`);
  console.log('--------------------------------------------------');

  for (const record of toRollback) {
    const jsPath = path.join(MIGRATIONS_DIR, `${record.name}.js`);
    if (fs.existsSync(jsPath)) {
      const mod = require(jsPath);
      if (typeof mod.down === 'function') {
        console.log(`⏳ Rolling back: [${record.name}] ...`);
        await mod.down(connection);
      }
    } else {
      console.warn(`⚠️ Warning: No .js rollback file found for ${record.name}. Removing record only.`);
    }

    await connection.query('DELETE FROM migrations WHERE name = ?', [record.name]);
    console.log(`✅ Rolled back [${record.name}]`);
  }

  console.log('--------------------------------------------------');
  console.log(`🎉 Batch #${maxBatch} successfully rolled back.`);
  console.log('--------------------------------------------------');
}

/**
 * Shows current migration status.
 */
async function showStatus(connection) {
  await ensureMigrationsTable(connection);
  const executedRows = await getExecutedMigrations(connection);
  const executedMap = new Map(executedRows.map(r => [r.name, r]));
  const available = getAvailableMigrations();

  console.log('--------------------------------------------------------------------------------');
  console.log('📊 Migration Status');
  console.log('--------------------------------------------------------------------------------');
  console.log(`${'Migration Name'.padEnd(40)} | ${'Status'.padEnd(10)} | ${'Batch'.padEnd(6)} | Executed At`);
  console.log('--------------------------------------------------------------------------------');

  for (const m of available) {
    const executed = executedMap.get(m.name);
    if (executed) {
      const executedDate = new Date(executed.executed_at).toISOString().replace('T', ' ').substring(0, 19);
      console.log(`${m.name.padEnd(40)} | ${'Applied'.padEnd(10)} | ${String(executed.batch).padEnd(6)} | ${executedDate}`);
    } else {
      console.log(`${m.name.padEnd(40)} | ${'Pending'.padEnd(10)} | ${'-'.padEnd(6)} | -`);
    }
  }

  console.log('--------------------------------------------------------------------------------');
}

/**
 * Verifies that the required tables and schema columns exist in the database.
 */
async function verifyTables(connection, verbose = true) {
  const [tables] = await connection.query('SHOW TABLES');
  const tableKey = Object.keys(tables[0] || {})[0] || 'Tables_in_alumni_db';
  const tableNames = tables.map(t => t[tableKey]);

  console.log('\n📋 Database Table Verification:');
  console.log(`Current tables in database: [ ${tableNames.join(', ')} ]`);

  const requiredTables = ['users', 'announcements', 'job_postings', 'applications'];
  for (const table of requiredTables) {
    if (tableNames.includes(table)) {
      console.log(`  ✅ Table '${table}' exists.`);
      if (verbose) {
        const [columns] = await connection.query(`DESCRIBE ${table}`);
        console.log(`     Columns for '${table}':`);
        columns.forEach(col => {
          console.log(`       - ${col.Field.padEnd(14)} ${col.Type.padEnd(20)} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''} ${col.Extra || ''}`);
        });
      }
    } else {
      console.log(`  ❌ Missing required table: '${table}'`);
    }
  }
}

/**
 * Main execution entry point.
 */
async function main() {
  const command = (process.argv[2] || 'up').toLowerCase();

  let connection;
  try {
    connection = await createConnection();

    switch (command) {
      case 'up':
      case 'migrate':
        await migrateUp(connection);
        break;
      case 'down':
      case 'rollback':
        await migrateDown(connection);
        break;
      case 'status':
        await showStatus(connection);
        break;
      case 'verify':
        await verifyTables(connection, true);
        break;
      default:
        console.error(`Unknown command: '${command}'. Available: up, down, status, verify`);
        process.exitCode = 1;
    }
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  migrateUp,
  migrateDown,
  showStatus,
  verifyTables,
  getAvailableMigrations
};
