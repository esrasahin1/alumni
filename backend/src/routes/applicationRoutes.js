const express = require('express');
const router = express.Router({ mergeParams: true });
const applicationController = require('../controllers/applicationController');

// Application CRUD rotaları (HTML View Layer)
router.get('/', applicationController.getApplications);
router.post('/', applicationController.createApplication);
router.get('/:id', applicationController.getApplication);
router.put('/:id', applicationController.updateApplication);
router.patch('/:id', applicationController.patchApplication);
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;
