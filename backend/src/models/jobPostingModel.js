const { getPool } = require('../config/db');

// In-memory array kept for backward compatibility if imported directly
const jobPostings = [];

/**
 * Normalizes MySQL row to match existing view layer and JSON expectations.
 */
const formatJobPosting = (row) => {
  if (!row) return null;
  const createdAtIso = row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString();
  return {
    id: row.id,
    user_id: row.user_id !== undefined ? row.user_id : null,
    userId: row.user_id !== undefined ? row.user_id : null,
    title: row.title,
    company: row.company,
    location: row.location !== undefined ? row.location : null,
    description: row.description,
    contact_email: row.contact_email !== undefined ? row.contact_email : null,
    createdAt: createdAtIso,
    createdDate: createdAtIso,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

/**
 * Returns all job postings from MySQL ordered by id.
 * @returns {Promise<Array>} List of job postings
 */
const getAllJobPostings = async () => {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, user_id, title, company, location, description, contact_email, created_at, updated_at FROM job_postings ORDER BY id ASC'
  );
  return rows.map(formatJobPosting);
};

/**
 * Finds a single job posting by ID.
 * @param {number|string} id - Job Posting ID
 * @returns {Promise<Object|null>} Job Posting object or null if not found
 */
const getJobPostingById = async (id) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return null;
  }
  const jobPostingId = Number(id);
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, user_id, title, company, location, description, contact_email, created_at, updated_at FROM job_postings WHERE id = ? LIMIT 1',
    [jobPostingId]
  );
  return rows.length > 0 ? formatJobPosting(rows[0]) : null;
};

/**
 * Creates a new job posting in MySQL.
 * @param {Object} jobPostingData - Job posting data { user_id, title, company, location, description, contact_email }
 * @returns {Promise<Object>} Created job posting object
 */
const createJobPosting = async (jobPostingData = {}) => {
  const data = jobPostingData || {};
  const rawUserId = data.user_id !== undefined ? data.user_id : data.userId;
  const userId = rawUserId !== undefined && rawUserId !== null && rawUserId !== '' && !isNaN(Number(rawUserId))
    ? Number(rawUserId)
    : null;

  const title = data.title !== undefined ? String(data.title) : '';
  const company = data.company !== undefined ? String(data.company) : '';
  const location = data.location !== undefined && data.location !== null ? String(data.location) : null;
  const description = data.description !== undefined ? String(data.description) : '';
  const contactEmail = data.contact_email !== undefined && data.contact_email !== null
    ? String(data.contact_email)
    : (data.contactEmail !== undefined && data.contactEmail !== null ? String(data.contactEmail) : null);

  const pool = await getPool();
  const [result] = await pool.query(
    'INSERT INTO job_postings (user_id, title, company, location, description, contact_email) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, title, company, location, description, contactEmail]
  );

  return await getJobPostingById(result.insertId);
};

/**
 * Updates a job posting by ID in MySQL (full PUT or partial PATCH).
 * @param {number|string} id - Job Posting ID
 * @param {Object} jobPostingData - New job posting data
 * @param {boolean} [isPartial=false] - Partial update flag
 * @returns {Promise<Object|null>} Updated job posting or null if not found
 */
