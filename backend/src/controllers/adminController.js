const userModel = require('../models/userModel');
const announcementModel = require('../models/announcementModel');
const jobPostingModel = require('../models/jobPostingModel');
const applicationModel = require('../models/applicationModel');
const { hashPassword } = require('../utils/passwordUtils');
const adminView = require('../views/adminView');
const {
  parsePositiveId,
  getAdminDashboardCounts,
  validateAdminUserPayload,
  validateAnnouncementPayload,
  validateJobPostingPayload,
  validateApplicationPayload
} = require('./adminHelpers');

const SUCCESS_MESSAGES = {
  user_created: 'User created successfully.',
  user_updated: 'User updated successfully.',
  user_deleted: 'User deleted successfully.',
  announcement_created: 'Announcement created successfully.',
  announcement_updated: 'Announcement updated successfully.',
  announcement_deleted: 'Announcement deleted successfully.',
  job_created: 'Job posting created successfully.',
  job_updated: 'Job posting updated successfully.',
  job_deleted: 'Job posting deleted successfully.',
  application_created: 'Application created successfully.',
  application_updated: 'Application updated successfully.',
  application_deleted: 'Application deleted successfully.'
};

const resolveSuccessMessage = (code) => SUCCESS_MESSAGES[String(code || '')] || '';

const sendAdminError = (req, res, statusCode, title, message, backHref, backLabel) => {
  return res.status(statusCode).type('html').send(
    adminView.renderAdminErrorPage({
      statusCode,
      title,
      message,
      backHref,
      backLabel,
      currentUser: req.user
    })
  );
};

const showDashboard = async (req, res, next) => {
  try {
    const counts = await getAdminDashboardCounts();
    return res.send(adminView.renderAdminDashboard({ counts, currentUser: req.user }));
  } catch (error) {
    return next(error);
  }
};

// -------------------- USERS --------------------

const listUsers = async (req, res, next) => {
  try {
    const users = await userModel.getAllUsersAdmin();
    return res.send(
      adminView.renderAdminUsersPage({
        users,
        successMessage: resolveSuccessMessage(req.query.success),
        currentUser: req.user,
        csrfToken: req.adminCsrfToken || ''
      })
    );
  } catch (error) {
    return next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { isValid, errors, values, password } = validateAdminUserPayload(req.body, { isCreate: true });
    if (!isValid) {
      const users = await userModel.getAllUsersAdmin();
      return res.status(400).send(
        adminView.renderAdminUsersPage({
          users,
          values,
          errors,
          errorMessage: 'Please correct the highlighted user fields.',
          currentUser: req.user,
          csrfToken: req.adminCsrfToken || ''
        })
      );
    }

    const passwordHash = await hashPassword(password);
    await userModel.createUserAdmin({
      name: values.name,
      email: values.email,
      password_hash: passwordHash,
      role: values.role || null,
      auth_role: values.auth_role || 'user',
      department: values.department || null,
      graduation_year: values.graduation_year || null
    });

    return res.redirect('/admin/users?success=user_created');
  } catch (error) {
    if (error.code === 'SINGLE_ADMIN_EXISTS') {
      const users = await userModel.getAllUsersAdmin();
      return res.status(409).send(
        adminView.renderAdminUsersPage({
          users,
          values: { ...req.body, password: '' },
          errors: { auth_role: error.message },
          errorMessage: error.message,
          currentUser: req.user,
          csrfToken: req.adminCsrfToken || ''
        })
      );
    }
    if (error.code === 'ER_DUP_ENTRY') {
      const users = await userModel.getAllUsersAdmin();
      return res.status(409).send(
        adminView.renderAdminUsersPage({
          users,
          values: { ...req.body, password: '' },
          errors: { email: 'An account with this email already exists.' },
          errorMessage: 'Email already exists.',
          currentUser: req.user,
          csrfToken: req.adminCsrfToken || ''
        })
      );
    }
    return next(error);
  }
};

