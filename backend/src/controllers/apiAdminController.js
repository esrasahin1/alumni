const userModel = require('../models/userModel');
const announcementModel = require('../models/announcementModel');
const jobPostingModel = require('../models/jobPostingModel');
const applicationModel = require('../models/applicationModel');
const { hashPassword } = require('../utils/passwordUtils');
const {
  parsePositiveId,
  getAdminDashboardCounts,
  validateAdminUserPayload,
  validateAnnouncementPayload,
  validateJobPostingPayload,
  validateApplicationPayload
} = require('./adminHelpers');

const getSummary = async (req, res, next) => {
  try {
    const counts = await getAdminDashboardCounts();
    return res.status(200).json({
      success: true,
      data: counts
    });
  } catch (error) {
    return next(error);
  }
};

// -------------------- USERS API --------------------

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userModel.getAllUsersAdmin();
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    return next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }
    const user = await userModel.getUserAdminById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { isValid, errors, values, password } = validateAdminUserPayload(req.body, { isCreate: true });
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors
      });
    }

    const passwordHash = await hashPassword(password);
    const created = await userModel.createUserAdmin({
      name: values.name,
      email: values.email,
      password_hash: passwordHash,
      role: values.role || null,
      auth_role: values.auth_role || 'user',
      department: values.department || null,
      graduation_year: values.graduation_year || null
    });

    return res.status(201).json({
      success: true,
      data: created
    });
  } catch (error) {
    if (error.code === 'SINGLE_ADMIN_EXISTS') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }
    const existing = await userModel.getUserAdminById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isPatch = req.method === 'PATCH';
    const { isValid, errors, values, password } = validateAdminUserPayload(req.body, {
      isCreate: false,
      partial: isPatch
    });
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors
      });
    }

    const updatePayload = {};
    if (values.name !== undefined) updatePayload.name = values.name;
    if (values.email !== undefined) updatePayload.email = values.email;
    if (values.role !== undefined) updatePayload.role = values.role || null;
    if (values.auth_role !== undefined) updatePayload.auth_role = values.auth_role;
    if (values.department !== undefined) updatePayload.department = values.department || null;
    if (values.graduation_year !== undefined) updatePayload.graduation_year = values.graduation_year || null;
    if (password) {
      updatePayload.password_hash = await hashPassword(password);
    }

    const updated = await userModel.updateUserAdmin(id, updatePayload);
    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    if (error.code === 'CANNOT_DEMOTE_LAST_ADMIN' || error.code === 'SINGLE_ADMIN_EXISTS') {
      return res.status(409).json({ success: false, message: error.message });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }
    const result = await userModel.deleteUserAdmin(id);
    if (!result.deleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
      detachedApplicationsCount: result.detachedApplicationsCount || 0
    });
  } catch (error) {
    if (error.code === 'CANNOT_DELETE_LAST_ADMIN') {
      return res.status(409).json({ success: false, message: error.message });
    }
    return next(error);
  }
};

// -------------------- ANNOUNCEMENTS API --------------------

const getAllAnnouncements = async (req, res, next) => {
  try {
    const announcements = await announcementModel.getAllAnnouncements();
    return res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    return next(error);
  }
};

const getAnnouncementById = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid announcement ID.' });
    }
    const announcement = await announcementModel.getAnnouncementById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }
    return res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    return next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { isValid, errors, values } = validateAnnouncementPayload(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }
    const created = await announcementModel.createAnnouncement(values);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return next(error);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid announcement ID.' });
    }
    const existing = await announcementModel.getAnnouncementById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }
    const isPatch = req.method === 'PATCH';
    const { isValid, errors, values } = validateAnnouncementPayload(req.body, { partial: isPatch });
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }
    const updated = isPatch
      ? await announcementModel.patchAnnouncement(id, values)
      : await announcementModel.updateAnnouncement(id, values);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid announcement ID.' });
    }
    const deleted = await announcementModel.deleteAnnouncement(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }
    return res.status(200).json({ success: true, message: 'Announcement deleted successfully.' });
  } catch (error) {
    return next(error);
  }
};

// -------------------- JOB POSTINGS API --------------------

