const applicationModel = require('../models/applicationModel');
const jobPostingModel = require('../models/jobPostingModel');
const {
  isSelfApplication,
  getAppCsrfToken,
  isAdminUser,
  prefersJsonResponse,
  sendForbiddenResponse,
  getApplicationAccessContext,
  canViewJobApplications,
  buildWhitelistedCreatePayload,
  buildWhitelistedUpdatePayload
} = require('./applicationHelpers');

const sendValidationErrorResponse = (req, res, message, backHref = '/applications') => {
  if (prefersJsonResponse(req)) {
    return res.status(400).json({ message });
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(400).send(
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Validation Error</title></head><body><h1>Validation Error</h1><p>${escapeHtml(message)}</p><a href="${escapeHtml(backHref)}">← Back</a></body></html>`
  );
};

const escapeHtml = (str) => {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const getApplicationView = () => {
  try {
    return require('../views/applicationView');
  } catch (error) {
    return null;
  }
};

/**
 * GET /my-applications (Authenticated User's Own Applications - HTML)
 * Always derives user ID strictly from req.user.id.
 */
const getMyApplications = async (req, res) => {
  try {
    const applications = await applicationModel.getApplicationsByUserId(req.user.id);

    if (prefersJsonResponse(req)) {
      return res.status(200).json(applications);
    }

    const view = getApplicationView();
    if (view && typeof view.renderMyApplicationsPage === 'function') {
      const html = view.renderMyApplicationsPage(applications, { currentUser: req.user });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>My Applications</title></head><body><h1>My Applications</h1><pre>${escapeHtml(JSON.stringify(applications, null, 2))}</pre></body></html>`);
  } catch (error) {
    return res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * GET /applications (HTML / View Layer)
 * - Admin: sees all applications across the system.
 * - Student / Alumni: sees ONLY applications submitted to job postings owned by req.user.id.
 */
const getApplications = async (req, res) => {
  try {
    const nestedJobId = req && req.params && req.params.jobPostingId;
    if (nestedJobId) {
      return await getApplicationsByJobPosting(req, res);
    }

    const isAdmin = isAdminUser(req && req.user);
    const applications = isAdmin
      ? await applicationModel.getAllApplicationsWithJobDetails()
      : await applicationModel.getApplicationsByJobOwnerId(req.user.id);

    if (prefersJsonResponse(req)) {
      return res.status(200).json(applications);
    }

    const view = getApplicationView();
    if (view && typeof view.renderApplicationsPage === 'function') {
      const html = view.renderApplicationsPage(applications, {
        currentUser: req && req.user ? req.user : null,
        isAdminView: isAdmin,
        csrfToken: getAppCsrfToken(req, res)
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Başvurular</title></head><body><h1>Başvurular</h1><pre>${escapeHtml(JSON.stringify(applications, null, 2))}</pre></body></html>`);
  } catch (error) {
    return res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * GET /applications/:id (Başvuru Detayı - HTML / View Layer)
 * Accessible only to the application owner, the owning job poster, or Admin.
 */
const getApplication = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: "Geçersiz veya eksik başvuru ID'si" });
      }
      const view = getApplicationView();
      if (view && typeof view.renderApplicationNotFoundPage === 'function') {
        const html = view.renderApplicationNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(400).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik başvuru ID'si</h1></body></html>`);
    }

    const access = await getApplicationAccessContext(req, id);

    if (!access.application) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Başvuru bulunamadı" });
      }
      const view = getApplicationView();
      if (view && typeof view.renderApplicationNotFoundPage === 'function') {
        const html = view.renderApplicationNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Başvuru Bulunamadı</title></head><body><h1>Başvuru bulunamadı</h1></body></html>`);
    }

    if (!access.isAdmin && !access.isApplicantOwner && !access.isJobOwner) {
      return sendForbiddenResponse(req, res, 'You do not have permission to view this application.');
    }

    if (prefersJsonResponse(req)) {
      return res.status(200).json(access.application);
    }

    const view = getApplicationView();
    if (view && typeof view.renderApplicationDetailPage === 'function') {
      const html = view.renderApplicationDetailPage(access.application, req && req.user ? req.user : null, {
        canUpdateStatus: access.isAdmin || access.isJobOwner,
        canDelete: access.isAdmin || access.isApplicantOwner,
        isApplicantOwner: access.isApplicantOwner,
        isJobOwner: access.isJobOwner,
        jobPosting: access.jobPosting,
        csrfToken: getAppCsrfToken(req, res)
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Başvuru #${escapeHtml(access.application.id)}</title></head><body><h1>Başvuru #${escapeHtml(access.application.id)}</h1><p>${escapeHtml(access.application.applicant_name)}</p></body></html>`);
  } catch (error) {
    return res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * POST /applications (Yeni Başvuru - HTML / View Layer)
 * Preserves guest submission (user_id = NULL) and binds req.user.id for logged-in users.
 * Always initializes status = 'PENDING'.
 */
const createApplication = async (req, res) => {
  try {
    const payload = buildWhitelistedCreatePayload(req);

    if (!payload.job_posting_id || payload.job_posting_id <= 0 || !payload.applicant_name || !payload.applicant_email) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({
          message: "İş ilanı ID'si (job_posting_id), başvuran adı (applicant_name) ve e-posta (applicant_email) alanları zorunludur."
        });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Eksik Alan</title></head><body><h1>Hata: İş ilanı ID'si, başvuran adı ve e-posta zorunludur.</h1><a href="/job-postings">← Geri Dön</a></body></html>`);
    }

    const jobPosting = await jobPostingModel.getJobPostingById(payload.job_posting_id);
    if (!jobPosting) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Bulunamadı</title></head><body><h1>Hata: #${escapeHtml(payload.job_posting_id)} numaralı iş ilanı bulunamadı.</h1><a href="/job-postings">← Geri Dön</a></body></html>`);
    }

    if (isSelfApplication(req && req.user, jobPosting)) {
      return sendForbiddenResponse(req, res, 'Job posting owners cannot apply to their own job posting.');
    }

    const newApplication = await applicationModel.createApplication(payload);

    if (prefersJsonResponse(req)) {
      return res.status(201).json(newApplication);
    }

    const view = getApplicationView();
    if (view && typeof view.renderApplicationCreatedPage === 'function') {
      const html = view.renderApplicationCreatedPage(newApplication, req && req.user ? req.user : null);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(201).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(201).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Başvuru Alındı</title></head><body><h1>Başvuru Başarıyla Alındı</h1><p>ID: ${escapeHtml(newApplication.id)}</p></body></html>`);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return sendValidationErrorResponse(req, res, error.message, '/job-postings');
    }
    if (error && error.code === 'JOB_POSTING_NOT_FOUND') {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Bulunamadı</title></head><body><h1>Hata: Belirtilen iş ilanı bulunamadı.</h1><a href="/job-postings">← Geri Dön</a></body></html>`);
    }
    return res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * PUT /applications/:id (Tam Güncelleme - HTML / View Layer)
 * Restricted to the owning job poster or Admin.
 */
const updateApplication = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: "Geçersiz veya eksik başvuru ID'si" });
      }
      return res.status(400).send('Geçersiz veya eksik başvuru ID');
    }

    const access = await getApplicationAccessContext(req, id);
    if (!access.application) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Başvuru bulunamadı" });
      }
      return res.status(404).send('Başvuru bulunamadı');
    }

    if (!access.isAdmin && !access.isJobOwner) {
      return sendForbiddenResponse(req, res, 'Only the job posting owner or an administrator can update this application.');
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
        return sendValidationErrorResponse(
          req,
          res,
          "İş ilanı ID'si (job_posting_id), başvuran adı (applicant_name) ve e-posta (applicant_email) alanları zorunludur.",
          `/applications/${escapeHtml(id)}`
        );
      }
      const job = await jobPostingModel.getJobPostingById(Number(updatePayload.job_posting_id));
      if (!job) {
        if (prefersJsonResponse(req)) {
          return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
        }
        return res.status(404).send('Belirtilen iş ilanı bulunamadı');
      }
    }

    const updatedApplication = await applicationModel.updateApplication(id, updatePayload, false);

    if (!updatedApplication) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Başvuru bulunamadı" });
      }
      return res.status(404).send('Başvuru bulunamadı');
    }

    if (prefersJsonResponse(req)) {
      return res.status(200).json(updatedApplication);
    }

    const view = getApplicationView();
    if (view && typeof view.renderApplicationUpdatedPage === 'function') {
      const html = view.renderApplicationUpdatedPage(updatedApplication, { isPartial: false, currentUser: req && req.user ? req.user : null });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Başvuru Güncellendi</title></head><body><h1>Başvuru Güncellendi</h1></body></html>`);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return sendValidationErrorResponse(req, res, error.message);
    }
    if (error && error.code === 'INVALID_STATUS') {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(400).send(escapeHtml(error.message));
    }
    if (error && error.code === 'JOB_POSTING_NOT_FOUND') {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
      }
      return res.status(404).send('Belirtilen iş ilanı bulunamadı');
    }
    return res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * PATCH /applications/:id (Kısmi Güncelleme - HTML / View Layer)
 * Restricted to the owning job poster or Admin (applicants cannot change their own status).
 */
const patchApplication = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: "Geçersiz veya eksik başvuru ID'si" });
      }
      return res.status(400).send('Geçersiz veya eksik başvuru ID');
    }

    const access = await getApplicationAccessContext(req, id);
    if (!access.application) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Başvuru bulunamadı" });
      }
      return res.status(404).send('Başvuru bulunamadı');
    }

    if (!access.isAdmin && !access.isJobOwner) {
      return sendForbiddenResponse(req, res, 'Only the job posting owner or an administrator can update application status.');
    }

    const updatePayload = buildWhitelistedUpdatePayload(req, access.application, {
      isAdmin: access.isAdmin,
      isPartial: true
    });

    if (access.isAdmin && updatePayload.job_posting_id !== undefined) {
      const job = await jobPostingModel.getJobPostingById(updatePayload.job_posting_id);
      if (!job) {
        if (prefersJsonResponse(req)) {
          return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
        }
        return res.status(404).send('Belirtilen iş ilanı bulunamadı');
      }
    }

    const updatedApplication = await applicationModel.patchApplication(id, updatePayload);

    if (!updatedApplication) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Başvuru bulunamadı" });
      }
      return res.status(404).send('Başvuru bulunamadı');
    }

    if (prefersJsonResponse(req)) {
      return res.status(200).json(updatedApplication);
    }

    const view = getApplicationView();
    if (view && typeof view.renderApplicationUpdatedPage === 'function') {
      const html = view.renderApplicationUpdatedPage(updatedApplication, { isPartial: true, currentUser: req && req.user ? req.user : null });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Başvuru Güncellendi</title></head><body><h1>Başvuru Kısmi Olarak Güncellendi</h1></body></html>`);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return sendValidationErrorResponse(req, res, error.message);
    }
    if (error && error.code === 'INVALID_STATUS') {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(400).send(escapeHtml(error.message));
    }
    if (error && error.code === 'JOB_POSTING_NOT_FOUND') {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
      }
      return res.status(404).send('Belirtilen iş ilanı bulunamadı');
    }
    return res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * DELETE /applications/:id (Silme - HTML / View Layer)
 * Restricted to the application owner or Admin.
 */
