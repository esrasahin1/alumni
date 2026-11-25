const express = require('express');
const router = express.Router({ mergeParams: true });
const applicationController = require('../controllers/applicationController');
const { requireAuth } = require('../middlewares/requireAuthMiddleware');

// Application CRUD rotaları (HTML View Layer; POST preserved for guest submission, review/management protected)
router.get('/', requireAuth, applicationController.getApplications);
router.post('/', applicationController.createApplication);
router.get('/:id', requireAuth, applicationController.getApplication);
router.put('/:id', requireAuth, applicationController.updateApplication);
router.patch('/:id', requireAuth, applicationController.patchApplication);
router.delete('/:id', requireAuth, applicationController.deleteApplication);

module.exports = router;
