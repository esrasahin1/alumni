const userModel = require('../models/userModel');

/**
 * Controller: /api/users API isteklerini ve iş mantığını yönetir
 */

/**
 * GET /api/users
 * Eklenen tüm kullanıcıları JSON listesi olarak döner.
 */
const getUsers = (req, res) => {
  const users = userModel.getAllUsers();
  res.status(200).json(users);
};

/**
 * GET /api/users/:id
 * ID'ye göre tek bir kullanıcıyı getirir (Bulunamazsa 404 döner).
 */
const getUser = (req, res) => {
  const user = userModel.getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı" });
  }

  res.status(200).json(user);
};

/**
 * POST /api/users
 * Request body'den gelen kullanıcı bilgisini alır, Model ile oluşturur ve JSON döner (201 Created).
 */
const createUser = (req, res) => {
  const newUser = userModel.createUser(req.body);
  res.status(201).json(newUser);
};

/**
 * PUT /api/users/:id
 * Belirtilen kullanıcının tüm bilgilerini günceller (ID korunur).
 */
const updateUser = (req, res) => {
  const updatedUser = userModel.updateUser(req.params.id, req.body);

  if (!updatedUser) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı" });
  }

  res.status(200).json(updatedUser);
};

/**
 * PATCH /api/users/:id
 * Belirtilen kullanıcının sadece gönderilen alanlarını kısmi olarak günceller.
 */
const patchUser = (req, res) => {
  const updatedUser = userModel.patchUser(req.params.id, req.body);

  if (!updatedUser) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı" });
  }

  res.status(200).json(updatedUser);
};

/**
 * DELETE /api/users/:id
 * Belirtilen ID'deki kullanıcıyı siler (204 No Content veya 404 Not Found döner).
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
