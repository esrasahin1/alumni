const announcementModel = require('../models/announcementModel');

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

/**
 * Controller: Announcement işlemlerini ve iş mantığını yönetir (Tarayıcı / HTML istekleri için)
 */

/**
 * GET /announcements (Duyuru Listesi - HTML / View Layer)
 * Model'den duyuruları alır ve View Layer ile HTML olarak render eder.
 */
const getAnnouncements = (req, res) => {
  const announcements = announcementModel.getAllAnnouncements();

  // İstemci açıkça sadece JSON talep ederse (API istemcileri için esneklik)
  if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
    return res.status(200).json(announcements);
  }

  // View katmanı mevcutsa şablonu render et
  const view = getAnnouncementView();
  if (view && typeof view.renderAnnouncementsPage === 'function') {
    const html = view.renderAnnouncementsPage(announcements);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  // Görünüm katmanı henüz oluşturulmamışsa temel HTML yanıtı
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyurular - Alumni Tracking System</title></head><body><h1>Duyurular</h1><pre>${JSON.stringify(announcements, null, 2)}</pre></body></html>`);
};

/**
 * GET /announcements/:id (Duyuru Detayı - HTML / View Layer)
 * ID'ye göre tek bir duyuruyu getirir (Bulunamazsa 404, geçersiz ID ise 400 döner).
 */
const getAnnouncement = (req, res) => {
  const id = req && req.params && req.params.id;

  if (!id || isNaN(Number(id))) {
    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
    }
    const view = getAnnouncementView();
    if (view && typeof view.renderAnnouncementNotFoundPage === 'function') {
      const html = view.renderAnnouncementNotFoundPage(id);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(html);
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik duyuru ID'si</h1></body></html>`);
  }

  const announcement = announcementModel.getAnnouncementById(id);

  if (!announcement) {
    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(404).json({ message: "Duyuru bulunamadı" });
    }
    const view = getAnnouncementView();
    if (view && typeof view.renderAnnouncementNotFoundPage === 'function') {
      const html = view.renderAnnouncementNotFoundPage(id);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyuru Bulunamadı</title></head><body><h1>Duyuru bulunamadı</h1></body></html>`);
  }

  if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
    return res.status(200).json(announcement);
  }

  const view = getAnnouncementView();
  if (view && typeof view.renderAnnouncementDetailPage === 'function') {
    const html = view.renderAnnouncementDetailPage(announcement);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>${announcement.title || 'Duyuru Detayı'}</title></head><body><h1>${announcement.title}</h1><p>${announcement.content}</p></body></html>`);
};

/**
 * POST /announcements (Yeni Duyuru Oluşturma - HTML / View Layer)
 * Model üzerinden yeni duyuru oluşturur ve View Layer ile HTML sonucu gösterir.
 */
const createAnnouncement = (req, res) => {
  const newAnnouncement = announcementModel.createAnnouncement(req && req.body);

  if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
    return res.status(201).json(newAnnouncement);
  }

  const view = getAnnouncementView();
  if (view && typeof view.renderAnnouncementCreatedPage === 'function') {
    const html = view.renderAnnouncementCreatedPage(newAnnouncement);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(201).send(html);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(201).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyuru Oluşturuldu</title></head><body><h1>Duyuru Başarıyla Oluşturuldu</h1><p>ID: ${newAnnouncement.id}</p><p>Başlık: ${newAnnouncement.title}</p></body></html>`);
};

/**
 * PUT /announcements/:id (Tam Güncelleme - HTML / View Layer)
 * Belirtilen ID'deki duyurunun tüm bilgilerini günceller (ID korunur).
 */
const updateAnnouncement = (req, res) => {
  const id = req && req.params && req.params.id;

  if (!id || isNaN(Number(id))) {
    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
    }
    const view = getAnnouncementView();
    if (view && typeof view.renderAnnouncementNotFoundPage === 'function') {
      const html = view.renderAnnouncementNotFoundPage(id);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(html);
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik duyuru ID'si</h1></body></html>`);
  }

  const updatedAnnouncement = announcementModel.updateAnnouncement(id, req && req.body);

  if (!updatedAnnouncement) {
    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(404).json({ message: "Duyuru bulunamadı" });
    }
    const view = getAnnouncementView();
    if (view && typeof view.renderAnnouncementNotFoundPage === 'function') {
      const html = view.renderAnnouncementNotFoundPage(id);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyuru Bulunamadı</title></head><body><h1>Duyuru bulunamadı</h1></body></html>`);
  }

  if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
    return res.status(200).json(updatedAnnouncement);
  }

  const view = getAnnouncementView();
  if (view && typeof view.renderAnnouncementUpdatedPage === 'function') {
    const html = view.renderAnnouncementUpdatedPage(updatedAnnouncement, { isPartial: false });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyuru Güncellendi</title></head><body><h1>Duyuru Başarıyla Güncellendi</h1><p>ID: ${updatedAnnouncement.id}</p><p>Başlık: ${updatedAnnouncement.title}</p></body></html>`);
};

