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
    'SELECT id, title, company, location, description, contact_email, created_at, updated_at FROM job_postings ORDER BY id ASC'
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
    'SELECT id, title, company, location, description, contact_email, created_at, updated_at FROM job_postings WHERE id = ? LIMIT 1',
    [jobPostingId]
  );
  return rows.length > 0 ? formatJobPosting(rows[0]) : null;
};

/**
 * Creates a new job posting in MySQL.
 * @param {Object} jobPostingData - Job posting data { title, company, location, description, contact_email }
 * @returns {Promise<Object>} Created job posting object
 */
const createJobPosting = async (jobPostingData = {}) => {
  const data = jobPostingData || {};
  const title = data.title !== undefined ? String(data.title) : '';
  const company = data.company !== undefined ? String(data.company) : '';
  const location = data.location !== undefined && data.location !== null ? String(data.location) : null;
  const description = data.description !== undefined ? String(data.description) : '';
  const contactEmail = data.contact_email !== undefined && data.contact_email !== null
    ? String(data.contact_email)
    : (data.contactEmail !== undefined && data.contactEmail !== null ? String(data.contactEmail) : null);

  const pool = await getPool();
  const [result] = await pool.query(
    'INSERT INTO job_postings (title, company, location, description, contact_email) VALUES (?, ?, ?, ?, ?)',
    [title, company, location, description, contactEmail]
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
  let updatedTitle = existingJobPosting.title;
  let updatedCompany = existingJobPosting.company;
  let updatedLocation = existingJobPosting.location;
  let updatedDescription = existingJobPosting.description;
  let updatedContactEmail = existingJobPosting.contact_email;

  if (isPartial) {
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
    'UPDATE job_postings SET title = ?, company = ?, location = ?, description = ?, contact_email = ? WHERE id = ?',
    [updatedTitle, updatedCompany, updatedLocation, updatedDescription, updatedContactEmail, jobPostingId]
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

module.exports = {
  jobPostings,
  formatJobPosting,
  getAllJobPostings,
  getJobPostingById,
  createJobPosting,
  updateJobPosting,
  patchJobPosting,
  deleteJobPosting
};
