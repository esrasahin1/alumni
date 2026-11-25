const express = require('express');
const router = express.Router();
const jobPostingController = require('../controllers/jobPostingController');
const { requireAuth } = require('../middlewares/requireAuthMiddleware');
const { applicationCsrfProtection } = require('../middlewares/applicationCsrfMiddleware');
const { jobPostingCsrfProtection } = require('../middlewares/mvcCsrfFactory');

// Job Posting CRUD rotaları (HTML View Layer; GET public, mutations protected with ownership & CSRF)
router.get('/', jobPostingCsrfProtection, jobPostingController.getJobPostings);
router.post('/', requireAuth, jobPostingCsrfProtection, jobPostingController.createJobPosting);
router.get('/:id', applicationCsrfProtection, jobPostingCsrfProtection, jobPostingController.getJobPosting);
router.put('/:id', requireAuth, jobPostingCsrfProtection, jobPostingController.updateJobPosting);
router.patch('/:id', requireAuth, jobPostingCsrfProtection, jobPostingController.patchJobPosting);
router.delete('/:id', requireAuth, jobPostingCsrfProtection, jobPostingController.deleteJobPosting);

module.exports = router;
