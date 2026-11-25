const express = require('express');
const router = express.Router();
const apiJobPostingController = require('../controllers/apiJobPostingController');
const { requireAuth } = require('../middlewares/requireAuthMiddleware');

// /api/job-postings CRUD rotaları (JSON REST API; GET public, mutations protected)
router.get('/', apiJobPostingController.getJobPostings);
router.post('/', requireAuth, apiJobPostingController.createJobPosting);
router.get('/:id', apiJobPostingController.getJobPosting);
router.put('/:id', requireAuth, apiJobPostingController.updateJobPosting);
router.patch('/:id', requireAuth, apiJobPostingController.patchJobPosting);
router.delete('/:id', requireAuth, apiJobPostingController.deleteJobPosting);

module.exports = router;
