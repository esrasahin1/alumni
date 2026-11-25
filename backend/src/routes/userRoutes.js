const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middlewares/requireAuthMiddleware');
const { userCsrfProtection, jobPostingCsrfProtection } = require('../middlewares/mvcCsrfFactory');

// User CRUD rotaları (Protected + Role/Ownership enforced in controller + CSRF on MVC mutations)
router.use(requireAuth);
router.get('/', userCsrfProtection, userController.getUsers);
router.post('/', userCsrfProtection, userController.createUser);
router.get('/:id/jobs', jobPostingCsrfProtection, userController.getUserJobs);
router.get('/:id', userCsrfProtection, userController.getUser);
router.put('/:id', userCsrfProtection, userController.updateUser);
router.patch('/:id', userCsrfProtection, userController.patchUser);
router.delete('/:id', userCsrfProtection, userController.deleteUser);

module.exports = router;
