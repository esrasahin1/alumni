const express = require('express');
const router = express.Router();
const apiUserController = require('../controllers/apiUserController');
const { requireAuth } = require('../middlewares/requireAuthMiddleware');

// /api/users CRUD rotaları (Protected)
router.use(requireAuth);
router.get('/', apiUserController.getUsers);
router.post('/', apiUserController.createUser);
router.get('/:id/jobs', apiUserController.getUserJobs);
router.post('/:id/jobs', apiUserController.createUserJob);
router.get('/:id', apiUserController.getUser);
router.put('/:id', apiUserController.updateUser);
router.patch('/:id', apiUserController.patchUser);
router.delete('/:id', apiUserController.deleteUser);

module.exports = router;
