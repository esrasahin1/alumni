const jobPostingModel = require('../models/jobPostingModel');

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

/**
 * Controller: Job Posting işlemlerini ve iş mantığını yönetir (HTML / View Layer, MySQL)
 */

/**
 * GET /job-postings (İş İlanları Listesi - HTML / View Layer)
 * Model'den iş ilanlarını alır ve View Layer ile HTML olarak render eder.
 */
const getJobPostings = async (req, res) => {
  try {
    const jobPostings = await jobPostingModel.getAllJobPostings();

    // İstemci açıkça sadece JSON talep ederse (API istemcileri için esneklik)
    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(200).json(jobPostings);
    }

    // View katmanı mevcutsa şablonu render et
    const view = getJobPostingView();
    if (view && typeof view.renderJobPostingsPage === 'function') {
      const html = view.renderJobPostingsPage(jobPostings);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanları - Alumni Tracking System</title></head><body><h1>İş İlanları</h1><pre>${JSON.stringify(jobPostings, null, 2)}</pre></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * GET /job-postings/:id (İş İlanı Detayı - HTML / View Layer)
 * ID'ye göre tek bir iş ilanını getirir (Bulunamazsa 404, geçersiz ID ise 400 döner).
 */
const getJobPosting = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(400).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik iş ilanı ID'si</h1></body></html>`);
    }

    const jobPosting = await jobPostingModel.getJobPostingById(id);

    if (!jobPosting) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(404).json({ message: "İş ilanı bulunamadı" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Bulunamadı</title></head><body><h1>İş ilanı bulunamadı</h1></body></html>`);
    }

    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(200).json(jobPosting);
    }

    const view = getJobPostingView();
    if (view && typeof view.renderJobPostingDetailPage === 'function') {
      const html = view.renderJobPostingDetailPage(jobPosting);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>${jobPosting.title || 'İş İlanı Detayı'}</title></head><body><h1>${jobPosting.title}</h1><h2>${jobPosting.company}</h2><p>${jobPosting.description}</p></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * POST /job-postings (Yeni İş İlanı Oluşturma - HTML / View Layer)
 * Model üzerinden yeni iş ilanı oluşturur ve View Layer ile HTML sonucu gösterir.
 */
const createJobPosting = async (req, res) => {
  try {
    const body = req && req.body;
    const newJobPosting = await jobPostingModel.createJobPosting(body);

    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(201).json(newJobPosting);
    }

    const view = getJobPostingView();
    if (view && typeof view.renderJobPostingCreatedPage === 'function') {
      const html = view.renderJobPostingCreatedPage(newJobPosting);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(201).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(201).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Yayınlandı</title></head><body><h1>İş İlanı Başarıyla Yayınlandı</h1><p>ID: ${newJobPosting.id}</p><p>Başlık: ${newJobPosting.title}</p></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * PUT /job-postings/:id (Tam Güncelleme - HTML / View Layer)
 * Belirtilen ID'deki iş ilanının tüm bilgilerini günceller (ID korunur).
 */
const updateJobPosting = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(400).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik iş ilanı ID'si</h1></body></html>`);
    }

    const updatedJobPosting = await jobPostingModel.updateJobPosting(id, req && req.body);

    if (!updatedJobPosting) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(404).json({ message: "İş ilanı bulunamadı" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Bulunamadı</title></head><body><h1>İş ilanı bulunamadı</h1></body></html>`);
    }

    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(200).json(updatedJobPosting);
    }

    const view = getJobPostingView();
    if (view && typeof view.renderJobPostingUpdatedPage === 'function') {
      const html = view.renderJobPostingUpdatedPage(updatedJobPosting, { isPartial: false });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Güncellendi</title></head><body><h1>İş İlanı Başarıyla Güncellendi</h1><p>ID: ${updatedJobPosting.id}</p><p>Başlık: ${updatedJobPosting.title}</p></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * PATCH /job-postings/:id (Kısmi Güncelleme - HTML / View Layer)
 * Belirtilen ID'deki iş ilanının sadece gönderilen alanlarını kısmi olarak günceller.
 */
const patchJobPosting = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(400).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik iş ilanı ID'si</h1></body></html>`);
    }

    const updatedJobPosting = await jobPostingModel.patchJobPosting(id, req && req.body);

    if (!updatedJobPosting) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(404).json({ message: "İş ilanı bulunamadı" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Bulunamadı</title></head><body><h1>İş ilanı bulunamadı</h1></body></html>`);
    }

    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(200).json(updatedJobPosting);
    }

    const view = getJobPostingView();
    if (view && typeof view.renderJobPostingUpdatedPage === 'function') {
      const html = view.renderJobPostingUpdatedPage(updatedJobPosting, { isPartial: true });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Güncellendi</title></head><body><h1>İş İlanı Kısmi Olarak Güncellendi</h1><p>ID: ${updatedJobPosting.id}</p><p>Başlık: ${updatedJobPosting.title}</p></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * DELETE /job-postings/:id (Silme - HTML / View Layer)
 * Belirtilen ID'deki iş ilanını siler.
 */
const deleteJobPosting = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(400).json({ message: "Geçersiz veya eksik iş ilanı ID'si" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(400).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik iş ilanı ID'si</h1></body></html>`);
    }

    const isDeleted = await jobPostingModel.deleteJobPosting(id);

    if (!isDeleted) {
      if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(404).json({ message: "İş ilanı bulunamadı" });
      }
      const view = getJobPostingView();
      if (view && typeof view.renderJobPostingNotFoundPage === 'function') {
        const html = view.renderJobPostingNotFoundPage(id);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Bulunamadı</title></head><body><h1>İş ilanı bulunamadı</h1></body></html>`);
    }

    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(204).send();
    }

    const view = getJobPostingView();
    if (view && typeof view.renderJobPostingDeletedPage === 'function') {
      const html = view.renderJobPostingDeletedPage(id);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş İlanı Silindi</title></head><body><h1>İş İlanı Başarıyla Silindi</h1><p>ID: ${id}</p></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error.message);
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
