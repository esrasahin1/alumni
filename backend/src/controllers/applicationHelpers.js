const applicationModel = require('../models/applicationModel');
const jobPostingModel = require('../models/jobPostingModel');

const escapeHtml = (str) => {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

function isAdminUser(user) {
  return Boolean(user && user.auth_role === 'admin');
}

function prefersJsonResponse(req) {
  const isApi =
    (req && req.originalUrl && req.originalUrl.startsWith('/api')) ||
    (req && req.path && req.path.startsWith('/api'));
  const accept = (req && req.headers && req.headers.accept) || '';
  const prefersJson = accept.includes('application/json') && !accept.includes('text/html');
  return Boolean(isApi || prefersJson);
}

function sendForbiddenResponse(req, res, message = 'Forbidden: You do not have permission to access this resource.') {
  if (prefersJsonResponse(req)) {
    return res.status(403).json({
      success: false,
      message
    });
  }

  const safeMsg = escapeHtml(message);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>403 Forbidden - Alumni Tracking System</title>
  <style>
    body {
      margin: 0;
      padding: 40px 20px;
      background-color: #101827;
      color: #B9C3D2;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .card {
      max-width: 560px;
      width: 100%;
      background: #202E46;
      border: 1px solid rgba(229, 62, 62, 0.5);
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(229, 62, 62, 0.16);
      color: #feb2b2;
      border: 1px solid rgba(229, 62, 62, 0.4);
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 14px;
    }
    h1 { color: #F4F5F7; margin: 0 0 12px; font-size: 26px; }
    p { margin: 0 0 20px; line-height: 1.6; font-size: 15px; }
    .actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn {
      display: inline-block;
      padding: 10px 18px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
    }
    .btn-lime { background: #D5F36A; color: #101827; }
    .btn-secondary {
      background: rgba(16, 24, 39, 0.65);
      color: #F4F5F7;
      border: 1px solid #35445D;
    }
  </style>
</head>
<body>
  <div class="card" role="alert">
    <div class="badge">403 Forbidden</div>
    <h1>Access Denied</h1>
    <p>${safeMsg}</p>
    <div class="actions">
      <a href="/my-applications" class="btn btn-lime">My Applications</a>
      <a href="/job-postings" class="btn btn-secondary">Job Postings</a>
      <a href="/" class="btn btn-secondary">Return Home</a>
    </div>
  </div>
</body>
</html>`;
  return res.status(403).type('html').send(html);
}

/**
 * Loads application, its parent job posting, and computes caller authorization flags.
 *
 * @param {import('express').Request} req
 * @param {number|string} applicationId
 */
async function getApplicationAccessContext(req, applicationId) {
  const application = await applicationModel.getApplicationById(applicationId);
  if (!application) {
    return {
      application: null,
      jobPosting: null,
      isAdmin: isAdminUser(req && req.user),
      isApplicantOwner: false,
      isJobOwner: false
    };
  }

  const jobPosting = await jobPostingModel.getJobPostingById(application.job_posting_id);
  const currentUserId = req && req.user && req.user.id ? Number(req.user.id) : null;
  const isAdmin = isAdminUser(req && req.user);
  const isApplicantOwner = Boolean(
    currentUserId &&
    application.user_id !== null &&
    application.user_id !== undefined &&
    Number(application.user_id) === currentUserId
  );
  const isJobOwner = Boolean(
    currentUserId &&
    jobPosting &&
    jobPosting.user_id !== null &&
    jobPosting.user_id !== undefined &&
    Number(jobPosting.user_id) === currentUserId
  );

  return {
    application,
    jobPosting,
    isAdmin,
    isApplicantOwner,
    isJobOwner
  };
}

/**
 * Checks whether caller may view candidate list for a job posting.
 */
function canViewJobApplications(user, jobPosting) {
  if (isAdminUser(user)) {
    return true;
  }
  const currentUserId = user && user.id ? Number(user.id) : null;
  return Boolean(
    currentUserId &&
    jobPosting &&
    jobPosting.user_id !== null &&
    jobPosting.user_id !== undefined &&
    Number(jobPosting.user_id) === currentUserId
  );
}

/**
 * Builds a strictly whitelisted payload for public/authenticated application creation.
 * - Authenticated user -> user_id = req.user.id (client user_id ignored)
 * - Guest -> user_id = null (client user_id ignored)
 * - Status -> always 'PENDING' (client status ignored)
 */
const MAX_FIELD_LENGTH = 255;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createValidationError(message) {
  const err = new Error(message);
  err.code = 'VALIDATION_ERROR';
  err.statusCode = 400;
  return err;
}

function isValidHttpUrl(value) {
  if (typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_FIELD_LENGTH) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function isSelfApplication(user, jobPosting) {
  if (!user || !jobPosting) {
    return false;
  }
  const userId = Number(user.id);
  const jobOwnerId =
    jobPosting.user_id !== null && jobPosting.user_id !== undefined
      ? Number(jobPosting.user_id)
      : null;
  return (
    Number.isInteger(userId) &&
    userId > 0 &&
    Number.isInteger(jobOwnerId) &&
    jobOwnerId > 0 &&
    userId === jobOwnerId
  );
}

function getAppCsrfToken(req, res) {
  if (req && typeof req.applicationCsrfToken === 'string' && req.applicationCsrfToken) {
    return req.applicationCsrfToken;
  }
  if (res && res.locals && typeof res.locals.applicationCsrfToken === 'string' && res.locals.applicationCsrfToken) {
    return res.locals.applicationCsrfToken;
  }
  if (req && req.session && typeof req.session.applicationCsrfToken === 'string' && req.session.applicationCsrfToken) {
    return req.session.applicationCsrfToken;
  }
  return '';
}

function validateApplicantFields({
  applicantName,
  applicantEmail,
  resumeUrl,
  validateName = false,
  validateEmail = false,
  validateResume = false
}) {
  if (validateName && typeof applicantName === 'string' && applicantName.length > MAX_FIELD_LENGTH) {
    throw createValidationError(`Applicant name must not exceed ${MAX_FIELD_LENGTH} characters.`);
  }
  if (validateEmail && typeof applicantEmail === 'string') {
    if (applicantEmail.length > MAX_FIELD_LENGTH) {
      throw createValidationError(`Applicant email must not exceed ${MAX_FIELD_LENGTH} characters.`);
    }
    if (applicantEmail !== '' && !EMAIL_REGEX.test(applicantEmail)) {
      throw createValidationError('Please enter a valid applicant email address.');
    }
  }
  if (validateResume && resumeUrl !== null && resumeUrl !== undefined) {
    if (typeof resumeUrl !== 'string') {
      throw createValidationError('Resume URL must be a valid HTTP or HTTPS URL.');
    }
    if (resumeUrl.length > MAX_FIELD_LENGTH) {
      throw createValidationError(`Resume URL must not exceed ${MAX_FIELD_LENGTH} characters.`);
    }
    if (!isValidHttpUrl(resumeUrl)) {
      throw createValidationError('Resume URL must be a valid HTTP or HTTPS URL.');
    }
  }
}

function buildWhitelistedCreatePayload(req, forcedJobPostingId = null) {
  const body = req && req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body
    : {};

  const rawJobId = forcedJobPostingId !== null && forcedJobPostingId !== undefined
    ? forcedJobPostingId
    : (body.job_posting_id !== undefined ? body.job_posting_id : body.jobPostingId);
  const jobPostingId = !applicationModel.idIsInvalid(rawJobId)
    ? Number(String(rawJobId).trim())
    : 0;

  const rawName = body.applicant_name !== undefined ? body.applicant_name : body.applicantName;
  if (rawName !== undefined && rawName !== null && typeof rawName !== 'string' && typeof rawName !== 'number') {
    throw createValidationError('Applicant name must be a valid string.');
  }
  const applicantName = typeof rawName === 'string' || typeof rawName === 'number'
    ? String(rawName).trim()
    : '';

  const rawEmail = body.applicant_email !== undefined ? body.applicant_email : body.applicantEmail;
  if (rawEmail !== undefined && rawEmail !== null && typeof rawEmail !== 'string' && typeof rawEmail !== 'number') {
    throw createValidationError('Applicant email must be a valid string.');
  }
  const applicantEmail = typeof rawEmail === 'string' || typeof rawEmail === 'number'
    ? String(rawEmail).trim()
    : '';

  const rawResume = body.resume_url !== undefined ? body.resume_url : body.resumeUrl;
  let resumeUrl = null;
  if (rawResume !== undefined && rawResume !== null) {
    if (typeof rawResume !== 'string') {
      throw createValidationError('Resume URL must be a valid HTTP or HTTPS URL.');
    }
    const trimmedResume = rawResume.trim();
    resumeUrl = trimmedResume !== '' ? trimmedResume : null;
  }

  validateApplicantFields({
    applicantName,
    applicantEmail,
    resumeUrl,
    validateName: true,
    validateEmail: true,
    validateResume: true
  });

  const rawCover = body.cover_letter !== undefined ? body.cover_letter : body.coverLetter;
  const coverLetter =
    (typeof rawCover === 'string' && rawCover.trim() !== '')
      ? rawCover.trim()
      : null;

  const authenticatedUserId =
    req && req.user && req.user.id && Number.isInteger(Number(req.user.id)) && Number(req.user.id) > 0
      ? Number(req.user.id)
      : null;

  return {
    job_posting_id: jobPostingId,
    user_id: authenticatedUserId,
    applicant_name: applicantName,
    applicant_email: applicantEmail,
    resume_url: resumeUrl,
    cover_letter: coverLetter,
    status: 'PENDING'
  };
}

/**
 * Builds a whitelisted update payload for application review (job owner or admin).
 * Non-admin job owners may review status and cannot reassign user_id or move to unowned job postings.
 */
function buildWhitelistedUpdatePayload(req, existingApplication, { isAdmin = false, isPartial = false } = {}) {
  const body = req && req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body
    : {};

  const allowedStatuses = new Set(applicationModel.ALLOWED_APPLICATION_STATUSES);
  const rawStatus = body.status !== undefined && body.status !== null ? String(body.status).trim().toUpperCase() : undefined;

  if (rawStatus !== undefined && rawStatus !== '' && !allowedStatuses.has(rawStatus)) {
    const err = new Error(`Invalid status. Allowed values: ${applicationModel.ALLOWED_APPLICATION_STATUSES.join(', ')}`);
    err.code = 'INVALID_STATUS';
    throw err;
  }

  if (!isAdmin) {
    // Job posting owner: only review fields (status), never spoof user_id or reassign job_posting_id
    const payload = {
      status: rawStatus && allowedStatuses.has(rawStatus)
        ? rawStatus
        : existingApplication.status
    };

    if (!isPartial) {
      payload.job_posting_id = existingApplication.job_posting_id;
      payload.user_id = existingApplication.user_id;
      payload.applicant_name = existingApplication.applicant_name;
      payload.applicant_email = existingApplication.applicant_email;
      payload.resume_url = existingApplication.resume_url;
      payload.cover_letter = existingApplication.cover_letter;
    }

    return payload;
  }

  // Admin: whitelist editable fields cleanly
  const payload = {};
  if (!isPartial || body.job_posting_id !== undefined || body.jobPostingId !== undefined) {
    const rj = body.job_posting_id !== undefined ? body.job_posting_id : body.jobPostingId;
    if (rj !== undefined) payload.job_posting_id = rj;
  }
  if (!isPartial || body.user_id !== undefined || body.userId !== undefined) {
    const ru = body.user_id !== undefined ? body.user_id : body.userId;
    if (ru !== undefined) payload.user_id = ru;
  }
  if (!isPartial || body.applicant_name !== undefined || body.applicantName !== undefined) {
    const rn = body.applicant_name !== undefined ? body.applicant_name : body.applicantName;
    if (rn !== undefined) {
      if (typeof rn !== 'string') {
        throw createValidationError('Applicant name must be a valid string.');
      }
      const trimmedName = rn.trim();
      if (isPartial && trimmedName === '') {
        throw createValidationError('Applicant name cannot be empty.');
      }
      payload.applicant_name = trimmedName;
    }
  }
  if (!isPartial || body.applicant_email !== undefined || body.applicantEmail !== undefined) {
    const re = body.applicant_email !== undefined ? body.applicant_email : body.applicantEmail;
    if (re !== undefined) {
      if (typeof re !== 'string') {
        throw createValidationError('Applicant email must be a valid string.');
      }
      const trimmedEmail = re.trim();
      if (isPartial && trimmedEmail === '') {
        throw createValidationError('Applicant email cannot be empty.');
      }
      payload.applicant_email = trimmedEmail;
    }
  }
  if (!isPartial || body.resume_url !== undefined || body.resumeUrl !== undefined) {
    const rr = body.resume_url !== undefined ? body.resume_url : body.resumeUrl;
    if (rr !== undefined) {
      if (rr === null) {
        payload.resume_url = null;
      } else if (typeof rr === 'string') {
        const trimmedResume = rr.trim();
        payload.resume_url = trimmedResume !== '' ? trimmedResume : null;
      } else {
        throw createValidationError('Resume URL must be a valid HTTP or HTTPS URL.');
      }
    }
  }
  if (!isPartial || body.cover_letter !== undefined || body.coverLetter !== undefined) {
    const rc = body.cover_letter !== undefined ? body.cover_letter : body.coverLetter;
    if (rc !== undefined) payload.cover_letter = rc !== null ? String(rc).trim() : null;
  }
  if (rawStatus !== undefined && rawStatus !== '') {
    payload.status = rawStatus;
  } else if (!isPartial) {
    payload.status = existingApplication.status || 'PENDING';
  }

  validateApplicantFields({
    applicantName: payload.applicant_name,
    applicantEmail: payload.applicant_email,
    resumeUrl: payload.resume_url,
    validateName: payload.applicant_name !== undefined,
    validateEmail: payload.applicant_email !== undefined,
    validateResume: payload.resume_url !== undefined
  });

  return payload;
}

module.exports = {
  MAX_FIELD_LENGTH,
  EMAIL_REGEX,
  isValidHttpUrl,
  isSelfApplication,
  getAppCsrfToken,
  isAdminUser,
  prefersJsonResponse,
  sendForbiddenResponse,
  getApplicationAccessContext,
  canViewJobApplications,
  buildWhitelistedCreatePayload,
  buildWhitelistedUpdatePayload
};
