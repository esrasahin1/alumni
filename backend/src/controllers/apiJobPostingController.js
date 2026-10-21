const jobPostingModel = require('../models/jobPostingModel');

/**
 * Controller: /api/job-postings REST API isteklerini ve iş mantığını yönetir (JSON, MySQL)
 */

/**
 * GET /api/job-postings
 * Tüm iş ilanlarını JSON listesi olarak döner.
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
 * ID'ye göre tek bir iş ilanını getirir (Bulunamazsa 404, geçersiz ID ise 400 döner).
 */
const getJobPosting = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
    }

    const jobPosting = await jobPostingModel.getJobPostingById(id);

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
 * Yeni bir iş ilanı oluşturur ve JSON döner (201 Created).
 */
const createJobPosting = async (req, res) => {
  try {
    const body = req && req.body;
    const title = body && body.title !== undefined ? String(body.title).trim() : '';
    const company = body && body.company !== undefined ? String(body.company).trim() : '';
    const description = body && body.description !== undefined ? String(body.description).trim() : '';

    if (!title || !company || !description) {
      return res.status(400).json({
        message: "Başlık (title), şirket (company) ve açıklama (description) alanları zorunludur."
      });
    }

    const newJobPosting = await jobPostingModel.createJobPosting(body);
    res.status(201).json(newJobPosting);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * PUT /api/job-postings/:id
 * Belirtilen ID'deki iş ilanının tüm bilgilerini günceller (ID korunur).
 */
const updateJobPosting = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
    }

    const body = req && req.body;
    const title = body && body.title !== undefined ? String(body.title).trim() : '';
    const company = body && body.company !== undefined ? String(body.company).trim() : '';
    const description = body && body.description !== undefined ? String(body.description).trim() : '';

    if (!title || !company || !description) {
      return res.status(400).json({
        message: "Başlık (title), şirket (company) ve açıklama (description) alanları zorunludur."
      });
    }

    const updatedJobPosting = await jobPostingModel.updateJobPosting(id, body);

    if (!updatedJobPosting) {
      return res.status(404).json({ message: "İş ilanı bulunamadı" });
    }

    res.status(200).json(updatedJobPosting);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * PATCH /api/job-postings/:id
 * Belirtilen ID'deki iş ilanının sadece gönderilen alanlarını kısmi olarak günceller.
 */
const patchJobPosting = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
    }

    const updatedJobPosting = await jobPostingModel.patchJobPosting(id, req && req.body);

    if (!updatedJobPosting) {
      return res.status(404).json({ message: "İş ilanı bulunamadı" });
    }

    res.status(200).json(updatedJobPosting);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * DELETE /api/job-postings/:id
 * Belirtilen ID'deki iş ilanını siler (204 No Content veya 404 Not Found döner).
 */
const deleteJobPosting = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
    }

    const isDeleted = await jobPostingModel.deleteJobPosting(id);

    if (!isDeleted) {
      return res.status(404).json({ message: "İş ilanı bulunamadı" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

module.exports = {
  getJobPostings,
  getAllJobPostings: getJobPostings,
  getJobPosting,
  getJobPostingById: getJobPosting,
  createJobPosting,
  updateJobPosting,
  patchJobPosting,
  deleteJobPosting
};