const updateJobPosting = async (id, jobPostingData = {}, isPartial = false) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return null;
  }
  const jobPostingId = Number(id);
  const existingJobPosting = await getJobPostingById(jobPostingId);

  if (!existingJobPosting) {
    return null;
  }

  const data = jobPostingData || {};
  let updatedUserId = existingJobPosting.user_id;
  let updatedTitle = existingJobPosting.title;
  let updatedCompany = existingJobPosting.company;
  let updatedLocation = existingJobPosting.location;
  let updatedDescription = existingJobPosting.description;
  let updatedContactEmail = existingJobPosting.contact_email;

  if (isPartial) {
    if (data.user_id !== undefined || data.userId !== undefined) {
      const val = data.user_id !== undefined ? data.user_id : data.userId;
      updatedUserId = (val !== null && val !== '' && !isNaN(Number(val))) ? Number(val) : null;
    }
    if (data.title !== undefined) updatedTitle = String(data.title);
    if (data.company !== undefined) updatedCompany = String(data.company);
    if (data.location !== undefined) updatedLocation = data.location !== null ? String(data.location) : null;
    if (data.description !== undefined) updatedDescription = String(data.description);
    if (data.contact_email !== undefined) {
      updatedContactEmail = data.contact_email !== null ? String(data.contact_email) : null;
    } else if (data.contactEmail !== undefined) {
      updatedContactEmail = data.contactEmail !== null ? String(data.contactEmail) : null;
    }
  } else {
    const rawUserId = data.user_id !== undefined ? data.user_id : data.userId;
    if (rawUserId !== undefined) {
      updatedUserId = (rawUserId !== null && rawUserId !== '' && !isNaN(Number(rawUserId)))
        ? Number(rawUserId)
        : null;
    }
    updatedTitle = data.title !== undefined ? String(data.title) : '';
    updatedCompany = data.company !== undefined ? String(data.company) : '';
    updatedLocation = data.location !== undefined && data.location !== null ? String(data.location) : null;
    updatedDescription = data.description !== undefined ? String(data.description) : '';
    updatedContactEmail = data.contact_email !== undefined && data.contact_email !== null
      ? String(data.contact_email)
      : (data.contactEmail !== undefined && data.contactEmail !== null ? String(data.contactEmail) : null);
  }

  const pool = await getPool();
  await pool.query(
    'UPDATE job_postings SET user_id = ?, title = ?, company = ?, location = ?, description = ?, contact_email = ? WHERE id = ?',
    [updatedUserId, updatedTitle, updatedCompany, updatedLocation, updatedDescription, updatedContactEmail, jobPostingId]
  );

  return await getJobPostingById(jobPostingId);
};

/**
 * Partially updates a job posting by ID (PATCH).
 * @param {number|string} id - Job Posting ID
 * @param {Object} partialData - Partial fields to update
 * @returns {Promise<Object|null>}
 */
const patchJobPosting = async (id, partialData) => {
  return await updateJobPosting(id, partialData, true);
};

/**
 * Deletes a job posting by ID from MySQL.
 * @param {number|string} id - Job Posting ID
 * @returns {Promise<boolean>} True if deleted, false if job posting not found
 */
const deleteJobPosting = async (id) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return false;
  }
  const jobPostingId = Number(id);
  const pool = await getPool();
  const [result] = await pool.query(
    'DELETE FROM job_postings WHERE id = ?',
    [jobPostingId]
  );
  return result.affectedRows > 0;
};

/**
 * Retrieves all job postings matching a specific contact email.
 * @param {string} email - Contact email of the posting user
 * @returns {Promise<Array>} List of job postings
 */
const getJobPostingsByContactEmail = async (email) => {
  if (!email || typeof email !== 'string') {
    return [];
  }
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, user_id, title, company, location, description, contact_email, created_at, updated_at FROM job_postings WHERE contact_email = ? ORDER BY id ASC',
    [email.trim()]
  );
  return rows.map(formatJobPosting);
};

/**
 * Retrieves all job postings created by a specific user ID directly via job_postings.user_id.
 * Checks if user exists in users table. If not, returns null.
 * If user exists, returns array of job postings where user_id = userId (ordered by id ASC).
 * @param {number|string} userId - User ID
 * @returns {Promise<Array|null>} List of job postings, or null if user does not exist
 */
const getJobPostingsByUserId = async (userId) => {
  if (userId === undefined || userId === null || userId === '' || isNaN(Number(userId))) {
    return null;
  }
  const targetUserId = Number(userId);
  const pool = await getPool();
  const [userRows] = await pool.query(
    'SELECT id, name, email FROM users WHERE id = ? LIMIT 1',
    [targetUserId]
  );
  if (!userRows || userRows.length === 0) {
    return null;
  }

  const [rows] = await pool.query(
    'SELECT id, user_id, title, company, location, description, contact_email, created_at, updated_at FROM job_postings WHERE user_id = ? ORDER BY id ASC',
    [targetUserId]
  );
  return rows.map(formatJobPosting);
};

module.exports = {
  jobPostings,
  formatJobPosting,
  getAllJobPostings,
  getJobPostingById,
  getJobPostingsByContactEmail,
  getJobPostingsByUserId,
  createJobPosting,
  updateJobPosting,
  patchJobPosting,
  deleteJobPosting
};
