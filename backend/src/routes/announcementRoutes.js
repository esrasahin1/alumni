const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');

// Announcement CRUD rotaları
router.get('/', announcementController.getAnnouncements);
router.post('/', announcementController.createAnnouncement);
router.get('/:id', announcementController.getAnnouncement);
router.put('/:id', announcementController.updateAnnouncement);
router.patch('/:id', announcementController.patchAnnouncement);
router.delete('/:id', announcementController.deleteAnnouncement);

module.exports = router;
