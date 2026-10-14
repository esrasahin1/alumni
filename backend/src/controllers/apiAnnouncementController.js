const announcementModel = require('../models/announcementModel');

/**
 * Controller: /api/announcements REST API isteklerini ve iş mantığını yönetir (JSON, MySQL)
 */

/**
 * GET /api/announcements
 * Tüm duyuruları JSON listesi olarak döner.
 */
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await announcementModel.getAllAnnouncements();
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * GET /api/announcements/:id
 * ID'ye göre tek bir duyuruyu getirir (Bulunamazsa 404, geçersiz ID ise 400 döner).
 */
const getAnnouncement = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
    }

    const announcement = await announcementModel.getAnnouncementById(id);

    if (!announcement) {
      return res.status(404).json({ message: "Duyuru bulunamadı" });
    }

    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * POST /api/announcements
 * Yeni bir duyuru oluşturur ve JSON döner (201 Created).
 */
const createAnnouncement = async (req, res) => {
  try {
    const newAnnouncement = await announcementModel.createAnnouncement(req && req.body);
    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * PUT /api/announcements/:id
 * Belirtilen ID'deki duyurunun tüm bilgilerini günceller (ID korunur).
 */
const updateAnnouncement = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
    }

    const updatedAnnouncement = await announcementModel.updateAnnouncement(id, req && req.body);

    if (!updatedAnnouncement) {
      return res.status(404).json({ message: "Duyuru bulunamadı" });
    }

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * PATCH /api/announcements/:id
 * Belirtilen ID'deki duyurunun sadece gönderilen alanlarını kısmi olarak günceller.
 */
const patchAnnouncement = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
    }

    const updatedAnnouncement = await announcementModel.patchAnnouncement(id, req && req.body);

    if (!updatedAnnouncement) {
      return res.status(404).json({ message: "Duyuru bulunamadı" });
    }

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * DELETE /api/announcements/:id
 * Belirtilen ID'deki duyuruyu siler (204 No Content veya 404 Not Found döner).
 */
const deleteAnnouncement = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
    }

    const isDeleted = await announcementModel.deleteAnnouncement(id);

    if (!isDeleted) {
      return res.status(404).json({ message: "Duyuru bulunamadı" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
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