const getAllJobPostings = async (req, res, next) => {
  try {
    const jobs = await jobPostingModel.getAllJobPostings();
    return res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    return next(error);
  }
};

const getJobPostingById = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid job posting ID.' });
    }
    const job = await jobPostingModel.getJobPostingById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }
    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    return next(error);
  }
};

const createJobPosting = async (req, res, next) => {
  try {
    const { isValid, errors, values } = await validateJobPostingPayload(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }
    const created = await jobPostingModel.createJobPosting({
      user_id: values.user_id ? Number(values.user_id) : null,
      title: values.title,
      company: values.company,
      location: values.location || null,
      description: values.description || null,
      contact_email: values.contact_email || null
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return next(error);
  }
};

const updateJobPosting = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid job posting ID.' });
    }
    const existing = await jobPostingModel.getJobPostingById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }
    const isPatch = req.method === 'PATCH';
    const { isValid, errors, values } = await validateJobPostingPayload(req.body, { partial: isPatch });
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }

    const payload = {};
    if (values.user_id !== undefined) payload.user_id = values.user_id ? Number(values.user_id) : null;
    if (values.title !== undefined) payload.title = values.title;
    if (values.company !== undefined) payload.company = values.company;
    if (values.location !== undefined) payload.location = values.location || null;
    if (values.description !== undefined) payload.description = values.description || null;
    if (values.contact_email !== undefined) payload.contact_email = values.contact_email || null;

    const updated = isPatch
      ? await jobPostingModel.patchJobPosting(id, payload)
      : await jobPostingModel.updateJobPosting(id, payload);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};

const deleteJobPosting = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid job posting ID.' });
    }
    const deleted = await jobPostingModel.deleteJobPosting(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }
    return res.status(200).json({ success: true, message: 'Job posting deleted successfully.' });
  } catch (error) {
    if (error.code === 'JOB_HAS_APPLICATIONS') {
      return res.status(409).json({ success: false, message: error.message });
    }
    return next(error);
  }
};

// -------------------- APPLICATIONS API --------------------

const getAllApplications = async (req, res, next) => {
  try {
    const apps = await applicationModel.getAllApplications();
    return res.status(200).json({ success: true, data: apps });
  } catch (error) {
    return next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid application ID.' });
    }
    const app = await applicationModel.getApplicationById(id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    return res.status(200).json({ success: true, data: app });
  } catch (error) {
    return next(error);
  }
};

const createApplication = async (req, res, next) => {
  try {
    const { isValid, errors, values } = await validateApplicationPayload(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }
    const created = await applicationModel.createApplication({
      job_posting_id: Number(values.job_posting_id),
      user_id: values.user_id ? Number(values.user_id) : null,
      applicant_name: values.applicant_name,
      applicant_email: values.applicant_email,
      resume_url: values.resume_url || null,
      cover_letter: values.cover_letter || null,
      status: values.status || 'PENDING'
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    if (error.code === 'JOB_POSTING_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }
    return next(error);
  }
};

const updateApplication = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid application ID.' });
    }
    const existing = await applicationModel.getApplicationById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    const isPatch = req.method === 'PATCH';
    const { isValid, errors, values } = await validateApplicationPayload(req.body, { partial: isPatch });
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }

    const payload = {};
    if (values.job_posting_id !== undefined) payload.job_posting_id = Number(values.job_posting_id);
    if (values.user_id !== undefined) payload.user_id = values.user_id ? Number(values.user_id) : null;
    if (values.applicant_name !== undefined) payload.applicant_name = values.applicant_name;
    if (values.applicant_email !== undefined) payload.applicant_email = values.applicant_email;
    if (values.resume_url !== undefined) payload.resume_url = values.resume_url || null;
    if (values.cover_letter !== undefined) payload.cover_letter = values.cover_letter || null;
    if (values.status !== undefined) payload.status = values.status;

    const updated = isPatch
      ? await applicationModel.patchApplication(id, payload)
      : await applicationModel.updateApplication(id, payload);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error.code === 'JOB_POSTING_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }
    return next(error);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid application ID.' });
    }
    const deleted = await applicationModel.deleteApplication(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    return res.status(200).json({ success: true, message: 'Application deleted successfully.' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getSummary,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAllJobPostings,
  getJobPostingById,
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication
};
