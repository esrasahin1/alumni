const userModel = require('../models/userModel');
const apiUserView = require('../views/apiUserView');

/**
 * Controller: /api/users API isteklerini ve iş mantığını yönetir (View Layer destekli)
 */

/**
 * GET /api/users (Tüm Kullanıcılar - View Layer / API)
 * Eklenen tüm kullanıcıları View Layer (HTML) veya JSON olarak döner.
 */
const getUsers = (req, res) => {
  const users = userModel.getAllUsers();

  if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
    return res.status(200).json(users);
  }

  const html = apiUserView.renderUsersPage(users);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};

/**
 * GET /api/users/:id (Kullanıcı Detayı - View Layer / API)
 * ID'ye göre tek bir kullanıcıyı getirir (Bulunamazsa 404 döner).
 */
const getUser = (req, res) => {
  const user = userModel.getUserById(req.params.id);

  if (!user) {
    if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    const html = apiUserView.renderUserNotFoundPage(req.params.id);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(html);
  }

  if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
    return res.status(200).json(user);
  }

  const html = apiUserView.renderUserDetailPage(user);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};

/**
 * POST /api/users (Yeni Kullanıcı Oluşturma - View Layer / API)
 * Request body'den gelen kullanıcı bilgisini alır, Model ile oluşturur ve HTML/JSON döner.
 */
const createUser = (req, res) => {
  const newUser = userModel.createUser(req.body);

  if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
    return res.status(201).json(newUser);
  }

  const html = apiUserView.renderUserCreatedPage(newUser);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(201).send(html);
};

/**
 * PUT /api/users/:id (Tam Güncelleme - View Layer / API)
 * Belirtilen kullanıcının tüm bilgilerini günceller (ID korunur).
 */
const updateUser = (req, res) => {
  const updatedUser = userModel.updateUser(req.params.id, req.body);

  if (!updatedUser) {
    if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    const html = apiUserView.renderUserNotFoundPage(req.params.id);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(html);
  }

  if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
    return res.status(200).json(updatedUser);
  }

  const html = apiUserView.renderUserUpdatedPage(updatedUser, { isPartial: false });
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};

/**
 * PATCH /api/users/:id (Kısmi Güncelleme - View Layer / API)
 * Belirtilen kullanıcının sadece gönderilen alanlarını kısmi olarak günceller.
 */
const patchUser = (req, res) => {
  const updatedUser = userModel.patchUser(req.params.id, req.body);

  if (!updatedUser) {
    if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    const html = apiUserView.renderUserNotFoundPage(req.params.id);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(html);
  }

  if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
    return res.status(200).json(updatedUser);
  }

  const html = apiUserView.renderUserUpdatedPage(updatedUser, { isPartial: true });
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};

/**
 * DELETE /api/users/:id (Silme - View Layer / API)
 * Belirtilen ID'deki kullanıcıyı siler.
 */
const deleteUser = (req, res) => {
  const isDeleted = userModel.deleteUser(req.params.id);

  if (!isDeleted) {
    if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    const html = apiUserView.renderUserNotFoundPage(req.params.id);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(html);
  }

  if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
    return res.status(204).send();
  }

  const html = apiUserView.renderUserDeletedPage(req.params.id);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  patchUser,
  deleteUser
};
