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
 * Returns all applications joined with their job posting title & company for the Admin Panel.
 * Preserves public getAllApplications() shape separately.
 * @returns {Promise<Array>}
 */
const getAllApplicationsWithJobDetails = async () => {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT a.id, a.job_posting_id, a.user_id, a.applicant_name, a.applicant_email,
            a.resume_url, a.cover_letter, a.status, a.created_at, a.updated_at,
            jp.title AS job_title, jp.company AS job_company
     FROM applications a
     LEFT JOIN job_postings jp ON a.job_posting_id = jp.id
     ORDER BY a.id DESC`
  );
  return rows.map((row) => ({
    ...formatApplication(row),
    job_title: row.job_title || null,
    job_company: row.job_company || null
  }));
};

/**
 * Returns all applications submitted by a specific authenticated user (WHERE a.user_id = ?),
 * joined with job_postings for job_title and job_company, ordered newest first.
 * @param {number|string} userId
 * @returns {Promise<Array>}
 */
const getApplicationsByUserId = async (userId) => {
  if (userId === undefined || userId === null || idIsInvalid(userId)) {
    return [];
  }
  const targetUserId = Number(userId);
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT a.id, a.job_posting_id, a.user_id, a.applicant_name, a.applicant_email,
            a.resume_url, a.cover_letter, a.status, a.created_at, a.updated_at,
            jp.title AS job_title, jp.company AS job_company
     FROM applications a
     LEFT JOIN job_postings jp ON a.job_posting_id = jp.id
     WHERE a.user_id = ?
     ORDER BY a.id DESC`,
    [targetUserId]
  );
  return rows.map((row) => ({
    ...formatApplication(row),
    job_title: row.job_title || null,
    job_company: row.job_company || null
  }));
};

/**
 * Returns all applications submitted to job postings owned by a specific user (WHERE jp.user_id = ?),
 * ordered newest first.
 * @param {number|string} ownerUserId
 * @returns {Promise<Array>}
 */
