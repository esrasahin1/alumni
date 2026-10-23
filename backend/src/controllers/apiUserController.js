const userModel = require('../models/userModel');
const jobPostingModel = require('../models/jobPostingModel');
const apiUserView = require('../views/apiUserView');

/**
 * Controller: /api/users API isteklerini ve iş mantığını yönetir (View Layer destekli, MySQL)
 */

/**
 * GET /api/users (Tüm Kullanıcılar - View Layer / API)
 * Eklenen tüm kullanıcıları View Layer (HTML) veya JSON olarak döner.
 */
const getUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();

    if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(200).json(users);
    }

    const html = apiUserView.renderUsersPage(users);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * GET /api/users/:id (Kullanıcı Detayı - View Layer / API)
 * ID'ye göre tek bir kullanıcıyı getirir (Bulunamazsa 404 döner).
 */
const getUser = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id);

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
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * POST /api/users (Yeni Kullanıcı Oluşturma - View Layer / API)
 * Request body'den gelen kullanıcı bilgisini alır, Model ile oluşturur ve HTML/JSON döner.
 */
const createUser = async (req, res) => {
  try {
    const newUser = await userModel.createUser(req.body);

    if (req.headers.accept === 'application/json' && !req.headers.accept.includes('text/html')) {
      return res.status(201).json(newUser);
    }

    const html = apiUserView.renderUserCreatedPage(newUser);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(201).send(html);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Bu e-posta adresi zaten kullanımda." });
    }
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * PUT /api/users/:id (Tam Güncelleme - View Layer / API)
 * Belirtilen kullanıcının tüm bilgilerini günceller (ID korunur).
 */
const updateUser = async (req, res) => {
  try {
    const updatedUser = await userModel.updateUser(req.params.id, req.body);

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
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Bu e-posta adresi zaten kullanımda." });
    }
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * PATCH /api/users/:id (Kısmi Güncelleme - View Layer / API)
 * Belirtilen kullanıcının sadece gönderilen alanlarını kısmi olarak günceller.
 */
const patchUser = async (req, res) => {
  try {
    const updatedUser = await userModel.patchUser(req.params.id, req.body);

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
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Bu e-posta adresi zaten kullanımda." });
    }
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * DELETE /api/users/:id (Silme - View Layer / API)
 * Belirtilen ID'deki kullanıcıyı siler.
 */
const deleteUser = async (req, res) => {
  try {
    const isDeleted = await userModel.deleteUser(req.params.id);

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
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * GET /api/users/:id/jobs (Kullanıcının Oluşturduğu İş İlanları - Nested API Route)
 * Belirli bir kullanıcının oluşturduğu iş ilanlarını JSON dizisi olarak döner.
 * - Kullanıcı bulunamazsa: 404 Not Found { message: "Kullanıcı bulunamadı" }
 * - Kullanıcı mevcut ama ilanı yoksa: 200 OK []
 * - Kullanıcı mevcut ve ilanları varsa: 200 OK [ { ... }, { ... } ]
 */
const getUserJobs = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const jobPostings = await jobPostingModel.getJobPostingsByUserId(id);

    if (jobPostings === null) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    return res.status(200).json(jobPostings);
  } catch (error) {
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * POST /api/users/:id/jobs (Kullanıcı Adına Yeni İş İlanı Oluşturma - Nested API Route)
 * Belirli bir kullanıcının ID'sini (id) URL'den alarak o kullanıcı adına yeni bir iş ilanı oluşturur.
 * - Kullanıcı bulunamazsa veya geçersiz ID ise: 404 Not Found { message: "Kullanıcı bulunamadı" }
 * - Zorunlu alanlar (title, company, description) eksikse: 400 Bad Request
 * - Sahiplik belirlemek için URL'deki ID kullanılır; body içindeki user_id dikkate alınmaz.
 * - Başarılı: 201 Created ve oluşturulan iş ilanı nesnesi (user_id = URL'deki ID)
 */
const createUserJob = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;

    if (!id || isNaN(Number(id))) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const targetUserId = Number(id);
    const user = await userModel.getUserById(targetUserId);

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const body = req && req.body;
    const title = body && body.title !== undefined ? String(body.title).trim() : '';
    const company = body && body.company !== undefined ? String(body.company).trim() : '';
    const description = body && body.description !== undefined ? String(body.description).trim() : '';

    if (!title || !company || !description) {
      return res.status(400).json({
        message: "Başlık (title), şirket (company) ve açıklama (description) alanları zorunludur."
      });
    }

    // Body içinde user_id / userId ne gönderilirse gönderilsin URL'den alınan targetUserId esas alınır
    const jobPayload = {
      ...(body || {}),
      user_id: targetUserId,
      userId: targetUserId
    };

    const newJobPosting = await jobPostingModel.createJobPosting(jobPayload);
    return res.status(201).json(newJobPosting);
  } catch (error) {
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  getUserJobs,
  createUserJob,
  createUser,
  updateUser,
  patchUser,
  deleteUser
};