/**
 * PATCH /announcements/:id (Kısmi Güncelleme - HTML / View Layer)
 * Belirtilen ID'deki duyurunun sadece gönderilen alanlarını kısmi olarak günceller.
 */
const patchAnnouncement = (req, res) => {
  const id = req && req.params && req.params.id;

  if (!id || isNaN(Number(id))) {
    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
    }
    const view = getAnnouncementView();
    if (view && typeof view.renderAnnouncementNotFoundPage === 'function') {
      const html = view.renderAnnouncementNotFoundPage(id);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(html);
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik duyuru ID'si</h1></body></html>`);
  }

  const updatedAnnouncement = announcementModel.patchAnnouncement(id, req && req.body);

  if (!updatedAnnouncement) {
    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(404).json({ message: "Duyuru bulunamadı" });
    }
    const view = getAnnouncementView();
    if (view && typeof view.renderAnnouncementNotFoundPage === 'function') {
      const html = view.renderAnnouncementNotFoundPage(id);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyuru Bulunamadı</title></head><body><h1>Duyuru bulunamadı</h1></body></html>`);
  }

  if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
    return res.status(200).json(updatedAnnouncement);
  }

  const view = getAnnouncementView();
  if (view && typeof view.renderAnnouncementUpdatedPage === 'function') {
    const html = view.renderAnnouncementUpdatedPage(updatedAnnouncement, { isPartial: true });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyuru Güncellendi</title></head><body><h1>Duyuru Kısmi Olarak Güncellendi</h1><p>ID: ${updatedAnnouncement.id}</p><p>Başlık: ${updatedAnnouncement.title}</p></body></html>`);
};

/**
 * DELETE /announcements/:id (Silme - HTML / View Layer)
 * Belirtilen ID'deki duyuruyu siler.
 */
const deleteAnnouncement = (req, res) => {
  const id = req && req.params && req.params.id;

  if (!id || isNaN(Number(id))) {
    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
    }
    const view = getAnnouncementView();
    if (view && typeof view.renderAnnouncementNotFoundPage === 'function') {
      const html = view.renderAnnouncementNotFoundPage(id);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(html);
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Geçersiz ID</title></head><body><h1>Geçersiz veya eksik duyuru ID'si</h1></body></html>`);
  }

  const isDeleted = announcementModel.deleteAnnouncement(id);

  if (!isDeleted) {
    if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(404).json({ message: "Duyuru bulunamadı" });
    }
    const view = getAnnouncementView();
    if (view && typeof view.renderAnnouncementNotFoundPage === 'function') {
      const html = view.renderAnnouncementNotFoundPage(id);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyuru Bulunamadı</title></head><body><h1>Duyuru bulunamadı</h1></body></html>`);
  }

  if (req && req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
    return res.status(204).send();
  }

  const view = getAnnouncementView();
  if (view && typeof view.renderAnnouncementDeletedPage === 'function') {
    const html = view.renderAnnouncementDeletedPage(id);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Duyuru Silindi</title></head><body><h1>Duyuru Başarıyla Silindi</h1><p>ID: ${id}</p></body></html>`);
};

module.exports = {
  getAnnouncements,
  getAllAnnouncements: getAnnouncements,
  getAnnouncement,
  getAnnouncementById: getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  patchAnnouncement,
  deleteAnnouncement
};