const getApplicationsByJobOwnerId = async (ownerUserId) => {
  if (ownerUserId === undefined || ownerUserId === null || idIsInvalid(ownerUserId)) {
    return [];
  }
  const targetOwnerId = Number(ownerUserId);
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT a.id, a.job_posting_id, a.user_id, a.applicant_name, a.applicant_email,
            a.resume_url, a.cover_letter, a.status, a.created_at, a.updated_at,
            jp.title AS job_title, jp.company AS job_company
     FROM applications a
     INNER JOIN job_postings jp ON a.job_posting_id = jp.id
     WHERE jp.user_id = ?
     ORDER BY a.id DESC`,
    [targetOwnerId]
  );
  return rows.map((row) => ({
    ...formatApplication(row),
    job_title: row.job_title || null,
    job_company: row.job_company || null
  }));
};

function parsePositiveIntegerId(val) {
  if (typeof val === 'number') {
    return Number.isInteger(val) && val > 0 ? val : null;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!/^\d+$/.test(trimmed)) {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

function idIsInvalid(val) {
  return parsePositiveIntegerId(val) === null;
}

/**
 * Finds a single application by ID.
 * @param {number|string} id - Application ID
 * @returns {Promise<Object|null>} Application object or null if not found
 */
const getApplicationById = async (id) => {
  const applicationId = parsePositiveIntegerId(id);
  if (applicationId === null) {
    return null;
  }
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
  const targetJobId = parsePositiveIntegerId(jobPostingId);
  if (targetJobId === null) {
    return [];
  }
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, job_posting_id, user_id, applicant_name, applicant_email, resume_url, cover_letter, status, created_at, updated_at FROM applications WHERE job_posting_id = ? ORDER BY id ASC',
    [targetJobId]
  );
  return rows.map(formatApplication);
};

const ALLOWED_APPLICATION_STATUSES = ['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'];

const createApplicationError = (code, message, statusCode = 400) => {
  const err = new Error(message);
  err.code = code;
  err.statusCode = statusCode;
  return err;
};

/**
 * Creates a new application in MySQL inside a transaction.
 * Locks the target job_postings row with FOR SHARE before inserting so concurrent
 * job posting deletion cannot create orphaned applications.
 * Preserves guest applications (user_id = NULL) and all existing response fields.
 * @param {Object} applicationData - Application data
 * @returns {Promise<Object>} Created application object
 */
const createApplication = async (applicationData = {}) => {
  const data = applicationData || {};

  const rawJobPostingId = data.job_posting_id !== undefined ? data.job_posting_id : data.jobPostingId;
  const jobPostingId = parsePositiveIntegerId(rawJobPostingId) || 0;

  const rawUserId = data.user_id !== undefined ? data.user_id : data.userId;
  const userId = parsePositiveIntegerId(rawUserId);

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
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    if (!Number.isInteger(jobPostingId) || jobPostingId <= 0) {
      await connection.rollback();
      throw createApplicationError('JOB_POSTING_NOT_FOUND', 'Belirtilen iş ilanı bulunamadı', 404);
    }

    const [jobRows] = await connection.query(
      'SELECT id FROM job_postings WHERE id = ? LIMIT 1 FOR SHARE',
      [jobPostingId]
    );
    if (jobRows.length === 0) {
      await connection.rollback();
      throw createApplicationError('JOB_POSTING_NOT_FOUND', 'Belirtilen iş ilanı bulunamadı', 404);
    }

    const [result] = await connection.query(
      'INSERT INTO applications (job_posting_id, user_id, applicant_name, applicant_email, resume_url, cover_letter, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [jobPostingId, userId, applicantName, applicantEmail, resumeUrl, coverLetter, status]
    );

    const [createdRows] = await connection.query(
      'SELECT id, job_posting_id, user_id, applicant_name, applicant_email, resume_url, cover_letter, status, created_at, updated_at FROM applications WHERE id = ? LIMIT 1',
      [result.insertId]
    );
    await connection.commit();
    return createdRows.length > 0 ? formatApplication(createdRows[0]) : null;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_) {
      // Ignore rollback failure when transaction already ended
    }
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Updates an application by ID in MySQL (full PUT or partial PATCH) inside a transaction.
 * Locks the target job_postings row (FOR SHARE) before locking applications (FOR UPDATE)
 * when job_posting_id is supplied/changed so concurrent job deletion stays deadlock-free.
 * @param {number|string} id - Application ID
 * @param {Object} applicationData - New application data
 * @param {boolean} [isPartial=false] - Partial update flag
 * @returns {Promise<Object|null>} Updated application or null if not found
 */
const updateApplication = async (id, applicationData = {}, isPartial = false) => {
  const applicationId = parsePositiveIntegerId(id);
  if (applicationId === null) {
    return null;
  }
  const data = applicationData || {};

  const hasJobPostingInput =
    !isPartial || data.job_posting_id !== undefined || data.jobPostingId !== undefined;
  const rawJobPostingId = data.job_posting_id !== undefined ? data.job_posting_id : data.jobPostingId;

  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let requestedJobPostingId = null;
    if (hasJobPostingInput) {
      requestedJobPostingId = parsePositiveIntegerId(rawJobPostingId) || 0;

      if (!Number.isInteger(requestedJobPostingId) || requestedJobPostingId <= 0) {
        await connection.rollback();
        throw createApplicationError('JOB_POSTING_NOT_FOUND', 'Belirtilen iş ilanı bulunamadı', 404);
      }

      const [jobRows] = await connection.query(
        'SELECT id FROM job_postings WHERE id = ? LIMIT 1 FOR SHARE',
        [requestedJobPostingId]
      );
      if (jobRows.length === 0) {
        await connection.rollback();
        throw createApplicationError('JOB_POSTING_NOT_FOUND', 'Belirtilen iş ilanı bulunamadı', 404);
      }
    }

    const [existingRows] = await connection.query(
      'SELECT id, job_posting_id, user_id, applicant_name, applicant_email, resume_url, cover_letter, status, created_at, updated_at FROM applications WHERE id = ? LIMIT 1 FOR UPDATE',
      [applicationId]
    );
    if (existingRows.length === 0) {
      await connection.rollback();
      return null;
    }

    const existingApplication = formatApplication(existingRows[0]);
    let updatedJobPostingId = existingApplication.job_posting_id;
    let updatedUserId = existingApplication.user_id;
    let updatedApplicantName = existingApplication.applicant_name;
    let updatedApplicantEmail = existingApplication.applicant_email;
    let updatedResumeUrl = existingApplication.resume_url;
    let updatedCoverLetter = existingApplication.cover_letter;
    let updatedStatus = existingApplication.status;

    if (isPartial) {
      if (hasJobPostingInput) {
        updatedJobPostingId = requestedJobPostingId;
      }
      if (data.user_id !== undefined || data.userId !== undefined) {
        const val = data.user_id !== undefined ? data.user_id : data.userId;
        updatedUserId = parsePositiveIntegerId(val);
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
      updatedJobPostingId = requestedJobPostingId;

      const rawUserId = data.user_id !== undefined ? data.user_id : data.userId;
      updatedUserId = parsePositiveIntegerId(rawUserId);

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

    await connection.query(
      'UPDATE applications SET job_posting_id = ?, user_id = ?, applicant_name = ?, applicant_email = ?, resume_url = ?, cover_letter = ?, status = ? WHERE id = ?',
      [updatedJobPostingId, updatedUserId, updatedApplicantName, updatedApplicantEmail, updatedResumeUrl, updatedCoverLetter, updatedStatus, applicationId]
    );

    const [updatedRows] = await connection.query(
      'SELECT id, job_posting_id, user_id, applicant_name, applicant_email, resume_url, cover_letter, status, created_at, updated_at FROM applications WHERE id = ? LIMIT 1',
      [applicationId]
    );
    await connection.commit();
    return updatedRows.length > 0 ? formatApplication(updatedRows[0]) : null;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_) {
      // Ignore rollback failure when transaction already ended
    }
    throw error;
  } finally {
    connection.release();
  }
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
  const applicationId = parsePositiveIntegerId(id);
  if (applicationId === null) {
    return false;
  }
  const pool = await getPool();
  const [result] = await pool.query(
    'DELETE FROM applications WHERE id = ?',
    [applicationId]
  );
  return result.affectedRows > 0;
};

/**
 * Counts how many applications reference a specific job posting.
 * Used to block deleting job postings that have existing applications.
 * @param {number|string} jobPostingId
 * @returns {Promise<number>}
 */
const countApplicationsByJobPostingId = async (jobPostingId) => {
  const targetJobId = parsePositiveIntegerId(jobPostingId);
  if (targetJobId === null) {
    return 0;
  }
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS count FROM applications WHERE job_posting_id = ?',
    [targetJobId]
  );
  return Number(rows[0]?.count || 0);
};

module.exports = {
  applications,
  ALLOWED_APPLICATION_STATUSES,
  idIsInvalid,
  formatApplication,
  getAllApplications,
  getAllApplicationsWithJobDetails,
  getApplicationsByUserId,
  getApplicationsByJobOwnerId,
  getApplicationById,
  getApplicationsByJobPostingId,
  countApplicationsByJobPostingId,
  createApplication,
  updateApplication,
  patchApplication,
  deleteApplication
};
