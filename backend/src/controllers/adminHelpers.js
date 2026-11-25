const { getPool } = require('../config/db');
const {
  ALLOWED_ADMIN_USER_ROLES,
  ALLOWED_AUTH_ROLES,
  getUserAdminById
} = require('../models/userModel');
const { getJobPostingById } = require('../models/jobPostingModel');
const { ALLOWED_APPLICATION_STATUSES } = require('../models/applicationModel');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MAX_VARCHAR_LENGTH = 255;
const MAX_DEPARTMENT_LENGTH = 150;
const MAX_JOB_TITLE_LENGTH = 120;

const parsePositiveId = (rawId) => {
  if (rawId === undefined || rawId === null || rawId === '') {
    return null;
  }
  const num = Number(rawId);
  if (!Number.isInteger(num) || num <= 0) {
    return null;
  }
  return num;
};

const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

const getAdminDashboardCounts = async () => {
  const pool = await getPool();
  const [[userRow]] = await pool.query('SELECT COUNT(*) AS total FROM users');
  const [[adminRow]] = await pool.query("SELECT COUNT(*) AS total FROM users WHERE auth_role = 'admin'");
  const [[announcementRow]] = await pool.query('SELECT COUNT(*) AS total FROM announcements');
  const [[jobRow]] = await pool.query('SELECT COUNT(*) AS total FROM job_postings');
  const [[appRow]] = await pool.query('SELECT COUNT(*) AS total FROM applications');
  const [[pendingRow]] = await pool.query("SELECT COUNT(*) AS total FROM applications WHERE status = 'PENDING'");

  return {
    users: Number(userRow?.total || 0),
    admins: Number(adminRow?.total || 0),
    announcements: Number(announcementRow?.total || 0),
    jobPostings: Number(jobRow?.total || 0),
    applications: Number(appRow?.total || 0),
    pendingApplications: Number(pendingRow?.total || 0)
  };
};

