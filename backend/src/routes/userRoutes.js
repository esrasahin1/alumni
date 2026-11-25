const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middlewares/requireAuthMiddleware');

// User CRUD rotaları (Protected)
router.use(requireAuth);
router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.get('/:id/jobs', userController.getUserJobs);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.patch('/:id', userController.patchUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
