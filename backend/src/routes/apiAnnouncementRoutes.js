const express = require('express');
const router = express.Router();
const apiAnnouncementController = require('../controllers/apiAnnouncementController');
const { requireAuth } = require('../middlewares/requireAuthMiddleware');
const { requireAdmin } = require('../middlewares/requireAdminMiddleware');

// /api/announcements CRUD rotaları (GET public, mutations strictly Admin protected)
router.get('/', apiAnnouncementController.getAnnouncements);
router.post('/', requireAuth, requireAdmin, apiAnnouncementController.createAnnouncement);
router.get('/:id', apiAnnouncementController.getAnnouncement);
router.put('/:id', requireAuth, requireAdmin, apiAnnouncementController.updateAnnouncement);
router.patch('/:id', requireAuth, requireAdmin, apiAnnouncementController.patchAnnouncement);
router.delete('/:id', requireAuth, requireAdmin, apiAnnouncementController.deleteAnnouncement);

module.exports = router;