const showEditUser = async (req, res, next) => {
  try {
    const userId = parsePositiveId(req.params.id);
    if (!userId) {
      return sendAdminError(req, res, 400, 'Invalid User ID', 'The supplied user ID must be a positive integer.', '/admin/users', 'Back to Users');
    }
    const user = await userModel.getUserAdminById(userId);
    if (!user) {
      return sendAdminError(req, res, 404, 'User Not Found', `User #${userId} does not exist.`, '/admin/users', 'Back to Users');
    }
    const dependencies = await userModel.getUserDependencies(userId);
    return res.send(
      adminView.renderAdminUserEditPage({
        user,
        dependencies,
        currentUser: req.user,
        csrfToken: req.adminCsrfToken || ''
      })
    );
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const userId = parsePositiveId(req.params.id);
    if (!userId) {
      return sendAdminError(req, res, 400, 'Invalid User ID', 'The supplied user ID must be a positive integer.', '/admin/users', 'Back to Users');
    }
    const existing = await userModel.getUserAdminById(userId);
    if (!existing) {
      return sendAdminError(req, res, 404, 'User Not Found', `User #${userId} does not exist.`, '/admin/users', 'Back to Users');
    }

    const { isValid, errors, values, password } = validateAdminUserPayload(req.body, { isCreate: false });
    if (!isValid) {
      const dependencies = await userModel.getUserDependencies(userId);
      return res.status(400).send(
        adminView.renderAdminUserEditPage({
          user: existing,
          dependencies,
          values,
          errors,
          errorMessage: 'Please correct the highlighted fields.',
          currentUser: req.user,
          csrfToken: req.adminCsrfToken || ''
        })
      );
    }

    const updatePayload = {
      name: values.name,
      email: values.email,
      role: values.role || null,
      auth_role: values.auth_role,
      department: values.department || null,
      graduation_year: values.graduation_year || null
    };
    if (password) {
      updatePayload.password_hash = await hashPassword(password);
    }

    await userModel.updateUserAdmin(userId, updatePayload);
    return res.redirect('/admin/users?success=user_updated');
  } catch (error) {
    const userId = parsePositiveId(req.params.id);
    if (error.code === 'CANNOT_DEMOTE_LAST_ADMIN' || error.code === 'SINGLE_ADMIN_EXISTS') {
      const existing = await userModel.getUserAdminById(userId);
      const dependencies = await userModel.getUserDependencies(userId);
      return res.status(409).send(
        adminView.renderAdminUserEditPage({
          user: existing,
          dependencies,
          values: { ...req.body, password: '' },
          errors: { auth_role: error.message },
          errorMessage: error.message,
          currentUser: req.user,
          csrfToken: req.adminCsrfToken || ''
        })
      );
    }
    if (error.code === 'ER_DUP_ENTRY') {
      const existing = await userModel.getUserAdminById(userId);
      const dependencies = await userModel.getUserDependencies(userId);
      return res.status(409).send(
        adminView.renderAdminUserEditPage({
          user: existing,
          dependencies,
          values: { ...req.body, password: '' },
          errors: { email: 'An account with this email already exists.' },
          errorMessage: 'Email already exists.',
          currentUser: req.user,
          csrfToken: req.adminCsrfToken || ''
        })
      );
    }
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = parsePositiveId(req.params.id);
    if (!userId) {
      return sendAdminError(req, res, 400, 'Invalid User ID', 'The supplied user ID must be a positive integer.', '/admin/users', 'Back to Users');
    }

    const result = await userModel.deleteUserAdmin(userId);
    if (!result.deleted) {
      return sendAdminError(req, res, 404, 'User Not Found', `User #${userId} does not exist.`, '/admin/users', 'Back to Users');
    }
    return res.redirect('/admin/users?success=user_deleted');
  } catch (error) {
    if (error.code === 'CANNOT_DELETE_LAST_ADMIN') {
      const users = await userModel.getAllUsersAdmin();
      return res.status(409).send(
        adminView.renderAdminUsersPage({
          users,
          errorMessage: error.message,
          currentUser: req.user,
          csrfToken: req.adminCsrfToken || ''
        })
      );
    }
    return next(error);
  }
};

// -------------------- ANNOUNCEMENTS --------------------

const listAnnouncements = async (req, res, next) => {
  try {
    const announcements = await announcementModel.getAllAnnouncements();
    return res.send(
      adminView.renderAdminAnnouncementsPage({
        announcements,
        successMessage: resolveSuccessMessage(req.query.success),
        currentUser: req.user,
        csrfToken: req.adminCsrfToken || ''
      })
    );
  } catch (error) {
    return next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { isValid, errors, values } = validateAnnouncementPayload(req.body);
    if (!isValid) {
      const announcements = await announcementModel.getAllAnnouncements();
      return res.status(400).send(
        adminView.renderAdminAnnouncementsPage({
          announcements,
          values,
          errors,
          errorMessage: 'Please correct the announcement fields.',
          currentUser: req.user,
          csrfToken: req.adminCsrfToken || ''
        })
      );
    }

    await announcementModel.createAnnouncement(values);
    return res.redirect('/admin/announcements?success=announcement_created');
  } catch (error) {
    return next(error);
  }
};

