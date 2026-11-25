const express = require('express');
const router = express.Router({ mergeParams: true });
const apiApplicationController = require('../controllers/apiApplicationController');
const { requireAuth } = require('../middlewares/requireAuthMiddleware');

// /api/applications CRUD rotaları (JSON REST API; POST preserved for guest submission, review/management protected)
router.get('/', requireAuth, apiApplicationController.getApplications);
router.post('/', apiApplicationController.createApplication);
router.get('/:id', requireAuth, apiApplicationController.getApplication);
router.put('/:id', requireAuth, apiApplicationController.updateApplication);
router.patch('/:id', requireAuth, apiApplicationController.patchApplication);
router.delete('/:id', requireAuth, apiApplicationController.deleteApplication);

module.exports = router;
