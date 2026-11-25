const applicationModel = require('../models/applicationModel');
const jobPostingModel = require('../models/jobPostingModel');
const {
  isSelfApplication,
  isAdminUser,
  getApplicationAccessContext,
  canViewJobApplications,
  buildWhitelistedCreatePayload,
  buildWhitelistedUpdatePayload
} = require('./applicationHelpers');

/**
 * Controller: /api/applications REST API isteklerini ve iş mantığını yönetir (JSON, MySQL)
 */

/**
 * GET /api/applications
 * - Admin: returns all applications.
 * - Student / Alumni: returns only applications submitted to job postings owned by req.user.id.
 */
const getApplications = async (req, res) => {
  try {
    const nestedJobId = req && req.params && req.params.jobPostingId;
    if (nestedJobId) {
      return await getApplicationsByJobPosting(req, res);
    }
    const applications = isAdminUser(req && req.user)
      ? await applicationModel.getAllApplications()
      : await applicationModel.getApplicationsByJobOwnerId(req.user.id);
    return res.status(200).json(applications);
  } catch (error) {
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * GET /api/applications/:id
 * Accessible only to the application owner, owning job poster, or Admin.
 */
const getApplication = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Geçersiz veya eksik başvuru ID'si" });
    }

    const access = await getApplicationAccessContext(req, id);

    if (!access.application) {
      return res.status(404).json({ message: "Başvuru bulunamadı" });
    }

    if (!access.isAdmin && !access.isApplicantOwner && !access.isJobOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this application.'
      });
    }

    return res.status(200).json(access.application);
  } catch (error) {
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * POST /api/applications
 * Preserves guest submission (user_id = NULL) and binds req.user.id for authenticated callers.
 * Always forces status = 'PENDING' on creation.
 */
const createApplication = async (req, res) => {
  try {
    const payload = buildWhitelistedCreatePayload(req);

    if (!payload.job_posting_id || payload.job_posting_id <= 0 || !payload.applicant_name || !payload.applicant_email) {
      return res.status(400).json({
        message: "İş ilanı ID'si (job_posting_id), başvuran adı (applicant_name) ve e-posta (applicant_email) alanları zorunludur."
      });
    }

    const jobPosting = await jobPostingModel.getJobPostingById(payload.job_posting_id);
    if (!jobPosting) {
      return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
    }

    if (isSelfApplication(req && req.user, jobPosting)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Job posting owners cannot apply to their own job posting.'
      });
    }

    const newApplication = await applicationModel.createApplication(payload);
    return res.status(201).json(newApplication);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ message: error.message });
    }
    if (error && error.code === 'JOB_POSTING_NOT_FOUND') {
      return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
    }
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * PUT /api/applications/:id
 * Restricted to owning job poster or Admin.
 */
const updateApplication = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Geçersiz veya eksik başvuru ID'si" });
    }

    const access = await getApplicationAccessContext(req, id);
    if (!access.application) {
      return res.status(404).json({ message: "Başvuru bulunamadı" });
    }

    if (!access.isAdmin && !access.isJobOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the job posting owner or an administrator can update this application.'
      });
    }

    const updatePayload = buildWhitelistedUpdatePayload(req, access.application, {
      isAdmin: access.isAdmin,
      isPartial: false
    });

    if (access.isAdmin) {
      if (
        !updatePayload.job_posting_id ||
        applicationModel.idIsInvalid(updatePayload.job_posting_id) ||
        !updatePayload.applicant_name ||
        !updatePayload.applicant_email
      ) {
        return res.status(400).json({
          message: "İş ilanı ID'si (job_posting_id), başvuran adı (applicant_name) ve e-posta (applicant_email) alanları zorunludur."
        });
      }
      const jobPosting = await jobPostingModel.getJobPostingById(Number(updatePayload.job_posting_id));
      if (!jobPosting) {
        return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
      }
    }

    const updatedApplication = await applicationModel.updateApplication(id, updatePayload, false);

    if (!updatedApplication) {
      return res.status(404).json({ message: "Başvuru bulunamadı" });
    }

    return res.status(200).json(updatedApplication);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ message: error.message });
    }
    if (error && error.code === 'INVALID_STATUS') {
      return res.status(400).json({ message: error.message });
    }
    if (error && error.code === 'JOB_POSTING_NOT_FOUND') {
      return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
    }
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * PATCH /api/applications/:id
 * Restricted to owning job poster or Admin (applicants cannot approve/reject their own applications).
 */