const validateAdminUserPayload = (body = {}, { isCreate = false, partial = false } = {}) => {
  const errors = {};
  const values = {};

  if (!partial || body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    values.name = name;
    if (!name) {
      errors.name = 'Name is required.';
    } else if (name.length > MAX_VARCHAR_LENGTH) {
      errors.name = `Name must not exceed ${MAX_VARCHAR_LENGTH} characters.`;
    }
  }

  if (!partial || body.email !== undefined) {
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    values.email = email;
    if (!email) {
      errors.email = 'Email is required.';
    } else if (email.length > MAX_VARCHAR_LENGTH || !EMAIL_REGEX.test(email)) {
      errors.email = `Please enter a valid email address (max ${MAX_VARCHAR_LENGTH} characters).`;
    }
  }

  const rawPassword = typeof body.password === 'string' ? body.password : '';
  if (isCreate) {
    if (!rawPassword) {
      errors.password = 'Password is required.';
    } else if (rawPassword.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
    } else if (rawPassword.length > MAX_PASSWORD_LENGTH) {
      errors.password = `Password must not exceed ${MAX_PASSWORD_LENGTH} characters.`;
    }
  } else if (body.password !== undefined && rawPassword !== '') {
    if (rawPassword.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
    } else if (rawPassword.length > MAX_PASSWORD_LENGTH) {
      errors.password = `Password must not exceed ${MAX_PASSWORD_LENGTH} characters.`;
    }
  }

  if (!partial || body.role !== undefined) {
    const rawRole = body.role === null || body.role === undefined ? '' : String(body.role).trim().toLowerCase();
    values.role = rawRole;
    if (rawRole !== '' && !ALLOWED_ADMIN_USER_ROLES.includes(rawRole)) {
      errors.role = 'Role must be student, alumni, or empty.';
    }
  }

  if (!partial || body.auth_role !== undefined) {
    const defaultAuthRole = isCreate ? 'user' : undefined;
    const rawAuthRole =
      body.auth_role === undefined || body.auth_role === null || String(body.auth_role).trim() === ''
        ? defaultAuthRole
        : String(body.auth_role).trim().toLowerCase();

    if (rawAuthRole !== undefined) {
      values.auth_role = rawAuthRole;
      if (!ALLOWED_AUTH_ROLES.includes(rawAuthRole)) {
        errors.auth_role = 'auth_role must be user or admin.';
      }
    } else if (!partial) {
      errors.auth_role = 'auth_role must be user or admin.';
    }
  }

  if (!partial || body.department !== undefined) {
    const department =
      body.department === null || body.department === undefined ? '' : String(body.department).trim();
    values.department = department;
    if (department.length > MAX_DEPARTMENT_LENGTH) {
      errors.department = `Department must not exceed ${MAX_DEPARTMENT_LENGTH} characters.`;
    }
  }

  if (!partial || body.graduation_year !== undefined) {
    const rawGrad =
      body.graduation_year === null || body.graduation_year === undefined
        ? ''
        : String(body.graduation_year).trim();
    values.graduation_year = rawGrad;
    if (rawGrad !== '') {
      const parsed = Number(rawGrad);
      const maxYear = new Date().getFullYear() + 10;
      if (!Number.isInteger(parsed) || parsed < 1950 || parsed > maxYear) {
        errors.graduation_year = `Graduation year must be an integer between 1950 and ${maxYear}.`;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values,
    password: rawPassword || null
  };
};

const validateAnnouncementPayload = (body = {}, { partial = false } = {}) => {
  const errors = {};
  const values = {};

  if (!partial || body.title !== undefined) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    values.title = title;
    if (!title) {
      errors.title = 'Title is required.';
    } else if (title.length > MAX_VARCHAR_LENGTH) {
      errors.title = `Title must not exceed ${MAX_VARCHAR_LENGTH} characters.`;
    }
  }

  if (!partial || body.content !== undefined) {
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    values.content = content;
    if (!content) {
      errors.content = 'Content is required.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values
  };
};

const validateJobPostingPayload = async (body = {}, { partial = false } = {}) => {
  const errors = {};
  const values = {};

  if (!partial || body.title !== undefined) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    values.title = title;
    if (!title) {
      errors.title = 'Job title is required.';
    } else if (title.length > MAX_JOB_TITLE_LENGTH) {
      errors.title = `Job title must not exceed ${MAX_JOB_TITLE_LENGTH} characters.`;
    }
  }

  if (!partial || body.company !== undefined) {
    const company = typeof body.company === 'string' ? body.company.trim() : '';
    values.company = company;
    if (!company) {
      errors.company = 'Company is required.';
    } else if (company.length > MAX_VARCHAR_LENGTH) {
      errors.company = `Company must not exceed ${MAX_VARCHAR_LENGTH} characters.`;
    }
  }

  if (!partial || body.location !== undefined || body.city !== undefined) {
    const loc = body.location !== undefined ? body.location : body.city;
    const location = loc === undefined || loc === null ? '' : String(loc).trim();
    values.location = location;
    if (location.length > MAX_VARCHAR_LENGTH) {
      errors.location = `Location must not exceed ${MAX_VARCHAR_LENGTH} characters.`;
    }
  }

  if (!partial || body.contact_email !== undefined) {
    const contactEmail =
      body.contact_email === undefined || body.contact_email === null
        ? ''
        : String(body.contact_email).trim();
    values.contact_email = contactEmail;
    if (contactEmail !== '' && (contactEmail.length > MAX_VARCHAR_LENGTH || !EMAIL_REGEX.test(contactEmail))) {
      errors.contact_email = `Please enter a valid contact email (max ${MAX_VARCHAR_LENGTH} characters).`;
    }
  }

  if (!partial || body.description !== undefined) {
    values.description =
      body.description === undefined || body.description === null ? '' : String(body.description).trim();
  }

  if (!partial || body.user_id !== undefined) {
    const rawUserId =
      body.user_id === undefined || body.user_id === null ? '' : String(body.user_id).trim();
    values.user_id = rawUserId;
    if (rawUserId !== '') {
      const parsedUserId = parsePositiveId(rawUserId);
      if (!parsedUserId) {
        errors.user_id = 'user_id must be a positive integer or empty.';
      } else {
        const user = await getUserAdminById(parsedUserId);
        if (!user) {
          errors.user_id = `User #${parsedUserId} does not exist.`;
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values
  };
};

const validateApplicationPayload = async (body = {}, { partial = false } = {}) => {
  const errors = {};
  const values = {};

  if (!partial || body.job_posting_id !== undefined) {
    const rawJobId =
      body.job_posting_id === undefined || body.job_posting_id === null
        ? ''
        : String(body.job_posting_id).trim();
    values.job_posting_id = rawJobId;
    const parsedJobId = parsePositiveId(rawJobId);
    if (!parsedJobId) {
      errors.job_posting_id = 'A valid job posting is required.';
    } else {
      const job = await getJobPostingById(parsedJobId);
      if (!job) {
        errors.job_posting_id = `Job posting #${parsedJobId} does not exist.`;
      }
    }
  }

  if (!partial || body.user_id !== undefined) {
    const rawUserId =
      body.user_id === undefined || body.user_id === null ? '' : String(body.user_id).trim();
    values.user_id = rawUserId;
    if (rawUserId !== '') {
      const parsedUserId = parsePositiveId(rawUserId);
      if (!parsedUserId) {
        errors.user_id = 'user_id must be a positive integer or empty.';
      } else {
        const user = await getUserAdminById(parsedUserId);
        if (!user) {
          errors.user_id = `User #${parsedUserId} does not exist.`;
        }
      }
    }
  }

  if (!partial || body.applicant_name !== undefined) {
    const applicantName = typeof body.applicant_name === 'string' ? body.applicant_name.trim() : '';
    values.applicant_name = applicantName;
    if (!applicantName) {
      errors.applicant_name = 'Applicant name is required.';
    } else if (applicantName.length > MAX_VARCHAR_LENGTH) {
      errors.applicant_name = `Applicant name must not exceed ${MAX_VARCHAR_LENGTH} characters.`;
    }
  }

  if (!partial || body.applicant_email !== undefined) {
    const applicantEmail = typeof body.applicant_email === 'string' ? body.applicant_email.trim().toLowerCase() : '';
    values.applicant_email = applicantEmail;
    if (!applicantEmail) {
      errors.applicant_email = 'Applicant email is required.';
    } else if (applicantEmail.length > MAX_VARCHAR_LENGTH || !EMAIL_REGEX.test(applicantEmail)) {
      errors.applicant_email = `Please enter a valid applicant email (max ${MAX_VARCHAR_LENGTH} characters).`;
    }
  }

  if (!partial || body.status !== undefined) {
    const rawStatus =
      body.status === undefined || body.status === null || String(body.status).trim() === ''
        ? (partial ? undefined : 'PENDING')
        : String(body.status).trim().toUpperCase();
    if (rawStatus !== undefined) {
      values.status = rawStatus;
      if (!ALLOWED_APPLICATION_STATUSES.includes(rawStatus)) {
        errors.status = `Status must be one of: ${ALLOWED_APPLICATION_STATUSES.join(', ')}.`;
      }
    }
  }

  if (!partial || body.resume_url !== undefined) {
    const resumeUrl =
      body.resume_url === undefined || body.resume_url === null ? '' : String(body.resume_url).trim();
    values.resume_url = resumeUrl;
    if (resumeUrl !== '') {
      if (resumeUrl.length > MAX_VARCHAR_LENGTH) {
        errors.resume_url = `Resume URL must not exceed ${MAX_VARCHAR_LENGTH} characters.`;
      } else if (!isValidHttpUrl(resumeUrl)) {
        errors.resume_url = 'Resume URL must be a valid http:// or https:// URL.';
      }
    }
  }

  if (!partial || body.cover_letter !== undefined) {
    values.cover_letter =
      body.cover_letter === undefined || body.cover_letter === null ? '' : String(body.cover_letter).trim();
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values
  };
};

module.exports = {
  parsePositiveId,
  isValidHttpUrl,
  getAdminDashboardCounts,
  validateAdminUserPayload,
  validateAnnouncementPayload,
  validateJobPostingPayload,
  validateApplicationPayload
};
