const userModel = require('../models/userModel');

/**
 * Controller: User işlemlerini ve iş mantığını yönetir
 */

/**
 * GET /users (veya tüm kullanıcıları listeleme)
 * Tüm kullanıcıları döner.
 */
const getUsers = (req, res) => {
  const users = userModel.getAllUsers();
  res.status(200).json(users);
};

/**
 * GET /users/:id
 * ID'ye göre tek bir kullanıcıyı getirir.
 */
const getUser = (req, res) => {
  const user = userModel.getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı" });
  }

  res.status(200).json(user);
};

/**
 * POST /users
 * Yeni bir kullanıcı oluşturur.
 */
const createUser = (req, res) => {
  const newUser = userModel.createUser(req.body);
  res.status(201).json(newUser);
};

/**
 * PUT /users/:id
 * Belirtilen ID'deki kullanıcının tüm bilgilerini günceller (ID korunur).
 */
const updateUser = (req, res) => {
  const updatedUser = userModel.updateUser(req.params.id, req.body);

  if (!updatedUser) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı" });
  }

  res.status(200).json(updatedUser);
};

/**
 * PATCH /users/:id
 * Belirtilen ID'deki kullanıcının alanlarını kısmi olarak günceller.
 */
const patchUser = (req, res) => {
  const updatedUser = userModel.patchUser(req.params.id, req.body);

  if (!updatedUser) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı" });
  }

  res.status(200).json(updatedUser);
};

/**
 * DELETE /users/:id
 * Belirtilen ID'deki kullanıcıyı siler.
 */
const deleteUser = (req, res) => {
  const isDeleted = userModel.deleteUser(req.params.id);

  if (!isDeleted) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı" });
  }

  res.status(204).send();
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  patchUser,
  deleteUser
};
