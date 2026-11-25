const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { requireAuth } = require('../middlewares/requireAuthMiddleware');
const { requireAdmin } = require('../middlewares/requireAdminMiddleware');
const { announcementCsrfProtection } = require('../middlewares/mvcCsrfFactory');

// Announcement CRUD rotaları (GET public, mutations strictly Admin + CSRF protected)
router.get('/', announcementCsrfProtection, announcementController.getAnnouncements);
router.post('/', requireAuth, requireAdmin, announcementCsrfProtection, announcementController.createAnnouncement);
router.get('/:id', announcementCsrfProtection, announcementController.getAnnouncement);
router.put('/:id', requireAuth, requireAdmin, announcementCsrfProtection, announcementController.updateAnnouncement);
router.patch('/:id', requireAuth, requireAdmin, announcementCsrfProtection, announcementController.patchAnnouncement);
router.delete('/:id', requireAuth, requireAdmin, announcementCsrfProtection, announcementController.deleteAnnouncement);

module.exports = router;