const showEditAnnouncement = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return sendAdminError(req, res, 400, 'Invalid Announcement ID', 'The supplied announcement ID must be a positive integer.', '/admin/announcements', 'Back to Announcements');
    }
    const announcement = await announcementModel.getAnnouncementById(id);
    if (!announcement) {
      return sendAdminError(req, res, 404, 'Announcement Not Found', `Announcement #${id} does not exist.`, '/admin/announcements', 'Back to Announcements');
    }
    return res.send(
      adminView.renderAdminAnnouncementEditPage({
        announcement,
        currentUser: req.user,
        csrfToken: req.adminCsrfToken || ''
      })
    );
  } catch (error) {
    return next(error);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return sendAdminError(req, res, 400, 'Invalid Announcement ID', 'The supplied announcement ID must be a positive integer.', '/admin/announcements', 'Back to Announcements');
    }
    const existing = await announcementModel.getAnnouncementById(id);
    if (!existing) {
      return sendAdminError(req, res, 404, 'Announcement Not Found', `Announcement #${id} does not exist.`, '/admin/announcements', 'Back to Announcements');
    }

    const { isValid, errors, values } = validateAnnouncementPayload(req.body);
    if (!isValid) {
      return res.status(400).send(
        adminView.renderAdminAnnouncementEditPage({
          announcement: existing,
          values,
          errors,
          errorMessage: 'Please correct the announcement fields.',
          currentUser: req.user,
          csrfToken: req.adminCsrfToken || ''
        })
      );
    }

    await announcementModel.updateAnnouncement(id, values);
    return res.redirect('/admin/announcements?success=announcement_updated');
  } catch (error) {
    return next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return sendAdminError(req, res, 400, 'Invalid Announcement ID', 'The supplied announcement ID must be a positive integer.', '/admin/announcements', 'Back to Announcements');
    }
    const deleted = await announcementModel.deleteAnnouncement(id);
    if (!deleted) {
      return sendAdminError(req, res, 404, 'Announcement Not Found', `Announcement #${id} does not exist.`, '/admin/announcements', 'Back to Announcements');
    }
    return res.redirect('/admin/announcements?success=announcement_deleted');
  } catch (error) {
    return next(error);
  }
};

// -------------------- JOB POSTINGS --------------------

const listJobPostings = async (req, res, next) => {
  try {
    const [jobPostings, users] = await Promise.all([
      jobPostingModel.getAllJobPostings(),
      userModel.getAllUsersAdmin()
    ]);
    return res.send(
      adminView.renderAdminJobPostingsPage({
        jobPostings,
        users,
        successMessage: resolveSuccessMessage(req.query.success),
        currentUser: req.user,
        csrfToken: req.adminCsrfToken || ''
      })
    );
  } catch (error) {
    return next(error);
  }
};

const createJobPosting = async (req, res, next) => {
  try {
    const { isValid, errors, values } = await validateJobPostingPayload(req.body);
    if (!isValid) {
      const [jobPostings, users] = await Promise.all([
        jobPostingModel.getAllJobPostings(),
        userModel.getAllUsersAdmin()
      ]);
      return res.status(400).send(
        adminView.renderAdminJobPostingsPage({
          jobPostings,
          users,
          values,
          errors,
          errorMessage: 'Please correct the job posting fields.',
          currentUser: req.user,
          csrfToken: req.adminCsrfToken || ''
        })
      );
    }

    await jobPostingModel.createJobPosting({
      user_id: values.user_id ? Number(values.user_id) : null,
      title: values.title,
      company: values.company,
      location: values.location || null,
      description: values.description || null,
      contact_email: values.contact_email || null
    });

    return res.redirect('/admin/job-postings?success=job_created');
  } catch (error) {
    return next(error);
  }
};

const showEditJobPosting = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return sendAdminError(req, res, 400, 'Invalid Job Posting ID', 'The supplied job posting ID must be a positive integer.', '/admin/job-postings', 'Back to Job Postings');
    }
    const jobPosting = await jobPostingModel.getJobPostingById(id);
    if (!jobPosting) {
      return sendAdminError(req, res, 404, 'Job Posting Not Found', `Job posting #${id} does not exist.`, '/admin/job-postings', 'Back to Job Postings');
    }
    const [users, applicationsCount] = await Promise.all([
      userModel.getAllUsersAdmin(),
      applicationModel.countApplicationsByJobPostingId(id)
    ]);
    return res.send(
      adminView.renderAdminJobPostingEditPage({
        jobPosting,
        users,
        applicationsCount,
        currentUser: req.user,
        csrfToken: req.adminCsrfToken || ''
      })
    );
  } catch (error) {
    return next(error);
  }
};

