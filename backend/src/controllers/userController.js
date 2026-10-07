const userModel = require('../models/userModel');
const userView = require('../views/userView');

/**
 * Controller: User işlemlerini ve iş mantığını yönetir (View Layer entegrasyonlu)
 */

/**
 * GET /users (Kullanıcı Listesi - View Layer)
 * Model'den kullanıcıları alır ve View Layer ile HTML olarak render eder.
 */
const getUsers = (req, res) => {
  const users = userModel.getAllUsers();

  // İstemci açıkça sadece JSON talep ederse (API istemcileri için esneklik)
  if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
    return res.status(200).json(users);
  }

  // Varsayılan: View Layer üzerinden HTML sayfası render edilir
  const html = userView.renderUsersPage(users);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
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
 * POST /users (Yeni Kullanıcı Oluşturma - View Layer)
 * Model üzerinden yeni kullanıcı oluşturur ve View Layer ile HTML sonucu gösterir.
 */
const createUser = (req, res) => {
  const newUser = userModel.createUser(req.body);

  // İstemci açıkça sadece JSON talep ederse (API istemcileri için esneklik)
  if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
    return res.status(201).json(newUser);
  }

  // Varsayılan: View Layer üzerinden HTML başarı sayfası render edilir
  const html = userView.renderUserCreatedPage(newUser);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(201).send(html);
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
