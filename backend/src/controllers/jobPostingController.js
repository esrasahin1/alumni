const jobPostingModel = require('../models/jobPostingModel');
const { getAppCsrfToken } = require('./applicationHelpers');
const { getJobPostingCsrfToken } = require('../middlewares/mvcCsrfFactory');
const { buildAndValidateJobPostingPayload } = require('./jobPostingHelpers');
const {
  escapeHtml,
  parsePositiveIntegerId,
  isAdminUser,
  isSelfUser,
  prefersJsonResponse,
  sendForbiddenResponse,
  sendBadRequestResponse
} = require('./accessHelpers');

/**
 * Job Posting View modülünü dinamik ve güvenli bir şekilde yükler.
 * View katmanı henüz oluşturulmamışsa null döner, hata fırlatmaz.
 */
const getJobPostingView = () => {
  try {
    return require('../views/jobPostingView');
  } catch (error) {
    return null;
  }
};

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
 * GET /job-postings (İş İlanları Listesi - HTML / View Layer)
 * Publicly viewable; edit/delete controls are shown only to owner or Admin.
 */
const getJobPostings = async (req, res) => {
  try {
    const jobPostings = await jobPostingModel.getAllJobPostings();

    if (prefersJsonResponse(req)) {
      return res.status(200).json(jobPostings);
    }

    const view = getJobPostingView();
    if (view && typeof view.renderJobPostingsPage === 'function') {
      const html = view.renderJobPostingsPage(jobPostings, req && req.user ? req.user : null, {
        csrfToken: getJobPostingCsrfToken(req, res)
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanları - Alumni Tracking System</title></head><body><h1>İş İlanları</h1><pre>${escapeHtml(JSON.stringify(jobPostings, null, 2))}</pre></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * GET /job-postings/:id (İş İlanı Detayı - HTML / View Layer)
 */
const getJobPosting = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (parsePositiveIntegerId(id) === null) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(400).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik iş ilanı ID'si</h1></body></html>`);
    }

    const jobPosting = await jobPostingModel.getJobPostingById(id);

    if (!jobPosting) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "İş ilanı bulunamadı" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Bulunamadı</title></head><body><h1>İş ilanı bulunamadı</h1></body></html>`);
    }

    if (prefersJsonResponse(req)) {
      return res.status(200).json(jobPosting);
    }

    const view = getJobPostingView();
    if (view && typeof view.renderJobPostingDetailPage === 'function') {
      const html = view.renderJobPostingDetailPage(jobPosting, req && req.user ? req.user : null, {
        csrfToken: getAppCsrfToken(req, res),
        jobPostingCsrfToken: getJobPostingCsrfToken(req, res)
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>${escapeHtml(jobPosting.title || 'İş İlanı Detayı')}</title></head><body><h1>${escapeHtml(jobPosting.title)}</h1><h2>${escapeHtml(jobPosting.company)}</h2><p>${escapeHtml(jobPosting.description)}</p></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * POST /job-postings (Yeni İş İlanı Oluşturma - HTML / View Layer)
 * Non-admin users always have user_id bound to req.user.id (prevents ownership spoofing).
 */
const createJobPosting = async (req, res) => {
  try {
    const jobPayload = buildAndValidateJobPostingPayload(req, {
      isPartial: false,
      existingJobPosting: null,
      isAdmin: isAdminUser(req && req.user)
    });

    const newJobPosting = await jobPostingModel.createJobPosting(jobPayload);

    if (prefersJsonResponse(req)) {
      return res.status(201).json(newJobPosting);
    }

    const view = getJobPostingView();
    if (view && typeof view.renderJobPostingCreatedPage === 'function') {
      const html = view.renderJobPostingCreatedPage(newJobPosting, req && req.user ? req.user : null);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(201).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(201).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Yayınlandı</title></head><body><h1>İş İlanı Başarıyla Yayınlandı</h1><p>ID: ${escapeHtml(newJobPosting.id)}</p><p>Başlık: ${escapeHtml(newJobPosting.title)}</p></body></html>`);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return sendBadRequestResponse(req, res, error.message, '/job-postings');
    }
    if (error && (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452)) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: "Belirtilen kullanıcı (user_id) bulunamadı." });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send('<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Hata</title></head><body><h1>Hata: Belirtilen kullanıcı (user_id) sistemde kayıtlı değil.</h1><a href="/job-postings">Geri Dön</a></body></html>');
    }
    if (error && error.code === 'TITLE_TOO_LONG') {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: error.message });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Hata</title></head><body><h1>Hata: ${escapeHtml(error.message)}</h1><a href="/job-postings">Geri Dön</a></body></html>`);
    }
    res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * PUT /job-postings/:id (Tam Güncelleme - Owner or Admin Only)
 */
const updateJobPosting = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;
    const jobId = parsePositiveIntegerId(id);

    if (jobId === null) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(400).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik iş ilanı ID'si</h1></body></html>`);
    }

    const existingJobPosting = await jobPostingModel.getJobPostingById(jobId);
    if (!existingJobPosting) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "İş ilanı bulunamadı" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Bulunamadı</title></head><body><h1>İş ilanı bulunamadı</h1></body></html>`);
    }

    if (!canManageJobPosting(req && req.user, existingJobPosting)) {
      return sendForbiddenResponse(req, res, 'Only the job posting owner or an administrator can edit this job posting.', `/job-postings/${jobId}`);
    }

    const updatePayload = buildAndValidateJobPostingPayload(req, {
      isPartial: false,
      existingJobPosting,
      isAdmin: isAdminUser(req && req.user)
    });

    const updatedJobPosting = await jobPostingModel.updateJobPosting(jobId, updatePayload);

    if (!updatedJobPosting) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "İş ilanı bulunamadı" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Bulunamadı</title></head><body><h1>İş ilanı bulunamadı</h1></body></html>`);
    }

    if (prefersJsonResponse(req)) {
      return res.status(200).json(updatedJobPosting);
    }

    const view = getJobPostingView();
    if (view && typeof view.renderJobPostingUpdatedPage === 'function') {
      const html = view.renderJobPostingUpdatedPage(updatedJobPosting, { isPartial: false, currentUser: req && req.user ? req.user : null });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Güncellendi</title></head><body><h1>İş İlanı Başarıyla Güncellendi</h1><p>ID: ${escapeHtml(updatedJobPosting.id)}</p><p>Başlık: ${escapeHtml(updatedJobPosting.title)}</p></body></html>`);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return sendBadRequestResponse(req, res, error.message, '/job-postings');
    }
    if (error && (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452)) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: "Belirtilen kullanıcı (user_id) bulunamadı." });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send('<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Hata</title></head><body><h1>Hata: Belirtilen kullanıcı (user_id) sistemde kayıtlı değil.</h1><a href="/job-postings">Geri Dön</a></body></html>');
    }
    if (error && error.code === 'TITLE_TOO_LONG') {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: error.message });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Hata</title></head><body><h1>Hata: ${escapeHtml(error.message)}</h1><a href="/job-postings">Geri Dön</a></body></html>`);
    }
    res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * PATCH /job-postings/:id (Kısmi Güncelleme - Owner or Admin Only)
 */