const deleteApplication = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: "Geçersiz veya eksik başvuru ID'si" });
      }
      return res.status(400).send('Geçersiz veya eksik başvuru ID');
    }

    const access = await getApplicationAccessContext(req, id);
    if (!access.application) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Başvuru bulunamadı" });
      }
      return res.status(404).send('Başvuru bulunamadı');
    }

    if (!access.isAdmin && !access.isApplicantOwner) {
      return sendForbiddenResponse(req, res, 'Only the application owner or an administrator can delete this application.');
    }

    const isDeleted = await applicationModel.deleteApplication(id);
    if (!isDeleted) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Başvuru bulunamadı" });
      }
      return res.status(404).send('Başvuru bulunamadı');
    }

    if (prefersJsonResponse(req)) {
      return res.status(204).send();
    }

    const view = getApplicationView();
    if (view && typeof view.renderApplicationDeletedPage === 'function') {
      const html = view.renderApplicationDeletedPage(id, req && req.user ? req.user : null);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Başvuru Silindi</title></head><body><h1>Başvuru Silindi</h1></body></html>`);
  } catch (error) {
    return res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * GET /job-postings/:jobPostingId/applications (İş İlanına Ait Başvurular - HTML)
 * Restricted to the owning job poster or Admin.
 */
const getApplicationsByJobPosting = async (req, res) => {
  try {
    const jobPostingId = req && req.params && req.params.jobPostingId;

    if (!jobPostingId || isNaN(Number(jobPostingId))) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz İlan ID</title></head><body><h1>Hata: Geçersiz veya eksik iş ilanı ID'si</h1><a href="/job-postings">← İlanlara Dön</a></body></html>`);
    }

    const jobPosting = await jobPostingModel.getJobPostingById(jobPostingId);
    if (!jobPosting) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "İş ilanı bulunamadı" });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Bulunamadı</title></head><body><h1>İş ilanı bulunamadı</h1><a href="/job-postings">← İlanlara Dön</a></body></html>`);
    }

    if (!canViewJobApplications(req && req.user, jobPosting)) {
      return sendForbiddenResponse(req, res, 'Only the job posting owner or an administrator can view applications for this job.');
    }

    const applications = await applicationModel.getApplicationsByJobPostingId(jobPostingId);

    if (prefersJsonResponse(req)) {
      return res.status(200).json(applications);
    }

    const view = getApplicationView();
    if (view && typeof view.renderApplicationsPage === 'function') {
      const html = view.renderApplicationsPage(applications, {
        jobPosting,
        currentUser: req && req.user ? req.user : null,
        isAdminView: isAdminUser(req && req.user),
        csrfToken: getAppCsrfToken(req, res)
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İlan Başvuruları</title></head><body><h1>İlan #${escapeHtml(jobPosting.id)} Başvuruları</h1><pre>${escapeHtml(JSON.stringify(applications, null, 2))}</pre></body></html>`);
  } catch (error) {
    return res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * POST /job-postings/:jobPostingId/applications (İş İlanına Başvuru Oluşturma - HTML)
 * Preserves guest submission (user_id = NULL) and binds req.user.id for logged-in users.
 * Always initializes status = 'PENDING'.
 */
const createApplicationForJobPosting = async (req, res) => {
  try {
    const jobPostingId = req && req.params && req.params.jobPostingId;

    if (!jobPostingId || isNaN(Number(jobPostingId))) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
      }
      return res.status(400).send("Geçersiz veya eksik iş ilanı ID'si");
    }

    const targetJobId = Number(jobPostingId);
    const jobPosting = await jobPostingModel.getJobPostingById(targetJobId);
    if (!jobPosting) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "İş ilanı bulunamadı" });
      }
      return res.status(404).send('İş ilanı bulunamadı');
    }

    if (isSelfApplication(req && req.user, jobPosting)) {
      return sendForbiddenResponse(req, res, 'Job posting owners cannot apply to their own job posting.');
    }

    const body = req && req.body;
    const rawBodyJobId = body && (body.job_posting_id !== undefined ? body.job_posting_id : body.jobPostingId);
    if (rawBodyJobId !== undefined && rawBodyJobId !== null && rawBodyJobId !== '' && !isNaN(Number(rawBodyJobId))) {
      if (Number(rawBodyJobId) !== targetJobId) {
        if (prefersJsonResponse(req)) {
          return res.status(400).json({
            message: "URL'deki iş ilanı ID'si ile istek gövdesindeki iş ilanı ID'si uyuşmuyor."
          });
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Çelişkili ID</title></head><body><h1>Hata: URL'deki iş ilanı ID'si (#${escapeHtml(targetJobId)}) ile formdaki iş ilanı ID'si (#${escapeHtml(rawBodyJobId)}) uyuşmuyor.</h1><a href="/job-postings/${escapeHtml(targetJobId)}">← İlana Dön</a></body></html>`);
      }
    }

    const payload = buildWhitelistedCreatePayload(req, targetJobId);

    if (!payload.applicant_name || !payload.applicant_email) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({
          message: "Başvuran adı (applicant_name) ve e-posta (applicant_email) alanları zorunludur."
        });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Eksik Bilgi</title></head><body><h1>Hata: Başvuran adı ve e-posta zorunludur.</h1><a href="/job-postings/${escapeHtml(targetJobId)}">← İlana Dön</a></body></html>`);
    }

    const newApplication = await applicationModel.createApplication(payload);

    if (prefersJsonResponse(req)) {
      return res.status(201).json(newApplication);
    }

    const view = getApplicationView();
    if (view && typeof view.renderApplicationCreatedPage === 'function') {
      const html = view.renderApplicationCreatedPage(newApplication, req && req.user ? req.user : null);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(201).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(201).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Başvuru Alındı</title></head><body><h1>Başvuru Alındı</h1><p>ID: ${escapeHtml(newApplication.id)}</p></body></html>`);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return sendValidationErrorResponse(req, res, error.message, `/job-postings/${escapeHtml(req.params.jobPostingId)}`);
    }
    if (error && error.code === 'JOB_POSTING_NOT_FOUND') {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "İş ilanı bulunamadı" });
      }
      return res.status(404).send('İş ilanı bulunamadı');
    }
    return res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

module.exports = {
  getMyApplications,
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
