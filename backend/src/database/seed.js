const { createConnection } = require('../config/db');
const { seedUsers } = require('./seeds/userSeeder');
const { seedAnnouncements } = require('./seeds/announcementSeeder');
const { seedJobPostings } = require('./seeds/jobPostingSeeder');

/**
 * Main Database Seed Runner
 * Populates MySQL database with realistic sample data safely and idempotently.
 */
async function runSeeds() {
  console.log('==================================================');
  console.log('🌱 Alumni Tracking System - Database Seeder');
  console.log('==================================================');

  let connection;
  try {
    connection = await createConnection();

    // Verify required tables exist before seeding
    const [tables] = await connection.query('SHOW TABLES');
    const tableKey = Object.keys(tables[0] || {})[0] || 'Tables_in_alumni_db';
    const existingTableNames = tables.map(t => t[tableKey]);

    const requiredTables = ['users', 'announcements', 'job_postings'];
    const missing = requiredTables.filter(t => !existingTableNames.includes(t));

    if (missing.length > 0) {
      console.error(`❌ Missing tables: ${missing.join(', ')}. Please run migrations first (npm run migrate).`);
      process.exitCode = 1;
      return;
    }

    const startTime = Date.now();

    // Execute individual seeders
    const userResult = await seedUsers(connection);
    const announcementResult = await seedAnnouncements(connection);
    const jobPostingResult = await seedJobPostings(connection);

    const elapsed = Date.now() - startTime;

    console.log('\n==================================================');
    console.log('🎉 Seeding Process Completed!');
    console.log('==================================================');
    console.log(`⏱️  Duration:             ${elapsed}ms`);
    console.log(`👤 Users:                ${userResult.inserted} inserted, ${userResult.skipped} skipped`);
    console.log(`📢 Announcements:        ${announcementResult.inserted} inserted, ${announcementResult.skipped} skipped`);
    console.log(`💼 Job Postings:         ${jobPostingResult.inserted} inserted, ${jobPostingResult.skipped} skipped`);
    console.log('==================================================');

    // Display current table counts
    const [[{ userCount }]] = await connection.query('SELECT COUNT(*) AS userCount FROM users');
    const [[{ announcementCount }]] = await connection.query('SELECT COUNT(*) AS announcementCount FROM announcements');
    const [[{ jobPostingCount }]] = await connection.query('SELECT COUNT(*) AS jobPostingCount FROM job_postings');
    console.log(`📊 Current Total in DB:   ${userCount} user(s), ${announcementCount} announcement(s), ${jobPostingCount} job posting(s)\n`);

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
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
  runSeeds();
}

module.exports = {
  runSeeds
};
