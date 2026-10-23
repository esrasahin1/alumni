const userModel = require('../models/userModel');
const jobPostingModel = require('../models/jobPostingModel');

/**
 * Controller: /api/users REST API isteklerini ve iş mantığını yönetir (JSON, MySQL)
 */

/**
 * GET /api/users (Tüm Kullanıcılar - REST API)
 * Tüm kullanıcıları JSON listesi olarak döner.
 */
const getUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * GET /api/users/:id (Kullanıcı Detayı - REST API)
 * ID'ye göre tek bir kullanıcıyı JSON olarak getirir (Bulunamazsa 404 döner).
 */
const getUser = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * POST /api/users (Yeni Kullanıcı Oluşturma - REST API)
 * Request body'den gelen kullanıcı bilgisiyle yeni kullanıcı oluşturur ve JSON döner (201 Created).
 */
const createUser = async (req, res) => {
  try {
    const newUser = await userModel.createUser(req.body);
    return res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Bu e-posta adresi zaten kullanımda." });
    }
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * PUT /api/users/:id (Tam Güncelleme - REST API)
 * Belirtilen kullanıcının tüm bilgilerini günceller ve JSON döner (ID korunur).
 */
const updateUser = async (req, res) => {
  try {
    const updatedUser = await userModel.updateUser(req.params.id, req.body);

    if (!updatedUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Bu e-posta adresi zaten kullanımda." });
    }
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * PATCH /api/users/:id (Kısmi Güncelleme - REST API)
 * Belirtilen kullanıcının sadece gönderilen alanlarını kısmi olarak günceller ve JSON döner.
 */
const patchUser = async (req, res) => {
  try {
    const updatedUser = await userModel.patchUser(req.params.id, req.body);

    if (!updatedUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Bu e-posta adresi zaten kullanımda." });
    }
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * DELETE /api/users/:id (Silme - REST API)
 * Belirtilen ID'deki kullanıcıyı siler (204 No Content veya 404 Not Found döner).
 */
const deleteUser = async (req, res) => {
  try {
    const isDeleted = await userModel.deleteUser(req.params.id);

    if (!isDeleted) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
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
