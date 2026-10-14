const announcementFactory = require('../factories/announcementFactory');

/**
 * Seeds the announcements table with realistic alumni notices.
 * Idempotent: Checks whether an announcement with the same title already exists
 * without modifying table schema or adding unnecessary UNIQUE constraints.
 * 
 * @param {import('mysql2/promise').Connection} connection
 * @returns {Promise<{ inserted: number, skipped: number, total: number }>}
 */
async function seedAnnouncements(connection) {
  console.log('\n📢 Seeding Announcements...');

  const seedAnnouncementsList = announcementFactory.getPredefinedAnnouncements();
  let inserted = 0;
  let skipped = 0;

  for (const announcement of seedAnnouncementsList) {
    const [existing] = await connection.query(
      'SELECT id, title FROM announcements WHERE title = ? LIMIT 1',
      [announcement.title]
    );

    if (existing && existing.length > 0) {
      console.log(`  ⏭️  [SKIP] Announcement already exists: "${announcement.title}"`);
      skipped++;
    } else {
      await connection.query(
        'INSERT INTO announcements (title, content) VALUES (?, ?)',
        [announcement.title, announcement.content]
      );
      console.log(`  ➕ [INSERT] Created announcement: "${announcement.title}"`);
      inserted++;
    }
  }

  console.log(`  📊 Announcements Seeding Summary: ${inserted} inserted, ${skipped} skipped (Total: ${seedAnnouncementsList.length})`);
  return { inserted, skipped, total: seedAnnouncementsList.length };
}

module.exports = {
  seedAnnouncements
};
