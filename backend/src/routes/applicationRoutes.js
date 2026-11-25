const express = require('express');
const router = express.Router({ mergeParams: true });
const applicationController = require('../controllers/applicationController');
const { requireAuth } = require('../middlewares/requireAuthMiddleware');
const { applicationCsrfProtection } = require('../middlewares/applicationCsrfMiddleware');

// Application CRUD rotaları (HTML View Layer; POST preserved for guest submission, review/management protected)
router.get('/', requireAuth, applicationCsrfProtection, applicationController.getApplications);
router.post('/', applicationCsrfProtection, applicationController.createApplication);
router.get('/:id', requireAuth, applicationCsrfProtection, applicationController.getApplication);
router.put('/:id', requireAuth, applicationCsrfProtection, applicationController.updateApplication);
router.patch('/:id', requireAuth, applicationCsrfProtection, applicationController.patchApplication);
router.delete('/:id', requireAuth, applicationCsrfProtection, applicationController.deleteApplication);

module.exports = router;
