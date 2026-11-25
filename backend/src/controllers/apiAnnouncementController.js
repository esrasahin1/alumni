const announcementModel = require('../models/announcementModel');
const { buildAnnouncementPayload } = require('./announcementController');
const { parsePositiveIntegerId, isAdminUser } = require('./accessHelpers');

/**
 * Controller: /api/announcements REST API isteklerini ve iş mantığını yönetir (JSON, MySQL)
 */

/**
 * GET /api/announcements
 * Public read access.
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
 * Public read access.
 */
const getAnnouncement = async (req, res) => {
  try {
    const announcementId = parsePositiveIntegerId(req && req.params && req.params.id);

    if (announcementId === null) {
      return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
    }

    const announcement = await announcementModel.getAnnouncementById(announcementId);

    if (!announcement) {
      return res.status(404).json({ message: "Duyuru bulunamadı" });
    }

    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * POST /api/announcements (Admin Only)
 */
const createAnnouncement = async (req, res) => {
  try {
    if (!isAdminUser(req && req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only administrators can create announcements.'
      });
    }

    const payload = buildAnnouncementPayload(req && req.body, false);
    const newAnnouncement = await announcementModel.createAnnouncement(payload);
    res.status(201).json(newAnnouncement);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * PUT /api/announcements/:id (Admin Only)
 */
const updateAnnouncement = async (req, res) => {
  try {
    if (!isAdminUser(req && req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only administrators can edit announcements.'
      });
    }

    const announcementId = parsePositiveIntegerId(req && req.params && req.params.id);
    if (announcementId === null) {
      return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
    }

    const payload = buildAnnouncementPayload(req && req.body, false);
    const updatedAnnouncement = await announcementModel.updateAnnouncement(announcementId, payload);

    if (!updatedAnnouncement) {
      return res.status(404).json({ message: "Duyuru bulunamadı" });
    }

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * PATCH /api/announcements/:id (Admin Only)
 */
const patchAnnouncement = async (req, res) => {
  try {
    if (!isAdminUser(req && req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only administrators can edit announcements.'
      });
    }

    const announcementId = parsePositiveIntegerId(req && req.params && req.params.id);
    if (announcementId === null) {
      return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
    }

    const payload = buildAnnouncementPayload(req && req.body, true);
    const updatedAnnouncement = await announcementModel.patchAnnouncement(announcementId, payload);

    if (!updatedAnnouncement) {
      return res.status(404).json({ message: "Duyuru bulunamadı" });
    }

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * DELETE /api/announcements/:id (Admin Only)
 */
const deleteAnnouncement = async (req, res) => {
  try {
    if (!isAdminUser(req && req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only administrators can delete announcements.'
      });
    }

    const announcementId = parsePositiveIntegerId(req && req.params && req.params.id);
    if (announcementId === null) {
      return res.status(400).json({ message: "Geçersiz veya eksik duyuru ID'si" });
    }

    const isDeleted = await announcementModel.deleteAnnouncement(announcementId);

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
