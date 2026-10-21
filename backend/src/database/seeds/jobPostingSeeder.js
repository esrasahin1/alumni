const jobPostingFactory = require('../factories/jobPostingFactory');

/**
 * Seeds the job_postings table with realistic career opportunities.
 * Idempotent: Checks whether a job posting with the same title and company already exists
 * without modifying table schema or adding unnecessary UNIQUE constraints.
 * 
 * @param {import('mysql2/promise').Connection} connection
 * @returns {Promise<{ inserted: number, skipped: number, total: number }>}
 */
async function seedJobPostings(connection) {
  console.log('\n💼 Seeding Job Postings...');

  const seedJobPostingsList = jobPostingFactory.getPredefinedJobPostings();
  let inserted = 0;
  let skipped = 0;

  for (const job of seedJobPostingsList) {
    const [existing] = await connection.query(
      'SELECT id, title, company FROM job_postings WHERE title = ? AND company = ? LIMIT 1',
      [job.title, job.company]
    );

    if (existing && existing.length > 0) {
      console.log(`  ⏭️  [SKIP] Job posting already exists: "${job.title}" at ${job.company}`);
      skipped++;
    } else {
      await connection.query(
        'INSERT INTO job_postings (title, company, location, description, contact_email) VALUES (?, ?, ?, ?, ?)',
        [job.title, job.company, job.location, job.description, job.contact_email]
      );
      console.log(`  ➕ [INSERT] Created job posting: "${job.title}" at ${job.company}`);
      inserted++;
    }
  }

  console.log(`  📊 Job Postings Seeding Summary: ${inserted} inserted, ${skipped} skipped (Total: ${seedJobPostingsList.length})`);
  return { inserted, skipped, total: seedJobPostingsList.length };
}

module.exports = {
  seedJobPostings
};
