const userFactory = require('../factories/userFactory');

/**
 * Seeds the users table with realistic alumni records.
 * Idempotent: Skips records whose email already exists in the database.
 * 
 * @param {import('mysql2/promise').Connection} connection
 * @returns {Promise<{ inserted: number, skipped: number, total: number }>}
 */
async function seedUsers(connection) {
  console.log('\n👤 Seeding Users...');
  
  const seedUsersList = userFactory.getPredefinedUsers();
  let inserted = 0;
  let skipped = 0;

  for (const user of seedUsersList) {
    const [existing] = await connection.query(
      'SELECT id, email FROM users WHERE email = ? LIMIT 1',
      [user.email]
    );

    if (existing && existing.length > 0) {
      console.log(`  ⏭️  [SKIP] User already exists: ${user.name} (${user.email})`);
      skipped++;
    } else {
      await connection.query(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [user.name, user.email]
      );
      console.log(`  ➕ [INSERT] Created user: ${user.name} (${user.email})`);
      inserted++;
    }
  }

  console.log(`  📊 Users Seeding Summary: ${inserted} inserted, ${skipped} skipped (Total: ${seedUsersList.length})`);
  return { inserted, skipped, total: seedUsersList.length };
}

module.exports = {
  seedUsers
};
