const express = require('express');
const router = express.Router();
const jobPostingController = require('../controllers/jobPostingController');

// Job Posting CRUD rotaları (HTML View Layer)
router.get('/', jobPostingController.getJobPostings);
router.post('/', jobPostingController.createJobPosting);
router.get('/:id', jobPostingController.getJobPosting);
router.put('/:id', jobPostingController.updateJobPosting);
router.patch('/:id', jobPostingController.patchJobPosting);
router.delete('/:id', jobPostingController.deleteJobPosting);

module.exports = router;