const patchJobPosting = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;
    const jobId = parsePositiveIntegerId(id);

    if (jobId === null) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(400).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik iş ilanı ID'si</h1></body></html>`);
    }

    const existingJobPosting = await jobPostingModel.getJobPostingById(jobId);
    if (!existingJobPosting) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "İş ilanı bulunamadı" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Bulunamadı</title></head><body><h1>İş ilanı bulunamadı</h1></body></html>`);
    }

    if (!canManageJobPosting(req && req.user, existingJobPosting)) {
      return sendForbiddenResponse(req, res, 'Only the job posting owner or an administrator can edit this job posting.', `/job-postings/${jobId}`);
    }

    const patchPayload = buildAndValidateJobPostingPayload(req, {
      isPartial: true,
      existingJobPosting,
      isAdmin: isAdminUser(req && req.user)
    });

    const updatedJobPosting = await jobPostingModel.patchJobPosting(jobId, patchPayload);

    if (!updatedJobPosting) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "İş ilanı bulunamadı" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Bulunamadı</title></head><body><h1>İş ilanı bulunamadı</h1></body></html>`);
    }

    if (prefersJsonResponse(req)) {
      return res.status(200).json(updatedJobPosting);
    }

    const view = getJobPostingView();
    if (view && typeof view.renderJobPostingUpdatedPage === 'function') {
      const html = view.renderJobPostingUpdatedPage(updatedJobPosting, { isPartial: true, currentUser: req && req.user ? req.user : null });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Güncellendi</title></head><body><h1>İş İlanı Kısmi Olarak Güncellendi</h1><p>ID: ${escapeHtml(updatedJobPosting.id)}</p><p>Başlık: ${escapeHtml(updatedJobPosting.title)}</p></body></html>`);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return sendBadRequestResponse(req, res, error.message, '/job-postings');
    }
    if (error && (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452)) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: "Belirtilen kullanıcı (user_id) bulunamadı." });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send('<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Hata</title></head><body><h1>Hata: Belirtilen kullanıcı (user_id) sistemde kayıtlı değil.</h1><a href="/job-postings">Geri Dön</a></body></html>');
    }
    if (error && error.code === 'TITLE_TOO_LONG') {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: error.message });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Hata</title></head><body><h1>Hata: ${escapeHtml(error.message)}</h1><a href="/job-postings">Geri Dön</a></body></html>`);
    }
    res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * DELETE /job-postings/:id (Silme - Owner or Admin Only)
 */
const deleteJobPosting = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;
    const jobId = parsePositiveIntegerId(id);

    if (jobId === null) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(400).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik iş ilanı ID'si</h1></body></html>`);
    }

    const existingJobPosting = await jobPostingModel.getJobPostingById(jobId);
    if (!existingJobPosting) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "İş ilanı bulunamadı" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Bulunamadı</title></head><body><h1>İş ilanı bulunamadı</h1></body></html>`);
    }

    if (!canManageJobPosting(req && req.user, existingJobPosting)) {
      return sendForbiddenResponse(req, res, 'Only the job posting owner or an administrator can delete this job posting.', `/job-postings/${jobId}`);
    }

    const isDeleted = await jobPostingModel.deleteJobPosting(jobId);

    if (!isDeleted) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "İş ilanı bulunamadı" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Bulunamadı</title></head><body><h1>İş ilanı bulunamadı</h1></body></html>`);
    }

    if (prefersJsonResponse(req)) {
      return res.status(204).send();
    }

    const view = getJobPostingView();
    if (view && typeof view.renderJobPostingDeletedPage === 'function') {
      const html = view.renderJobPostingDeletedPage(id, req && req.user ? req.user : null);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Silindi</title></head><body><h1>İş İlanı Başarıyla Silindi</h1><p>ID: ${escapeHtml(id)}</p></body></html>`);
  } catch (error) {
    if (error && error.code === 'JOB_HAS_APPLICATIONS') {
      if (prefersJsonResponse(req)) {
        return res.status(409).json({ success: false, message: error.message });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(409).send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>409 Conflict</title></head><body><h1>409 Conflict</h1><p>${escapeHtml(error.message)}</p><a href="/job-postings">Back to Job Postings</a></body></html>`);
    }
    res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
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