const updateJobPosting = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return sendAdminError(req, res, 400, 'Invalid Job Posting ID', 'The supplied job posting ID must be a positive integer.', '/admin/job-postings', 'Back to Job Postings');
    }
    const existing = await jobPostingModel.getJobPostingById(id);
    if (!existing) {
      return sendAdminError(req, res, 404, 'Job Posting Not Found', `Job posting #${id} does not exist.`, '/admin/job-postings', 'Back to Job Postings');
    }

    const { isValid, errors, values } = await validateJobPostingPayload(req.body);
    if (!isValid) {
      const [users, applicationsCount] = await Promise.all([
        userModel.getAllUsersAdmin(),
        applicationModel.countApplicationsByJobPostingId(id)
      ]);
      return res.status(400).send(
        adminView.renderAdminJobPostingEditPage({
          jobPosting: existing,
          users,
          applicationsCount,
          values,
          errors,
          errorMessage: 'Please correct the job posting fields.',
          currentUser: req.user,
          csrfToken: req.adminCsrfToken || ''
        })
      );
    }

    await jobPostingModel.updateJobPosting(id, {
      user_id: values.user_id ? Number(values.user_id) : null,
      title: values.title,
      company: values.company,
      location: values.location || null,
      description: values.description || null,
      contact_email: values.contact_email || null
    });

    return res.redirect('/admin/job-postings?success=job_updated');
  } catch (error) {
    return next(error);
  }
};

const deleteJobPosting = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return sendAdminError(req, res, 400, 'Invalid Job Posting ID', 'The supplied job posting ID must be a positive integer.', '/admin/job-postings', 'Back to Job Postings');
    }
    const deleted = await jobPostingModel.deleteJobPosting(id);
    if (!deleted) {
      return sendAdminError(req, res, 404, 'Job Posting Not Found', `Job posting #${id} does not exist.`, '/admin/job-postings', 'Back to Job Postings');
    }
    return res.redirect('/admin/job-postings?success=job_deleted');
  } catch (error) {
    if (error.code === 'JOB_HAS_APPLICATIONS') {
      const [jobPostings, users] = await Promise.all([
        jobPostingModel.getAllJobPostings(),
        userModel.getAllUsersAdmin()
      ]);
      return res.status(409).send(
        adminView.renderAdminJobPostingsPage({
          jobPostings,
          users,
          errorMessage: error.message,
          currentUser: req.user,
          csrfToken: req.adminCsrfToken || ''
        })
      );
    }
    return next(error);
  }
};

// -------------------- APPLICATIONS --------------------

const listApplications = async (req, res, next) => {
  try {
    const [applications, jobPostings, users] = await Promise.all([
      applicationModel.getAllApplicationsWithJobDetails(),
      jobPostingModel.getAllJobPostings(),
      userModel.getAllUsersAdmin()
    ]);
    return res.send(
      adminView.renderAdminApplicationsPage({
        applications,
        jobPostings,
        users,
        successMessage: resolveSuccessMessage(req.query.success),
        currentUser: req.user,
        csrfToken: req.adminCsrfToken || ''
      })
    );
  } catch (error) {
    return next(error);
  }
};

const createApplication = async (req, res, next) => {
  try {
    const { isValid, errors, values } = await validateApplicationPayload(req.body);
    if (!isValid) {
      const [applications, jobPostings, users] = await Promise.all([
        applicationModel.getAllApplicationsWithJobDetails(),
        jobPostingModel.getAllJobPostings(),
        userModel.getAllUsersAdmin()
      ]);
      return res.status(400).send(
        adminView.renderAdminApplicationsPage({
          applications,
          jobPostings,
          users,
          values,
          errors,
          errorMessage: 'Please correct the application fields.',
          currentUser: req.user,
          csrfToken: req.adminCsrfToken || ''
        })
      );
    }

    await applicationModel.createApplication({
      job_posting_id: Number(values.job_posting_id),
      user_id: values.user_id ? Number(values.user_id) : null,
      applicant_name: values.applicant_name,
      applicant_email: values.applicant_email,
      resume_url: values.resume_url || null,
      cover_letter: values.cover_letter || null,
      status: values.status || 'PENDING'
    });

    return res.redirect('/admin/applications?success=application_created');
  } catch (error) {
    if (error.code === 'JOB_POSTING_NOT_FOUND') {
      const [applications, jobPostings, users] = await Promise.all([
        applicationModel.getAllApplicationsWithJobDetails(),
        jobPostingModel.getAllJobPostings(),
        userModel.getAllUsersAdmin()
      ]);
      return res.status(404).send(
        adminView.renderAdminApplicationsPage({
          applications,
          jobPostings,
          users,
          values: req.body || {},
          errors: { job_posting_id: 'Selected job posting no longer exists.' },
          errorMessage: 'Selected job posting no longer exists.',
          currentUser: req.user,
          csrfToken: req.adminCsrfToken || ''
        })
      );
    }
    return next(error);
  }
};

