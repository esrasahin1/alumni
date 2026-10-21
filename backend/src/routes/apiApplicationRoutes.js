const express = require('express');
const router = express.Router({ mergeParams: true });
const apiApplicationController = require('../controllers/apiApplicationController');

// /api/applications CRUD rotaları (JSON REST API)
router.get('/', apiApplicationController.getApplications);
router.post('/', apiApplicationController.createApplication);
router.get('/:id', apiApplicationController.getApplication);
router.put('/:id', apiApplicationController.updateApplication);
router.patch('/:id', apiApplicationController.patchApplication);
router.delete('/:id', apiApplicationController.deleteApplication);

module.exports = router;
