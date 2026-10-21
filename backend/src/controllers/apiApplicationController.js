const applicationModel = require('../models/applicationModel');
const jobPostingModel = require('../models/jobPostingModel');

/**
 * Controller: /api/applications REST API isteklerini ve iş mantığını yönetir (JSON, MySQL)
 */

/**
 * GET /api/applications
 * Tüm başvuruları JSON listesi olarak döner.
 */
const getApplications = async (req, res) => {
  try {
    const nestedJobId = req && req.params && req.params.jobPostingId;
    if (nestedJobId) {
      return await getApplicationsByJobPosting(req, res);
    }
    const applications = await applicationModel.getAllApplications();
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * GET /api/applications/:id
 * ID'ye göre tek bir başvuruyu getirir (Bulunamazsa 404, geçersiz ID ise 400 döner).
 */
const getApplication = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Geçersiz veya eksik başvuru ID'si" });
    }

    const application = await applicationModel.getApplicationById(id);

    if (!application) {
      return res.status(404).json({ message: "Başvuru bulunamadı" });
    }

    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * POST /api/applications
 * Yeni bir başvuru oluşturur ve JSON döner (201 Created).
 */
const createApplication = async (req, res) => {
  try {
    const body = req && req.body;
    const rawJobId = body && (body.job_posting_id !== undefined ? body.job_posting_id : body.jobPostingId);
    const applicantName = body && (body.applicant_name !== undefined ? String(body.applicant_name).trim() : (body.applicantName !== undefined ? String(body.applicantName).trim() : ''));
    const applicantEmail = body && (body.applicant_email !== undefined ? String(body.applicant_email).trim() : (body.applicantEmail !== undefined ? String(body.applicantEmail).trim() : ''));

    if (!rawJobId || isNaN(Number(rawJobId)) || !applicantName || !applicantEmail) {
      return res.status(400).json({
        message: "İş ilanı ID'si (job_posting_id), başvuran adı (applicant_name) ve e-posta (applicant_email) alanları zorunludur."
      });
    }

    const targetJobId = Number(rawJobId);
    const jobPosting = await jobPostingModel.getJobPostingById(targetJobId);
    if (!jobPosting) {
      return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
    }

    const newApplication = await applicationModel.createApplication(body);
    res.status(201).json(newApplication);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * PUT /api/applications/:id
 * Belirtilen ID'deki başvurunun tüm bilgilerini günceller (ID korunur).
 */
const updateApplication = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Geçersiz veya eksik başvuru ID'si" });
    }

    const body = req && req.body;
    const rawJobId = body && (body.job_posting_id !== undefined ? body.job_posting_id : body.jobPostingId);
    const applicantName = body && (body.applicant_name !== undefined ? String(body.applicant_name).trim() : (body.applicantName !== undefined ? String(body.applicantName).trim() : ''));
    const applicantEmail = body && (body.applicant_email !== undefined ? String(body.applicant_email).trim() : (body.applicantEmail !== undefined ? String(body.applicantEmail).trim() : ''));

    if (!rawJobId || isNaN(Number(rawJobId)) || !applicantName || !applicantEmail) {
      return res.status(400).json({
        message: "İş ilanı ID'si (job_posting_id), başvuran adı (applicant_name) ve e-posta (applicant_email) alanları zorunludur."
      });
    }

    const targetJobId = Number(rawJobId);
    const jobPosting = await jobPostingModel.getJobPostingById(targetJobId);
    if (!jobPosting) {
      return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
    }

    const updatedApplication = await applicationModel.updateApplication(id, body);

    if (!updatedApplication) {
      return res.status(404).json({ message: "Başvuru bulunamadı" });
    }

    res.status(200).json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * PATCH /api/applications/:id
 * Belirtilen ID'deki başvurunun sadece gönderilen alanlarını kısmi olarak günceller.
 */
const patchApplication = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Geçersiz veya eksik başvuru ID'si" });
    }

    const body = req && req.body;
    const rawJobId = body && (body.job_posting_id !== undefined ? body.job_posting_id : body.jobPostingId);
    if (rawJobId !== undefined && rawJobId !== null && !isNaN(Number(rawJobId))) {
      const jobPosting = await jobPostingModel.getJobPostingById(Number(rawJobId));
      if (!jobPosting) {
        return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
      }
    }

    const updatedApplication = await applicationModel.patchApplication(id, body);

    if (!updatedApplication) {
      return res.status(404).json({ message: "Başvuru bulunamadı" });
    }

    res.status(200).json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * DELETE /api/applications/:id
 * Belirtilen ID'deki başvuruyu siler (204 No Content veya 404 Not Found döner).
 */
const deleteApplication = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Geçersiz veya eksik başvuru ID'si" });
    }

    const isDeleted = await applicationModel.deleteApplication(id);

    if (!isDeleted) {
      return res.status(404).json({ message: "Başvuru bulunamadı" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * GET /api/job-postings/:jobPostingId/applications
 * Belirli bir iş ilanına ait tüm başvuruları JSON listesi olarak döner.
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

    const applications = await applicationModel.getApplicationsByJobPostingId(targetJobId);
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * POST /api/job-postings/:jobPostingId/applications
 * Belirli bir iş ilanı altına yeni başvuru oluşturur.
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

    const body = req && req.body;
    // Çelişen job_posting_id kontrolü
    const rawBodyJobId = body && (body.job_posting_id !== undefined ? body.job_posting_id : body.jobPostingId);
    if (rawBodyJobId !== undefined && rawBodyJobId !== null && rawBodyJobId !== '' && !isNaN(Number(rawBodyJobId))) {
      if (Number(rawBodyJobId) !== targetJobId) {
        return res.status(400).json({
          message: "URL'deki iş ilanı ID'si ile istek gövdesindeki iş ilanı ID'si uyuşmuyor."
        });
      }
    }

    const applicantName = body && (body.applicant_name !== undefined ? String(body.applicant_name).trim() : (body.applicantName !== undefined ? String(body.applicantName).trim() : ''));
    const applicantEmail = body && (body.applicant_email !== undefined ? String(body.applicant_email).trim() : (body.applicantEmail !== undefined ? String(body.applicantEmail).trim() : ''));

    if (!applicantName || !applicantEmail) {
      return res.status(400).json({
        message: "Başvuran adı (applicant_name) ve e-posta (applicant_email) alanları zorunludur."
      });
    }

    const applicationPayload = {
      ...(body || {}),
      job_posting_id: targetJobId
    };

    const newApplication = await applicationModel.createApplication(applicationPayload);
    res.status(201).json(newApplication);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
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
