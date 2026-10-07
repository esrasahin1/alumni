const express = require('express');
const router = express.Router();
const apiUserController = require('../controllers/apiUserController');

// /api/users CRUD rotaları
router.get('/', apiUserController.getUsers);
router.post('/', apiUserController.createUser);
router.get('/:id', apiUserController.getUser);
router.put('/:id', apiUserController.updateUser);
router.patch('/:id', apiUserController.patchUser);
router.delete('/:id', apiUserController.deleteUser);

module.exports = router;
