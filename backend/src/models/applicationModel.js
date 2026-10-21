const { getPool } = require('../config/db');

// In-memory array kept for backward compatibility if imported directly
const applications = [];

/**
 * Normalizes MySQL row to match existing view layer and JSON expectations.
 * @param {Object} row - Raw MySQL row
 * @returns {Object|null} Normalized application object
 */
const formatApplication = (row) => {
  if (!row) return null;
  const createdAtIso = row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString();
  return {
    id: row.id,
    job_posting_id: row.job_posting_id,
    jobPostingId: row.job_posting_id,
    user_id: row.user_id !== undefined ? row.user_id : null,
    userId: row.user_id !== undefined ? row.user_id : null,
    applicant_name: row.applicant_name,
    applicantName: row.applicant_name,
    applicant_email: row.applicant_email,
    applicantEmail: row.applicant_email,
    resume_url: row.resume_url !== undefined ? row.resume_url : null,
    resumeUrl: row.resume_url !== undefined ? row.resume_url : null,
    cover_letter: row.cover_letter !== undefined ? row.cover_letter : null,
    coverLetter: row.cover_letter !== undefined ? row.cover_letter : null,
    status: row.status !== undefined && row.status !== null ? row.status : 'PENDING',
    createdAt: createdAtIso,
    createdDate: createdAtIso,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

/**
 * Returns all applications from MySQL ordered by id.
 * @returns {Promise<Array>} List of applications
 */
const getAllApplications = async () => {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, job_posting_id, user_id, applicant_name, applicant_email, resume_url, cover_letter, status, created_at, updated_at FROM applications ORDER BY id ASC'
  );
  return rows.map(formatApplication);
};

/**
 * Finds a single application by ID.
 * @param {number|string} id - Application ID
 * @returns {Promise<Object|null>} Application object or null if not found
 */
const getApplicationById = async (id) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return null;
  }
  const applicationId = Number(id);
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, job_posting_id, user_id, applicant_name, applicant_email, resume_url, cover_letter, status, created_at, updated_at FROM applications WHERE id = ? LIMIT 1',
    [applicationId]
  );
  return rows.length > 0 ? formatApplication(rows[0]) : null;
};

/**
 * Retrieves all applications belonging to a specific job posting.
 * @param {number|string} jobPostingId - Job Posting ID
 * @returns {Promise<Array>} List of applications for the job posting
 */
const getApplicationsByJobPostingId = async (jobPostingId) => {
  if (jobPostingId === undefined || jobPostingId === null || jobPostingId === '' || isNaN(Number(jobPostingId))) {
    return [];
  }
  const targetJobId = Number(jobPostingId);
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, job_posting_id, user_id, applicant_name, applicant_email, resume_url, cover_letter, status, created_at, updated_at FROM applications WHERE job_posting_id = ? ORDER BY id ASC',
    [targetJobId]
  );
  return rows.map(formatApplication);
};

/**
 * Creates a new application in MySQL.
 * @param {Object} applicationData - Application data
 * @returns {Promise<Object>} Created application object
 */
const createApplication = async (applicationData = {}) => {
  const data = applicationData || {};

  const rawJobPostingId = data.job_posting_id !== undefined ? data.job_posting_id : data.jobPostingId;
  const jobPostingId = rawJobPostingId !== undefined && rawJobPostingId !== null && !isNaN(Number(rawJobPostingId))
    ? Number(rawJobPostingId)
    : 0;

  const rawUserId = data.user_id !== undefined ? data.user_id : data.userId;
  const userId = rawUserId !== undefined && rawUserId !== null && rawUserId !== '' && !isNaN(Number(rawUserId))
    ? Number(rawUserId)
    : null;

  const applicantName = data.applicant_name !== undefined
    ? String(data.applicant_name)
    : (data.applicantName !== undefined ? String(data.applicantName) : '');

  const applicantEmail = data.applicant_email !== undefined
    ? String(data.applicant_email)
    : (data.applicantEmail !== undefined ? String(data.applicantEmail) : '');

  const rawResumeUrl = data.resume_url !== undefined ? data.resume_url : data.resumeUrl;
  const resumeUrl = rawResumeUrl !== undefined && rawResumeUrl !== null ? String(rawResumeUrl) : null;

  const rawCoverLetter = data.cover_letter !== undefined ? data.cover_letter : data.coverLetter;
  const coverLetter = rawCoverLetter !== undefined && rawCoverLetter !== null ? String(rawCoverLetter) : null;

  const status = data.status !== undefined && data.status !== null && String(data.status).trim() !== ''
    ? String(data.status).trim()
    : 'PENDING';

  const pool = await getPool();
  const [result] = await pool.query(
    'INSERT INTO applications (job_posting_id, user_id, applicant_name, applicant_email, resume_url, cover_letter, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [jobPostingId, userId, applicantName, applicantEmail, resumeUrl, coverLetter, status]
  );

  return await getApplicationById(result.insertId);
};

/**
 * Updates an application by ID in MySQL (full PUT or partial PATCH).
 * @param {number|string} id - Application ID
 * @param {Object} applicationData - New application data
 * @param {boolean} [isPartial=false] - Partial update flag
 * @returns {Promise<Object|null>} Updated application or null if not found
 */
