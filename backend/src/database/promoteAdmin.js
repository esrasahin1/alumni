const { getPool } = require('../config/db');
const { promoteUserToAdminByEmail } = require('../models/userModel');

/**
 * One-time CLI utility to safely promote an existing registered user (by email) to admin.
 * Usage: npm run admin:promote -- user@example.com
 *
 * Security guarantees:
 * - Never auto-promotes any account or fallback user.
 * - Requires an explicit email argument.
 * - Requires the target user to already exist and have a password_hash set.
 * - Preserves the user's account type (`role`: student/alumni) while setting `auth_role = 'admin'`.
 */
async function runPromoteAdmin() {
  const emailArg = process.argv.slice(2).find((arg) => arg && arg !== '--');

  if (!emailArg || typeof emailArg !== 'string' || !emailArg.includes('@')) {
    console.error('Usage: npm run admin:promote -- <user-email>');
    console.error('Example: npm run admin:promote -- your.account@university.edu');
    process.exitCode = 1;
    return;
  }

  let pool;
  try {
    pool = await getPool();

    const [columnRows] = await pool.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'auth_role'`
    );
    if (columnRows.length === 0) {
      console.error('Migration required: users.auth_role column does not exist yet. Run `npm run migrate` first.');
      process.exitCode = 1;
      return;
    }

    const promotedUser = await promoteUserToAdminByEmail(emailArg);
    console.log('Successfully promoted user to admin:');
    console.log(JSON.stringify({
      id: promotedUser.id,
      name: promotedUser.name,
      email: promotedUser.email,
      role: promotedUser.role,
      auth_role: promotedUser.auth_role
    }, null, 2));
  } catch (error) {
    console.error(`Failed to promote admin: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

runPromoteAdmin();
