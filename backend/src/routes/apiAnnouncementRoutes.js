const express = require('express');
const router = express.Router();
const apiAnnouncementController = require('../controllers/apiAnnouncementController');

// /api/announcements CRUD rotaları
router.get('/', apiAnnouncementController.getAnnouncements);
router.post('/', apiAnnouncementController.createAnnouncement);
router.get('/:id', apiAnnouncementController.getAnnouncement);
router.put('/:id', apiAnnouncementController.updateAnnouncement);
router.patch('/:id', apiAnnouncementController.patchAnnouncement);
router.delete('/:id', apiAnnouncementController.deleteAnnouncement);

module.exports = router;
