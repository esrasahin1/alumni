const announcementModel = require('../models/announcementModel');

/**
 * Controller: /api/announcements REST API isteklerini ve iş mantığını yönetir (JSON)
 */

/**
 * GET /api/announcements
 * Tüm duyuruları JSON listesi olarak döner.
 */
const getAnnouncements = (req, res) => {
  const announcements = announcementModel.getAllAnnouncements();
  res.status(200).json(announcements);
};

/**
 * GET /api/announcements/:id
 * ID'ye göre tek bir duyuruyu getirir (Bulunamazsa 404, geçersiz ID ise 400 döner).
 */
const getAnnouncement = (req, res) => {
  const id = req && req.params && req.params.id;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
  }

  const announcement = announcementModel.getAnnouncementById(id);

  if (!announcement) {
    return res.status(404).json({ message: "Duyuru bulunamadı" });
  }

  res.status(200).json(announcement);
};

/**
 * POST /api/announcements
 * Yeni bir duyuru oluşturur ve JSON döner (201 Created).
 */
const createAnnouncement = (req, res) => {
  const newAnnouncement = announcementModel.createAnnouncement(req && req.body);
  res.status(201).json(newAnnouncement);
};

/**
 * PUT /api/announcements/:id
 * Belirtilen ID'deki duyurunun tüm bilgilerini günceller (ID korunur).
 */
const updateAnnouncement = (req, res) => {
  const id = req && req.params && req.params.id;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
  }

  const updatedAnnouncement = announcementModel.updateAnnouncement(id, req && req.body);

  if (!updatedAnnouncement) {
    return res.status(404).json({ message: "Duyuru bulunamadı" });
  }

  res.status(200).json(updatedAnnouncement);
};

/**
 * PATCH /api/announcements/:id
 * Belirtilen ID'deki duyurunun sadece gönderilen alanlarını kısmi olarak günceller.
 */
const patchAnnouncement = (req, res) => {
  const id = req && req.params && req.params.id;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
  }

  const updatedAnnouncement = announcementModel.patchAnnouncement(id, req && req.body);

  if (!updatedAnnouncement) {
    return res.status(404).json({ message: "Duyuru bulunamadı" });
  }

  res.status(200).json(updatedAnnouncement);
};

/**
 * DELETE /api/announcements/:id
 * Belirtilen ID'deki duyuruyu siler (204 No Content veya 404 Not Found döner).
 */
const deleteAnnouncement = (req, res) => {
  const id = req && req.params && req.params.id;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
  }

  const isDeleted = announcementModel.deleteAnnouncement(id);

  if (!isDeleted) {
    return res.status(404).json({ message: "Duyuru bulunamadı" });
  }

  res.status(204).send();
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
