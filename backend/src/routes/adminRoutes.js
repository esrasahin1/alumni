const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middlewares/requireAuthMiddleware');
const { requireAdmin } = require('../middlewares/requireAdminMiddleware');
const { adminCsrfProtection } = require('../middlewares/adminCsrfMiddleware');

// Protect all /admin MVC routes: authenticated admin + synchronizer CSRF token for form POSTs
router.use(requireAuth, requireAdmin, adminCsrfProtection);

router.get('/', adminController.showDashboard);

// Users management
router.get('/users', adminController.listUsers);
router.post('/users', adminController.createUser);
router.get('/users/:id/edit', adminController.showEditUser);
router.post('/users/:id', adminController.updateUser);
router.post('/users/:id/delete', adminController.deleteUser);

// Announcements management
router.get('/announcements', adminController.listAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.get('/announcements/:id/edit', adminController.showEditAnnouncement);
router.post('/announcements/:id', adminController.updateAnnouncement);
router.post('/announcements/:id/delete', adminController.deleteAnnouncement);

// Job Postings management
router.get('/job-postings', adminController.listJobPostings);
router.post('/job-postings', adminController.createJobPosting);
router.get('/job-postings/:id/edit', adminController.showEditJobPosting);
router.post('/job-postings/:id', adminController.updateJobPosting);
router.post('/job-postings/:id/delete', adminController.deleteJobPosting);

// Applications management
router.get('/applications', adminController.listApplications);
router.post('/applications', adminController.createApplication);
router.get('/applications/:id/edit', adminController.showEditApplication);
router.post('/applications/:id', adminController.updateApplication);
router.post('/applications/:id/delete', adminController.deleteApplication);

module.exports = router;
