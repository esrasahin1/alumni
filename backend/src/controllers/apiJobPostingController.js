const jobPostingModel = require('../models/jobPostingModel');
const { buildAndValidateJobPostingPayload } = require('./jobPostingHelpers');
const {
  parsePositiveIntegerId,
  isAdminUser,
  isSelfUser
} = require('./accessHelpers');

function canManageJobPosting(user, jobPosting) {
  if (!user || !jobPosting) {
    return false;
  }
  if (isAdminUser(user)) {
    return true;
  }
  return jobPosting.user_id !== null && jobPosting.user_id !== undefined && isSelfUser(user, jobPosting.user_id);
}

/**
 * Controller: /api/job-postings REST API isteklerini ve iş mantığını yönetir (JSON, MySQL)
 */

/**
 * GET /api/job-postings
 * Publicly lists all job postings.
 */
const getJobPostings = async (req, res) => {
  try {
    const jobPostings = await jobPostingModel.getAllJobPostings();
    res.status(200).json(jobPostings);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * GET /api/job-postings/:id
 * Publicly returns a single job posting.
 */
const getJobPosting = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;
    const jobId = parsePositiveIntegerId(id);

    if (jobId === null) {
      return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
    }

    const jobPosting = await jobPostingModel.getJobPostingById(jobId);

    if (!jobPosting) {
      return res.status(404).json({ message: "İş ilanı bulunamadı" });
    }

    res.status(200).json(jobPosting);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * POST /api/job-postings
 * Forces user_id = req.user.id for non-admin creators to prevent spoofing.
 */
const createJobPosting = async (req, res) => {
  try {
    const jobPayload = buildAndValidateJobPostingPayload(req, {
      isPartial: false,
      existingJobPosting: null,
      isAdmin: isAdminUser(req && req.user)
    });

    const newJobPosting = await jobPostingModel.createJobPosting(jobPayload);
    res.status(201).json(newJobPosting);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ message: error.message });
    }
    if (error && (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452)) {
      return res.status(400).json({ message: "Belirtilen kullanıcı (user_id) bulunamadı." });
    }
    if (error && error.code === 'TITLE_TOO_LONG') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * PUT /api/job-postings/:id (Owner or Admin Only)
 */
const updateJobPosting = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;
    const jobId = parsePositiveIntegerId(id);

    if (jobId === null) {
      return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
    }

    const existingJobPosting = await jobPostingModel.getJobPostingById(jobId);
    if (!existingJobPosting) {
      return res.status(404).json({ message: "İş ilanı bulunamadı" });
    }

    if (!canManageJobPosting(req && req.user, existingJobPosting)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the job posting owner or an administrator can edit this job posting.'
      });
    }

    const updatePayload = buildAndValidateJobPostingPayload(req, {
      isPartial: false,
      existingJobPosting,
      isAdmin: isAdminUser(req && req.user)
    });

    const updatedJobPosting = await jobPostingModel.updateJobPosting(jobId, updatePayload);

    if (!updatedJobPosting) {
      return res.status(404).json({ message: "İş ilanı bulunamadı" });
    }

    res.status(200).json(updatedJobPosting);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ message: error.message });
    }
    if (error && (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452)) {
      return res.status(400).json({ message: "Belirtilen kullanıcı (user_id) bulunamadı." });
    }
    if (error && error.code === 'TITLE_TOO_LONG') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * PATCH /api/job-postings/:id (Owner or Admin Only)
 */
const patchJobPosting = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;
    const jobId = parsePositiveIntegerId(id);

    if (jobId === null) {
      return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
    }

    const existingJobPosting = await jobPostingModel.getJobPostingById(jobId);
    if (!existingJobPosting) {
      return res.status(404).json({ message: "İş ilanı bulunamadı" });
    }

    if (!canManageJobPosting(req && req.user, existingJobPosting)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the job posting owner or an administrator can edit this job posting.'
      });
    }

    const patchPayload = buildAndValidateJobPostingPayload(req, {
      isPartial: true,
      existingJobPosting,
      isAdmin: isAdminUser(req && req.user)
    });

    const updatedJobPosting = await jobPostingModel.patchJobPosting(jobId, patchPayload);

    if (!updatedJobPosting) {
      return res.status(404).json({ message: "İş ilanı bulunamadı" });
    }

    res.status(200).json(updatedJobPosting);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ message: error.message });
    }
    if (error && (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452)) {
      return res.status(400).json({ message: "Belirtilen kullanıcı (user_id) bulunamadı." });
    }
    if (error && error.code === 'TITLE_TOO_LONG') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * DELETE /api/job-postings/:id (Owner or Admin Only)
 */
const deleteJobPosting = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;
    const jobId = parsePositiveIntegerId(id);

    if (jobId === null) {
      return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
    }

    const existingJobPosting = await jobPostingModel.getJobPostingById(jobId);
    if (!existingJobPosting) {
      return res.status(404).json({ message: "İş ilanı bulunamadı" });
    }

    if (!canManageJobPosting(req && req.user, existingJobPosting)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the job posting owner or an administrator can delete this job posting.'
      });
    }

    const isDeleted = await jobPostingModel.deleteJobPosting(jobId);

    if (!isDeleted) {
      return res.status(404).json({ message: "İş ilanı bulunamadı" });
    }

    res.status(204).send();
  } catch (error) {
    if (error && error.code === 'JOB_HAS_APPLICATIONS') {
      return res.status(409).json({ success: false, message: error.message });
    }
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * GET /api/users/:id/jobs (Strictly Self or Admin)
 */
const getUserJobs = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;
    const targetUserId = parsePositiveIntegerId(id);

    if (targetUserId === null) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    if (!isAdminUser(req && req.user) && !isSelfUser(req && req.user, targetUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view your own job postings.'
      });
    }

    const jobPostings = await jobPostingModel.getJobPostingsByUserId(targetUserId);

    if (jobPostings === null) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    return res.status(200).json(jobPostings);
  } catch (error) {
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

module.exports = {
  getJobPostings,
  getAllJobPostings: getJobPostings,
  getJobPosting,
  getJobPostingById: getJobPosting,
  getUserJobs,
  getJobPostingsByUser: getUserJobs,
  createJobPosting,
  updateJobPosting,
  patchJobPosting,
  deleteJobPosting
};
