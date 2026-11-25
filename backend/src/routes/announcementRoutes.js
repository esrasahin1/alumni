const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { requireAuth } = require('../middlewares/requireAuthMiddleware');

// Announcement CRUD rotaları (GET public, mutations protected)
router.get('/', announcementController.getAnnouncements);
router.post('/', requireAuth, announcementController.createAnnouncement);
router.get('/:id', announcementController.getAnnouncement);
router.put('/:id', requireAuth, announcementController.updateAnnouncement);
router.patch('/:id', requireAuth, announcementController.patchAnnouncement);
router.delete('/:id', requireAuth, announcementController.deleteAnnouncement);

module.exports = router;