const updateApplication = async (id, applicationData = {}, isPartial = false) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return null;
  }
  const applicationId = Number(id);
  const existingApplication = await getApplicationById(applicationId);

  if (!existingApplication) {
    return null;
  }

  const data = applicationData || {};
  let updatedJobPostingId = existingApplication.job_posting_id;
  let updatedUserId = existingApplication.user_id;
  let updatedApplicantName = existingApplication.applicant_name;
  let updatedApplicantEmail = existingApplication.applicant_email;
  let updatedResumeUrl = existingApplication.resume_url;
  let updatedCoverLetter = existingApplication.cover_letter;
  let updatedStatus = existingApplication.status;

  if (isPartial) {
    if (data.job_posting_id !== undefined || data.jobPostingId !== undefined) {
      const val = data.job_posting_id !== undefined ? data.job_posting_id : data.jobPostingId;
      if (val !== null && val !== '' && !isNaN(Number(val))) {
        updatedJobPostingId = Number(val);
      }
    }
    if (data.user_id !== undefined || data.userId !== undefined) {
      const val = data.user_id !== undefined ? data.user_id : data.userId;
      updatedUserId = (val !== null && val !== '' && !isNaN(Number(val))) ? Number(val) : null;
    }
    if (data.applicant_name !== undefined) {
      updatedApplicantName = String(data.applicant_name);
    } else if (data.applicantName !== undefined) {
      updatedApplicantName = String(data.applicantName);
    }
    if (data.applicant_email !== undefined) {
      updatedApplicantEmail = String(data.applicant_email);
    } else if (data.applicantEmail !== undefined) {
      updatedApplicantEmail = String(data.applicantEmail);
    }
    if (data.resume_url !== undefined) {
      updatedResumeUrl = data.resume_url !== null ? String(data.resume_url) : null;
    } else if (data.resumeUrl !== undefined) {
      updatedResumeUrl = data.resumeUrl !== null ? String(data.resumeUrl) : null;
    }
    if (data.cover_letter !== undefined) {
      updatedCoverLetter = data.cover_letter !== null ? String(data.cover_letter) : null;
    } else if (data.coverLetter !== undefined) {
      updatedCoverLetter = data.coverLetter !== null ? String(data.coverLetter) : null;
    }
    if (data.status !== undefined && data.status !== null && String(data.status).trim() !== '') {
      updatedStatus = String(data.status).trim();
    }
  } else {
    const rawJobPostingId = data.job_posting_id !== undefined ? data.job_posting_id : data.jobPostingId;
    updatedJobPostingId = rawJobPostingId !== undefined && rawJobPostingId !== null && !isNaN(Number(rawJobPostingId))
      ? Number(rawJobPostingId)
      : 0;

    const rawUserId = data.user_id !== undefined ? data.user_id : data.userId;
    updatedUserId = rawUserId !== undefined && rawUserId !== null && rawUserId !== '' && !isNaN(Number(rawUserId))
      ? Number(rawUserId)
      : null;

    updatedApplicantName = data.applicant_name !== undefined
      ? String(data.applicant_name)
      : (data.applicantName !== undefined ? String(data.applicantName) : '');

    updatedApplicantEmail = data.applicant_email !== undefined
      ? String(data.applicant_email)
      : (data.applicantEmail !== undefined ? String(data.applicantEmail) : '');

    const rawResumeUrl = data.resume_url !== undefined ? data.resume_url : data.resumeUrl;
    updatedResumeUrl = rawResumeUrl !== undefined && rawResumeUrl !== null ? String(rawResumeUrl) : null;

    const rawCoverLetter = data.cover_letter !== undefined ? data.cover_letter : data.coverLetter;
    updatedCoverLetter = rawCoverLetter !== undefined && rawCoverLetter !== null ? String(rawCoverLetter) : null;

    updatedStatus = data.status !== undefined && data.status !== null && String(data.status).trim() !== ''
      ? String(data.status).trim()
      : 'PENDING';
  }

  const pool = await getPool();
  await pool.query(
    'UPDATE applications SET job_posting_id = ?, user_id = ?, applicant_name = ?, applicant_email = ?, resume_url = ?, cover_letter = ?, status = ? WHERE id = ?',
    [updatedJobPostingId, updatedUserId, updatedApplicantName, updatedApplicantEmail, updatedResumeUrl, updatedCoverLetter, updatedStatus, applicationId]
  );

  return await getApplicationById(applicationId);
};

/**
 * Partially updates an application by ID (PATCH).
 * @param {number|string} id - Application ID
 * @param {Object} partialData - Partial fields to update
 * @returns {Promise<Object|null>}
 */
const patchApplication = async (id, partialData) => {
  return await updateApplication(id, partialData, true);
};

/**
 * Deletes an application by ID from MySQL.
 * @param {number|string} id - Application ID
 * @returns {Promise<boolean>} True if deleted, false if application not found
 */
const deleteApplication = async (id) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return false;
  }
  const applicationId = Number(id);
  const pool = await getPool();
  const [result] = await pool.query(
    'DELETE FROM applications WHERE id = ?',
    [applicationId]
  );
  return result.affectedRows > 0;
};

module.exports = {
  applications,
  formatApplication,
  getAllApplications,
  getApplicationById,
  getApplicationsByJobPostingId,
  createApplication,
  updateApplication,
  patchApplication,
  deleteApplication
};
