const announcementModel = require('../models/announcementModel');
const { getAnnouncementCsrfToken } = require('../middlewares/mvcCsrfFactory');
const {
  escapeHtml,
  parsePositiveIntegerId,
  isAdminUser,
  prefersJsonResponse,
  sendForbiddenResponse,
  sendBadRequestResponse
} = require('./accessHelpers');

/**
 * Announcement View modülünü dinamik ve güvenli bir şekilde yükler.
 * View katmanı henüz oluşturulmamışsa null döner, hata fırlatmaz.
 */
const getAnnouncementView = () => {
  try {
    return require('../views/announcementView');
  } catch (error) {
    return null;
  }
};

function buildAnnouncementPayload(body, isPartial) {
  const input = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const payload = {};

  if (!isPartial || input.title !== undefined) {
    if (typeof input.title !== 'string') {
      const err = new Error('Title must be a valid string.');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    const title = input.title.trim();
    if (!title || title.length > 255) {
      const err = new Error('Title is required and must not exceed 255 characters.');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    payload.title = title;
  }

  if (!isPartial || input.content !== undefined) {
    if (typeof input.content !== 'string') {
      const err = new Error('Content must be a valid string.');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    const content = input.content.trim();
    if (!content) {
      const err = new Error('Content is required.');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    payload.content = content;
  }

  return payload;
}

/**
 * Controller: Announcement işlemlerini ve iş mantığını yönetir (HTML / View Layer, MySQL)
 */

/**
 * GET /announcements (Duyuru Listesi - HTML / View Layer)
 * Public read access; admin management UI shown only for auth_role === 'admin'.
 */
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await announcementModel.getAllAnnouncements();

    if (prefersJsonResponse(req)) {
      return res.status(200).json(announcements);
    }

    const view = getAnnouncementView();
    if (view && typeof view.renderAnnouncementsPage === 'function') {
      const html = view.renderAnnouncementsPage(announcements, req && req.user ? req.user : null, {
        csrfToken: getAnnouncementCsrfToken(req, res)
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyurular - Alumni Tracking System</title></head><body><h1>Duyurular</h1><pre>${escapeHtml(JSON.stringify(announcements, null, 2))}</pre></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * GET /announcements/:id (Duyuru Detayı - HTML / View Layer)
 */
const getAnnouncement = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;
    const announcementId = parsePositiveIntegerId(id);

    if (announcementId === null) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
      }
      const view = getAnnouncementView();
      if (view && typeof view.renderAnnouncementNotFoundPage === 'function') {
        const html = view.renderAnnouncementNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(400).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik duyuru ID'si</h1></body></html>`);
    }

    const announcement = await announcementModel.getAnnouncementById(announcementId);

    if (!announcement) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Duyuru bulunamadı" });
      }
      const view = getAnnouncementView();
      if (view && typeof view.renderAnnouncementNotFoundPage === 'function') {
        const html = view.renderAnnouncementNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyuru Bulunamadı</title></head><body><h1>Duyuru bulunamadı</h1></body></html>`);
    }

    if (prefersJsonResponse(req)) {
      return res.status(200).json(announcement);
    }

    const view = getAnnouncementView();
    if (view && typeof view.renderAnnouncementDetailPage === 'function') {
      const html = view.renderAnnouncementDetailPage(announcement, req && req.user ? req.user : null, {
        csrfToken: getAnnouncementCsrfToken(req, res)
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>${escapeHtml(announcement.title || 'Duyuru Detayı')}</title></head><body><h1>${escapeHtml(announcement.title)}</h1><p>${escapeHtml(announcement.content)}</p></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * POST /announcements (Yeni Duyuru Oluşturma - Admin Only)
 */
const createAnnouncement = async (req, res) => {
  try {
    if (!isAdminUser(req && req.user)) {
      return sendForbiddenResponse(req, res, 'Only administrators can create announcements.', '/announcements');
    }

    const payload = buildAnnouncementPayload(req && req.body, false);
    const newAnnouncement = await announcementModel.createAnnouncement(payload);

    if (prefersJsonResponse(req)) {
      return res.status(201).json(newAnnouncement);
    }

    const view = getAnnouncementView();
    if (view && typeof view.renderAnnouncementCreatedPage === 'function') {
      const html = view.renderAnnouncementCreatedPage(newAnnouncement, req && req.user ? req.user : null);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(201).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(201).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyuru Oluşturuldu</title></head><body><h1>Duyuru Başarıyla Oluşturuldu</h1><p>ID: ${escapeHtml(newAnnouncement.id)}</p><p>Başlık: ${escapeHtml(newAnnouncement.title)}</p></body></html>`);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return sendBadRequestResponse(req, res, error.message, '/announcements');
    }
    res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * PUT /announcements/:id (Tam Güncelleme - Admin Only)
 */
const updateAnnouncement = async (req, res) => {
  try {
    if (!isAdminUser(req && req.user)) {
      return sendForbiddenResponse(req, res, 'Only administrators can edit announcements.', '/announcements');
    }

    const id = req && req.params && req.params.id;
    const announcementId = parsePositiveIntegerId(id);

    if (announcementId === null) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
      }
      const view = getAnnouncementView();
      if (view && typeof view.renderAnnouncementNotFoundPage === 'function') {
        const html = view.renderAnnouncementNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(400).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik duyuru ID'si</h1></body></html>`);
    }

    const payload = buildAnnouncementPayload(req && req.body, false);
    const updatedAnnouncement = await announcementModel.updateAnnouncement(announcementId, payload);

    if (!updatedAnnouncement) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Duyuru bulunamadı" });
      }
      const view = getAnnouncementView();
      if (view && typeof view.renderAnnouncementNotFoundPage === 'function') {
        const html = view.renderAnnouncementNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyuru Bulunamadı</title></head><body><h1>Duyuru bulunamadı</h1></body></html>`);
    }

    if (prefersJsonResponse(req)) {
      return res.status(200).json(updatedAnnouncement);
    }

    const view = getAnnouncementView();
    if (view && typeof view.renderAnnouncementUpdatedPage === 'function') {
      const html = view.renderAnnouncementUpdatedPage(updatedAnnouncement, { isPartial: false, currentUser: req && req.user ? req.user : null });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyuru Güncellendi</title></head><body><h1>Duyuru Başarıyla Güncellendi</h1><p>ID: ${escapeHtml(updatedAnnouncement.id)}</p><p>Başlık: ${escapeHtml(updatedAnnouncement.title)}</p></body></html>`);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return sendBadRequestResponse(req, res, error.message, '/announcements');
    }
    res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * PATCH /announcements/:id (Kısmi Güncelleme - Admin Only)
 */
const patchAnnouncement = async (req, res) => {
  try {
    if (!isAdminUser(req && req.user)) {
      return sendForbiddenResponse(req, res, 'Only administrators can edit announcements.', '/announcements');
    }

    const id = req && req.params && req.params.id;
    const announcementId = parsePositiveIntegerId(id);

    if (announcementId === null) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
      }
      const view = getAnnouncementView();
      if (view && typeof view.renderAnnouncementNotFoundPage === 'function') {
        const html = view.renderAnnouncementNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(400).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik duyuru ID'si</h1></body></html>`);
    }

    const payload = buildAnnouncementPayload(req && req.body, true);
    const updatedAnnouncement = await announcementModel.patchAnnouncement(announcementId, payload);

    if (!updatedAnnouncement) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Duyuru bulunamadı" });
      }
      const view = getAnnouncementView();
      if (view && typeof view.renderAnnouncementNotFoundPage === 'function') {
        const html = view.renderAnnouncementNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyuru Bulunamadı</title></head><body><h1>Duyuru bulunamadı</h1></body></html>`);
    }

    if (prefersJsonResponse(req)) {
      return res.status(200).json(updatedAnnouncement);
    }

    const view = getAnnouncementView();
    if (view && typeof view.renderAnnouncementUpdatedPage === 'function') {
      const html = view.renderAnnouncementUpdatedPage(updatedAnnouncement, { isPartial: true, currentUser: req && req.user ? req.user : null });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyuru Güncellendi</title></head><body><h1>Duyuru Kısmi Olarak Güncellendi</h1><p>ID: ${escapeHtml(updatedAnnouncement.id)}</p><p>Başlık: ${escapeHtml(updatedAnnouncement.title)}</p></body></html>`);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return sendBadRequestResponse(req, res, error.message, '/announcements');
    }
    res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * DELETE /announcements/:id (Silme - Admin Only)
 */
const deleteAnnouncement = async (req, res) => {
  try {
    if (!isAdminUser(req && req.user)) {
      return sendForbiddenResponse(req, res, 'Only administrators can delete announcements.', '/announcements');
    }

    const id = req && req.params && req.params.id;
    const announcementId = parsePositiveIntegerId(id);

    if (announcementId === null) {
      if (prefersJsonResponse(req)) {
        return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
      }
      const view = getAnnouncementView();
      if (view && typeof view.renderAnnouncementNotFoundPage === 'function') {
        const html = view.renderAnnouncementNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(400).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik duyuru ID'si</h1></body></html>`);
    }

    const isDeleted = await announcementModel.deleteAnnouncement(announcementId);

    if (!isDeleted) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Duyuru bulunamadı" });
      }
      const view = getAnnouncementView();
      if (view && typeof view.renderAnnouncementNotFoundPage === 'function') {
        const html = view.renderAnnouncementNotFoundPage(id, req && req.user ? req.user : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyuru Bulunamadı</title></head><body><h1>Duyuru bulunamadı</h1></body></html>`);
    }

    if (prefersJsonResponse(req)) {
      return res.status(204).send();
    }

    const view = getAnnouncementView();
    if (view && typeof view.renderAnnouncementDeletedPage === 'function') {
      const html = view.renderAnnouncementDeletedPage(id, req && req.user ? req.user : null);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyuru Silindi</title></head><body><h1>Duyuru Başarıyla Silindi</h1><p>ID: ${escapeHtml(id)}</p></body></html>`);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

module.exports = {
  buildAnnouncementPayload,
  getAnnouncements,
  getAllAnnouncements: getAnnouncements,
  getAnnouncement,
  getAnnouncementById: getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  patchAnnouncement,
  deleteAnnouncement
};
