const express = require('express');
const router = express.Router();
const apiAdminController = require('../controllers/apiAdminController');
const { requireAuth } = require('../middlewares/requireAuthMiddleware');
const { requireAdmin } = require('../middlewares/requireAdminMiddleware');

// Protect all /api/admin REST API routes: 401 when unauthenticated, 403 when non-admin
router.use(requireAuth, requireAdmin);

router.get('/summary', apiAdminController.getSummary);

// Users API
router.get('/users', apiAdminController.getAllUsers);
router.get('/users/:id', apiAdminController.getUserById);
router.post('/users', apiAdminController.createUser);
router.put('/users/:id', apiAdminController.updateUser);
router.patch('/users/:id', apiAdminController.updateUser);
router.delete('/users/:id', apiAdminController.deleteUser);

// Announcements API
router.get('/announcements', apiAdminController.getAllAnnouncements);
router.get('/announcements/:id', apiAdminController.getAnnouncementById);
router.post('/announcements', apiAdminController.createAnnouncement);
router.put('/announcements/:id', apiAdminController.updateAnnouncement);
router.patch('/announcements/:id', apiAdminController.updateAnnouncement);
router.delete('/announcements/:id', apiAdminController.deleteAnnouncement);

// Job Postings API
router.get('/job-postings', apiAdminController.getAllJobPostings);
router.get('/job-postings/:id', apiAdminController.getJobPostingById);
router.post('/job-postings', apiAdminController.createJobPosting);
router.put('/job-postings/:id', apiAdminController.updateJobPosting);
router.patch('/job-postings/:id', apiAdminController.updateJobPosting);
router.delete('/job-postings/:id', apiAdminController.deleteJobPosting);

// Applications API
router.get('/applications', apiAdminController.getAllApplications);
router.get('/applications/:id', apiAdminController.getApplicationById);
router.post('/applications', apiAdminController.createApplication);
router.put('/applications/:id', apiAdminController.updateApplication);
router.patch('/applications/:id', apiAdminController.updateApplication);
router.delete('/applications/:id', apiAdminController.deleteApplication);

module.exports = router;
