const express = require('express');
const router = express.Router();
const apiJobPostingController = require('../controllers/apiJobPostingController');

// /api/job-postings CRUD rotaları (JSON REST API)
router.get('/', apiJobPostingController.getJobPostings);
router.post('/', apiJobPostingController.createJobPosting);
router.get('/:id', apiJobPostingController.getJobPosting);
router.put('/:id', apiJobPostingController.updateJobPosting);
router.patch('/:id', apiJobPostingController.patchJobPosting);
router.delete('/:id', apiJobPostingController.deleteJobPosting);

module.exports = router;
