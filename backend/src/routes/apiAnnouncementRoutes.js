const express = require('express');
const router = express.Router();
const apiAnnouncementController = require('../controllers/apiAnnouncementController');
const { requireAuth } = require('../middlewares/requireAuthMiddleware');

// /api/announcements CRUD rotaları (GET public, mutations protected)
router.get('/', apiAnnouncementController.getAnnouncements);
router.post('/', requireAuth, apiAnnouncementController.createAnnouncement);
router.get('/:id', apiAnnouncementController.getAnnouncement);
router.put('/:id', requireAuth, apiAnnouncementController.updateAnnouncement);
router.patch('/:id', requireAuth, apiAnnouncementController.patchAnnouncement);
router.delete('/:id', requireAuth, apiAnnouncementController.deleteAnnouncement);

module.exports = router;