const patchApplication = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Geçersiz veya eksik başvuru ID'si" });
    }

    const access = await getApplicationAccessContext(req, id);
    if (!access.application) {
      return res.status(404).json({ message: "Başvuru bulunamadı" });
    }

    if (!access.isAdmin && !access.isJobOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the job posting owner or an administrator can update application status.'
      });
    }

    const updatePayload = buildWhitelistedUpdatePayload(req, access.application, {
      isAdmin: access.isAdmin,
      isPartial: true
    });

    if (access.isAdmin && updatePayload.job_posting_id !== undefined) {
      const jobPosting = await jobPostingModel.getJobPostingById(Number(updatePayload.job_posting_id));
      if (!jobPosting) {
        return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
      }
    }

    const updatedApplication = await applicationModel.patchApplication(id, updatePayload);

    if (!updatedApplication) {
      return res.status(404).json({ message: "Başvuru bulunamadı" });
    }

    return res.status(200).json(updatedApplication);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ message: error.message });
    }
    if (error && error.code === 'INVALID_STATUS') {
      return res.status(400).json({ message: error.message });
    }
    if (error && error.code === 'JOB_POSTING_NOT_FOUND') {
      return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
    }
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * DELETE /api/applications/:id
 * Restricted to application owner or Admin.
 */
const deleteApplication = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Geçersiz veya eksik başvuru ID'si" });
    }

    const access = await getApplicationAccessContext(req, id);
    if (!access.application) {
      return res.status(404).json({ message: "Başvuru bulunamadı" });
    }

    if (!access.isAdmin && !access.isApplicantOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the application owner or an administrator can delete this application.'
      });
    }

    const isDeleted = await applicationModel.deleteApplication(id);
    if (!isDeleted) {
      return res.status(404).json({ message: "Başvuru bulunamadı" });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * GET /api/job-postings/:jobPostingId/applications
 * Restricted to owning job poster or Admin.
 */
const getApplicationsByJobPosting = async (req, res) => {
  try {
    const jobPostingId = req && req.params && req.params.jobPostingId;

    if (!jobPostingId || isNaN(Number(jobPostingId))) {
      return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
    }

    const targetJobId = Number(jobPostingId);
    const jobPosting = await jobPostingModel.getJobPostingById(targetJobId);
    if (!jobPosting) {
      return res.status(404).json({ message: "İş ilanı bulunamadı" });
    }

    if (!canViewJobApplications(req && req.user, jobPosting)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the job posting owner or an administrator can view applications for this job.'
      });
    }

    const applications = await applicationModel.getApplicationsByJobPostingId(targetJobId);
    return res.status(200).json(applications);
  } catch (error) {
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * POST /api/job-postings/:jobPostingId/applications
 * Preserves guest submission (user_id = NULL) and binds req.user.id for authenticated callers.
 * Always forces status = 'PENDING'.
 */
const createApplicationForJobPosting = async (req, res) => {
  try {
    const jobPostingId = req && req.params && req.params.jobPostingId;

    if (!jobPostingId || isNaN(Number(jobPostingId))) {
      return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
    }

    const targetJobId = Number(jobPostingId);
    const jobPosting = await jobPostingModel.getJobPostingById(targetJobId);
    if (!jobPosting) {
      return res.status(404).json({ message: "İş ilanı bulunamadı" });
    }

    if (isSelfApplication(req && req.user, jobPosting)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Job posting owners cannot apply to their own job posting.'
      });
    }

    const body = req && req.body;
    const rawBodyJobId = body && (body.job_posting_id !== undefined ? body.job_posting_id : body.jobPostingId);
    if (rawBodyJobId !== undefined && rawBodyJobId !== null && rawBodyJobId !== '' && !isNaN(Number(rawBodyJobId))) {
      if (Number(rawBodyJobId) !== targetJobId) {
        return res.status(400).json({
          message: "URL'deki iş ilanı ID'si ile istek gövdesindeki iş ilanı ID'si uyuşmuyor."
        });
      }
    }

    const payload = buildWhitelistedCreatePayload(req, targetJobId);

    if (!payload.applicant_name || !payload.applicant_email) {
      return res.status(400).json({
        message: "Başvuran adı (applicant_name) ve e-posta (applicant_email) alanları zorunludur."
      });
    }

    const newApplication = await applicationModel.createApplication(payload);
    return res.status(201).json(newApplication);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ message: error.message });
    }
    if (error && error.code === 'JOB_POSTING_NOT_FOUND') {
      return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
    }
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

module.exports = {
  getApplications,
  getAllApplications: getApplications,
  getApplication,
  getApplicationById: getApplication,
  createApplication,
  updateApplication,
  patchApplication,
  deleteApplication,
  getApplicationsByJobPosting,
  createApplicationForJobPosting
};
