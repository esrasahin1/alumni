const applicationModel = require('../models/applicationModel');
const jobPostingModel = require('../models/jobPostingModel');

/**
 * Application View modülünü dinamik ve güvenli bir şekilde yükler.
 */
const getApplicationView = () => {
  try {
    return require('../views/applicationView');
  } catch (error) {
    return null;
  }
};

/**
 * Controller: Application işlemlerini ve iş mantığını yönetir (HTML / View Layer, MySQL)
 */

/**
 * GET /applications (Başvurular Listesi - HTML / View Layer)
 * Model'den başvuruları alır ve View Layer ile HTML olarak render eder.
 */
const getApplications = async (req, res) => {
  try {
    // Nested router senaryosu: req.params.jobPostingId varsa o ilanın başvurularını getir
    const nestedJobId = req && req.params && req.params.jobPostingId;
    if (nestedJobId) {
      return await getApplicationsByJobPosting(req, res);
    }

    const applications = await applicationModel.getAllApplications();

    // İstemci açıkça sadece JSON talep ederse
    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(200).json(applications);
    }

    const view = getApplicationView();
    if (view && typeof view.renderApplicationsPage === 'function') {
      const html = view.renderApplicationsPage(applications);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Başvurular</title></head><body><h1>Başvurular</h1><pre>${JSON.stringify(applications, null, 2)}</pre></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * GET /applications/:id (Başvuru Detayı - HTML / View Layer)
 */
const getApplication = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(400).json({ message: "Geçersiz veya eksik başvuru ID'si" });
      }
      const view = getApplicationView();
      if (view && typeof view.renderApplicationNotFoundPage === 'function') {
        const html = view.renderApplicationNotFoundPage(id);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(400).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik başvuru ID'si</h1></body></html>`);
    }

    const application = await applicationModel.getApplicationById(id);

    if (!application) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(404).json({ message: "Başvuru bulunamadı" });
      }
      const view = getApplicationView();
      if (view && typeof view.renderApplicationNotFoundPage === 'function') {
        const html = view.renderApplicationNotFoundPage(id);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Başvuru Bulunamadı</title></head><body><h1>Başvuru bulunamadı</h1></body></html>`);
    }

    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(200).json(application);
    }

    const view = getApplicationView();
    if (view && typeof view.renderApplicationDetailPage === 'function') {
      const html = view.renderApplicationDetailPage(application);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Başvuru #${application.id}</title></head><body><h1>Başvuru #${application.id}</h1><p>${application.applicant_name}</p></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * POST /applications (Yeni Başvuru - HTML / View Layer)
 */
const createApplication = async (req, res) => {
  try {
    const body = req && req.body;
    const rawJobId = body && (body.job_posting_id !== undefined ? body.job_posting_id : body.jobPostingId);
    const applicantName = body && (body.applicant_name !== undefined ? String(body.applicant_name).trim() : (body.applicantName !== undefined ? String(body.applicantName).trim() : ''));
    const applicantEmail = body && (body.applicant_email !== undefined ? String(body.applicant_email).trim() : (body.applicantEmail !== undefined ? String(body.applicantEmail).trim() : ''));

    if (!rawJobId || isNaN(Number(rawJobId)) || !applicantName || !applicantEmail) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(400).json({
          message: "İş ilanı ID'si (job_posting_id), başvuran adı (applicant_name) ve e-posta (applicant_email) alanları zorunludur."
        });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Eksik Alan</title></head><body><h1>Hata: İş ilanı ID'si, başvuran adı ve e-posta zorunludur.</h1><a href="/applications">← Geri Dön</a></body></html>`);
    }

    const jobPosting = await jobPostingModel.getJobPostingById(rawJobId);
    if (!jobPosting) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Bulunamadı</title></head><body><h1>Hata: #${escape(rawJobId)} numaralı iş ilanı bulunamadı.</h1><a href="/applications">← Geri Dön</a></body></html>`);
    }

    const newApplication = await applicationModel.createApplication(body);

    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(201).json(newApplication);
    }

    const view = getApplicationView();
    if (view && typeof view.renderApplicationCreatedPage === 'function') {
      const html = view.renderApplicationCreatedPage(newApplication);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(201).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(201).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Başvuru Alındı</title></head><body><h1>Başvuru Başarıyla Alındı</h1><p>ID: ${newApplication.id}</p></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * PUT /applications/:id (Tam Güncelleme - HTML / View Layer)
 */
const updateApplication = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(400).json({ message: "Geçersiz veya eksik başvuru ID'si" });
      }
      return res.status(400).send('Geçersiz veya eksik başvuru ID');
    }

    const body = req && req.body;
    const rawJobId = body && (body.job_posting_id !== undefined ? body.job_posting_id : body.jobPostingId);
    if (rawJobId !== undefined && rawJobId !== null && !isNaN(Number(rawJobId))) {
      const job = await jobPostingModel.getJobPostingById(rawJobId);
      if (!job) {
        if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
          return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
        }
        return res.status(404).send('Belirtilen iş ilanı bulunamadı');
      }
    }

    const updatedApplication = await applicationModel.updateApplication(id, body);

    if (!updatedApplication) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(404).json({ message: "Başvuru bulunamadı" });
      }
      return res.status(404).send('Başvuru bulunamadı');
    }

    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(200).json(updatedApplication);
    }

    const view = getApplicationView();
    if (view && typeof view.renderApplicationUpdatedPage === 'function') {
      const html = view.renderApplicationUpdatedPage(updatedApplication, { isPartial: false });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Başvuru Güncellendi</title></head><body><h1>Başvuru Güncellendi</h1></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * PATCH /applications/:id (Kısmi Güncelleme - HTML / View Layer)
 */
const patchApplication = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(400).json({ message: "Geçersiz veya eksik başvuru ID'si" });
      }
      return res.status(400).send('Geçersiz veya eksik başvuru ID');
    }

    const body = req && req.body;
    const rawJobId = body && (body.job_posting_id !== undefined ? body.job_posting_id : body.jobPostingId);
    if (rawJobId !== undefined && rawJobId !== null && !isNaN(Number(rawJobId))) {
      const job = await jobPostingModel.getJobPostingById(rawJobId);
      if (!job) {
        if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
          return res.status(404).json({ message: "Belirtilen iş ilanı bulunamadı" });
        }
        return res.status(404).send('Belirtilen iş ilanı bulunamadı');
      }
    }

    const updatedApplication = await applicationModel.patchApplication(id, body);

    if (!updatedApplication) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(404).json({ message: "Başvuru bulunamadı" });
      }
      return res.status(404).send('Başvuru bulunamadı');
    }

    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(200).json(updatedApplication);
    }

    const view = getApplicationView();
    if (view && typeof view.renderApplicationUpdatedPage === 'function') {
      const html = view.renderApplicationUpdatedPage(updatedApplication, { isPartial: true });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Başvuru Güncellendi</title></head><body><h1>Başvuru Kısmi Olarak Güncellendi</h1></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * DELETE /applications/:id (Silme - HTML / View Layer)
 */
const deleteApplication = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(400).json({ message: "Geçersiz veya eksik başvuru ID'si" });
      }
      return res.status(400).send('Geçersiz veya eksik başvuru ID');
    }

    const isDeleted = await applicationModel.deleteApplication(id);

    if (!isDeleted) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(404).json({ message: "Başvuru bulunamadı" });
      }
      return res.status(404).send('Başvuru bulunamadı');
    }

    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(204).send();
    }

    const view = getApplicationView();
    if (view && typeof view.renderApplicationDeletedPage === 'function') {
      const html = view.renderApplicationDeletedPage(id);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Başvuru Silindi</title></head><body><h1>Başvuru Silindi</h1></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * GET /job-postings/:jobPostingId/applications (İş İlanına Ait Başvurular - HTML)
 */
const getApplicationsByJobPosting = async (req, res) => {
  try {
    const jobPostingId = req && req.params && req.params.jobPostingId;

    if (!jobPostingId || isNaN(Number(jobPostingId))) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz İlan ID</title></head><body><h1>Hata: Geçersiz veya eksik iş ilanı ID'si</h1><a href="/job-postings">← İlanlara Dön</a></body></html>`);
    }

    const jobPosting = await jobPostingModel.getJobPostingById(jobPostingId);
    if (!jobPosting) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(404).json({ message: "İş ilanı bulunamadı" });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Bulunamadı</title></head><body><h1>İş ilanı bulunamadı</h1><a href="/job-postings">← İlanlara Dön</a></body></html>`);
    }

    const applications = await applicationModel.getApplicationsByJobPostingId(jobPostingId);

    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(200).json(applications);
    }

    const view = getApplicationView();
    if (view && typeof view.renderApplicationsPage === 'function') {
      const html = view.renderApplicationsPage(applications, { jobPosting });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İlan Başvuruları</title></head><body><h1>İlan #${jobPosting.id} Başvuruları</h1><pre>${JSON.stringify(applications, null, 2)}</pre></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * POST /job-postings/:jobPostingId/applications (İş İlanına Başvuru Oluşturma - HTML)
 */
const createApplicationForJobPosting = async (req, res) => {
  try {
    const jobPostingId = req && req.params && req.params.jobPostingId;

    if (!jobPostingId || isNaN(Number(jobPostingId))) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
      }
      return res.status(400).send("Geçersiz veya eksik iş ilanı ID'si");
    }

    const targetJobId = Number(jobPostingId);
    const jobPosting = await jobPostingModel.getJobPostingById(targetJobId);
    if (!jobPosting) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(404).json({ message: "İş ilanı bulunamadı" });
      }
      return res.status(404).send('İş ilanı bulunamadı');
    }

    const body = req && req.body;
    // Gövdede çelişen bir iş ilanı ID'si olup olmadığını doğrula
    const rawBodyJobId = body && (body.job_posting_id !== undefined ? body.job_posting_id : body.jobPostingId);
    if (rawBodyJobId !== undefined && rawBodyJobId !== null && rawBodyJobId !== '' && !isNaN(Number(rawBodyJobId))) {
      if (Number(rawBodyJobId) !== targetJobId) {
        if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
          return res.status(400).json({
            message: "URL'deki iş ilanı ID'si ile istek gövdesindeki iş ilanı ID'si uyuşmuyor."
          });
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Çelişkili ID</title></head><body><h1>Hata: URL'deki iş ilanı ID'si (#${targetJobId}) ile formdaki iş ilanı ID'si (#${rawBodyJobId}) uyuşmuyor.</h1><a href="/job-postings/${targetJobId}">← İlana Dön</a></body></html>`);
      }
    }

    const applicantName = body && (body.applicant_name !== undefined ? String(body.applicant_name).trim() : (body.applicantName !== undefined ? String(body.applicantName).trim() : ''));
    const applicantEmail = body && (body.applicant_email !== undefined ? String(body.applicant_email).trim() : (body.applicantEmail !== undefined ? String(body.applicantEmail).trim() : ''));

    if (!applicantName || !applicantEmail) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(400).json({
          message: "Başvuran adı (applicant_name) ve e-posta (applicant_email) alanları zorunludur."
        });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Eksik Bilgi</title></head><body><h1>Hata: Başvuran adı ve e-posta zorunludur.</h1><a href="/job-postings/${targetJobId}/applications">← Başvuru Formuna Dön</a></body></html>`);
    }

    // URL'den gelen jobPostingId değerini zorunlu ata
    const applicationPayload = {
      ...(body || {}),
      job_posting_id: targetJobId
    };

    const newApplication = await applicationModel.createApplication(applicationPayload);

    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(201).json(newApplication);
    }

    const view = getApplicationView();
    if (view && typeof view.renderApplicationCreatedPage === 'function') {
      const html = view.renderApplicationCreatedPage(newApplication);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(201).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(201).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Başvuru Alındı</title></head><body><h1>Başvuru Alındı</h1><p>ID: ${newApplication.id}</p></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error.message);
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
