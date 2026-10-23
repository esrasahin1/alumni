const userModel = require('../models/userModel');
const jobPostingModel = require('../models/jobPostingModel');
const userView = require('../views/userView');

/**
 * Controller: User işlemlerini ve iş mantığını yönetir (View Layer entegrasyonlu, MySQL destekli)
 */

/**
 * GET /users (Kullanıcı Listesi - View Layer)
 * Model'den kullanıcıları alır ve View Layer ile HTML olarak render eder.
 */
const getUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();

    // İstemci açıkça sadece JSON talep ederse (API istemcileri için esneklik)
    if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(200).json(users);
    }

    // Varsayılan: View Layer üzerinden HTML sayfası render edilir
    const html = userView.renderUsersPage(users);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * GET /users/:id (Kullanıcı Detayı - View Layer)
 * ID'ye göre tek bir kullanıcıyı getirir.
 */
const getUser = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id);

    if (!user) {
      if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      const html = userView.renderUserNotFoundPage(req.params.id);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }

    if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(200).json(user);
    }

    const html = userView.renderUserDetailPage(user);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * POST /users (Yeni Kullanıcı Oluşturma - View Layer)
 * Model üzerinden yeni kullanıcı oluşturur ve View Layer ile HTML sonucu gösterir.
 */
const createUser = async (req, res) => {
  try {
    const newUser = await userModel.createUser(req.body);

    // İstemci açıkça sadece JSON talep ederse (API istemcileri için esneklik)
    if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(201).json(newUser);
    }

    // Varsayılan: View Layer üzerinden HTML başarı sayfası render edilir
    const html = userView.renderUserCreatedPage(newUser);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(201).send(html);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(409).json({ message: "Bu e-posta adresi zaten kullanımda." });
      }
      return res.status(409).send('Hata: Bu e-posta adresi zaten kullanımda.');
    }
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * PUT /users/:id (Tam Güncelleme - View Layer)
 * Belirtilen ID'deki kullanıcının tüm bilgilerini günceller (ID korunur).
 */
const updateUser = async (req, res) => {
  try {
    const updatedUser = await userModel.updateUser(req.params.id, req.body);

    if (!updatedUser) {
      if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      const html = userView.renderUserNotFoundPage(req.params.id);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }

    if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(200).json(updatedUser);
    }

    const html = userView.renderUserUpdatedPage(updatedUser, { isPartial: false });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(409).json({ message: "Bu e-posta adresi zaten kullanımda." });
      }
      return res.status(409).send('Hata: Bu e-posta adresi zaten kullanımda.');
    }
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * PATCH /users/:id (Kısmi Güncelleme - View Layer)
 * Belirtilen ID'deki kullanıcının alanlarını kısmi olarak günceller.
 */
const patchUser = async (req, res) => {
  try {
    const updatedUser = await userModel.patchUser(req.params.id, req.body);

    if (!updatedUser) {
      if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      const html = userView.renderUserNotFoundPage(req.params.id);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }

    if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(200).json(updatedUser);
    }

    const html = userView.renderUserUpdatedPage(updatedUser, { isPartial: true });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(409).json({ message: "Bu e-posta adresi zaten kullanımda." });
      }
      return res.status(409).send('Hata: Bu e-posta adresi zaten kullanımda.');
    }
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * DELETE /users/:id (Silme - View Layer)
 * Belirtilen ID'deki kullanıcıyı siler.
 */
const deleteUser = async (req, res) => {
  try {
    const isDeleted = await userModel.deleteUser(req.params.id);

    if (!isDeleted) {
      if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      const html = userView.renderUserNotFoundPage(req.params.id);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }

    if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(204).send();
    }

    const html = userView.renderUserDeletedPage(req.params.id);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

/**
 * GET /users/:id/jobs (Kullanıcının Oluşturduğu İş İlanları - Nested Route)
 */
const getUserJobs = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      if (req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      const html = userView.renderUserNotFoundPage(id);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }

    const jobPostings = await jobPostingModel.getJobPostingsByUserId(id);

    if (jobPostings === null) {
      if (req.headers && req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      const html = userView.renderUserNotFoundPage(id);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }

    return res.status(200).json(jobPostings);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  getUserJobs,
  createUser,
  updateUser,
  patchUser,
  deleteUser
};
