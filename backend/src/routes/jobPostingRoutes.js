const express = require('express');
const router = express.Router();
const jobPostingController = require('../controllers/jobPostingController');
const { requireAuth } = require('../middlewares/requireAuthMiddleware');

// Job Posting CRUD rotaları (HTML View Layer; GET public, mutations protected)
router.get('/', jobPostingController.getJobPostings);
router.post('/', requireAuth, jobPostingController.createJobPosting);
router.get('/:id', jobPostingController.getJobPosting);
router.put('/:id', requireAuth, jobPostingController.updateJobPosting);
router.patch('/:id', requireAuth, jobPostingController.patchJobPosting);
router.delete('/:id', requireAuth, jobPostingController.deleteJobPosting);

module.exports = router;
