const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middlewares/requireAuthMiddleware');
const { profileCsrfProtection } = require('../middlewares/profileCsrfMiddleware');

// Personal Profile routes (authenticated users only + session-bound CSRF; strictly scoped to req.user.id)
router.use(requireAuth, profileCsrfProtection);
router.get('/', profileController.showProfilePage);
router.post('/', profileController.updateProfile);

module.exports = router;