const showEditApplication = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return sendAdminError(req, res, 400, 'Invalid Application ID', 'The supplied application ID must be a positive integer.', '/admin/applications', 'Back to Applications');
    }
    const application = await applicationModel.getApplicationById(id);
    if (!application) {
      return sendAdminError(req, res, 404, 'Application Not Found', `Application #${id} does not exist.`, '/admin/applications', 'Back to Applications');
    }
    const [jobPostings, users] = await Promise.all([
      jobPostingModel.getAllJobPostings(),
      userModel.getAllUsersAdmin()
    ]);
    return res.send(
      adminView.renderAdminApplicationEditPage({
        application,
        jobPostings,
        users,
        currentUser: req.user,
        csrfToken: req.adminCsrfToken || ''
      })
    );
  } catch (error) {
    return next(error);
  }
};

const updateApplication = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return sendAdminError(req, res, 400, 'Invalid Application ID', 'The supplied application ID must be a positive integer.', '/admin/applications', 'Back to Applications');
    }
    const existing = await applicationModel.getApplicationById(id);
    if (!existing) {
      return sendAdminError(req, res, 404, 'Application Not Found', `Application #${id} does not exist.`, '/admin/applications', 'Back to Applications');
    }

    const { isValid, errors, values } = await validateApplicationPayload(req.body);
    if (!isValid) {
      const [jobPostings, users] = await Promise.all([
        jobPostingModel.getAllJobPostings(),
        userModel.getAllUsersAdmin()
      ]);
      return res.status(400).send(
        adminView.renderAdminApplicationEditPage({
          application: existing,
          jobPostings,
          users,
          values,
          errors,
          errorMessage: 'Please correct the application fields.',
          currentUser: req.user,
          csrfToken: req.adminCsrfToken || ''
        })
      );
    }

    await applicationModel.updateApplication(id, {
      job_posting_id: Number(values.job_posting_id),
      user_id: values.user_id ? Number(values.user_id) : null,
      applicant_name: values.applicant_name,
      applicant_email: values.applicant_email,
      resume_url: values.resume_url || null,
      cover_letter: values.cover_letter || null,
      status: values.status
    });

    return res.redirect('/admin/applications?success=application_updated');
  } catch (error) {
    if (error.code === 'JOB_POSTING_NOT_FOUND') {
      const id = parsePositiveId(req.params.id);
      const [existing, jobPostings, users] = await Promise.all([
        applicationModel.getApplicationById(id),
        jobPostingModel.getAllJobPostings(),
        userModel.getAllUsersAdmin()
      ]);
      return res.status(404).send(
        adminView.renderAdminApplicationEditPage({
          application: existing,
          jobPostings,
          users,
          values: req.body || {},
          errors: { job_posting_id: 'Selected job posting no longer exists.' },
          errorMessage: 'Selected job posting no longer exists.',
          currentUser: req.user,
          csrfToken: req.adminCsrfToken || ''
        })
      );
    }
    return next(error);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return sendAdminError(req, res, 400, 'Invalid Application ID', 'The supplied application ID must be a positive integer.', '/admin/applications', 'Back to Applications');
    }
    const deleted = await applicationModel.deleteApplication(id);
    if (!deleted) {
      return sendAdminError(req, res, 404, 'Application Not Found', `Application #${id} does not exist.`, '/admin/applications', 'Back to Applications');
    }
    return res.redirect('/admin/applications?success=application_deleted');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  showDashboard,
  listUsers,
  createUser,
  showEditUser,
  updateUser,
  deleteUser,
  listAnnouncements,
  createAnnouncement,
  showEditAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  listJobPostings,
  createJobPosting,
  showEditJobPosting,
  updateJobPosting,
  deleteJobPosting,
  listApplications,
  createApplication,
  showEditApplication,
  updateApplication,
  deleteApplication
};
