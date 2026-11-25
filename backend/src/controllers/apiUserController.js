const userModel = require('../models/userModel');
const jobPostingModel = require('../models/jobPostingModel');
const { buildNonAdminSelfUpdatePayload } = require('./userController');
const { buildAndValidateJobPostingPayload } = require('./jobPostingHelpers');
const {
  parsePositiveIntegerId,
  isAdminUser,
  isSelfUser,
  toPublicDirectoryUser,
  toSelfOrAdminUser
} = require('./accessHelpers');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Controller: /api/users REST API isteklerini ve iş mantığını yönetir (JSON, MySQL)
 */

/**
 * GET /api/users (Kullanıcı Dizini - REST API)
 * Returns public-safe directory fields for standard users; full safe records for Admin.
 */
const getUsers = async (req, res) => {
  try {
    const rawUsers = await userModel.getDirectoryUsers();
    const isAdmin = isAdminUser(req && req.user);
    const directoryUsers = rawUsers.map((u) => (isAdmin ? toSelfOrAdminUser(u) : toPublicDirectoryUser(u)));
    return res.status(200).json(directoryUsers);
  } catch (error) {
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * GET /api/users/:id (Kullanıcı Detayı - REST API)
 * Shows public-safe profile fields to peers, full safe profile to self/Admin.
 */
const getUser = async (req, res) => {
  try {
    const rawUser = await userModel.getDirectoryUserById(req && req.params && req.params.id);

    if (!rawUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const isAdmin = isAdminUser(req && req.user);
    const isSelf = isSelfUser(req && req.user, rawUser.id);
    const safeUser = (isAdmin || isSelf) ? toSelfOrAdminUser(rawUser) : toPublicDirectoryUser(rawUser);

    return res.status(200).json(safeUser);
  } catch (error) {
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * POST /api/users (Yeni Kullanıcı Oluşturma - Admin Only)
 */
const createUser = async (req, res) => {
  try {
    if (!isAdminUser(req && req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only administrators can create user accounts.'
      });
    }

    const body = req && req.body && typeof req.body === 'object' ? req.body : {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!name || !email || !EMAIL_REGEX.test(email) || name.length > 255 || email.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Valid name and email are required.'
      });
    }

    const newUser = await userModel.createUser({ name, email });
    return res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Bu e-posta adresi zaten kullanımda." });
    }
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

const handleApiUserUpdate = async (req, res, isPartial) => {
  try {
    const targetId = parsePositiveIntegerId(req && req.params && req.params.id);
    if (targetId === null) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const isAdmin = isAdminUser(req && req.user);
    const isSelf = isSelfUser(req && req.user, targetId);

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own profile.'
      });
    }

    let updatedUser = null;
    if (isAdmin) {
      const body = req && req.body && typeof req.body === 'object' ? req.body : {};
      if (!isPartial) {
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        if (!name || !email || !EMAIL_REGEX.test(email) || name.length > 255 || email.length > 255) {
          return res.status(400).json({
            success: false,
            message: 'Valid name and email are required.'
          });
        }
        updatedUser = await userModel.updateUser(targetId, { name, email }, false);
      } else {
        const patchData = {};
        if (body.name !== undefined) {
          if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 255) {
            return res.status(400).json({
              success: false,
              message: 'Name must be a non-empty string up to 255 characters.'
            });
          }
          patchData.name = body.name.trim();
        }
        if (body.email !== undefined) {
          if (typeof body.email !== 'string' || !EMAIL_REGEX.test(body.email.trim()) || body.email.trim().length > 255) {
            return res.status(400).json({
              success: false,
              message: 'Email must be a valid address.'
            });
          }
          patchData.email = body.email.trim().toLowerCase();
        }
        updatedUser = await userModel.patchUser(targetId, patchData);
      }
    } else {
      const existingProfile = await userModel.getProfileById(targetId);
      if (!existingProfile) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      const safePayload = buildNonAdminSelfUpdatePayload(req.body, existingProfile, isPartial);
      updatedUser = await userModel.updateOwnProfile(targetId, safePayload);
    }

    if (!updatedUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    return res.status(200).json(toSelfOrAdminUser(updatedUser));
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Bu e-posta adresi zaten kullanımda." });
    }
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

const updateUser = async (req, res) => handleApiUserUpdate(req, res, false);
const patchUser = async (req, res) => handleApiUserUpdate(req, res, true);

/**
 * DELETE /api/users/:id (Silme - Admin Only)
 */
const deleteUser = async (req, res) => {
  try {
    if (!isAdminUser(req && req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only administrators can delete user accounts.'
      });
    }

    const id = req && req.params && req.params.id;
    if (parsePositiveIntegerId(id) === null) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const isDeleted = await userModel.deleteUser(id);

    if (!isDeleted) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    return res.status(204).send();
  } catch (error) {
    if (error && error.code === 'CANNOT_DELETE_LAST_ADMIN') {
      return res.status(409).json({ success: false, message: error.message });
    }
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * GET /api/users/:id/jobs (Kullanıcının Oluşturduğu İş İlanları - Strictly Self or Admin)
 */
const getUserJobs = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;
    const targetUserId = parsePositiveIntegerId(id);

    if (targetUserId === null) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    if (!isAdminUser(req && req.user) && !isSelfUser(req && req.user, targetUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view your own job postings.'
      });
    }

    const jobPostings = await jobPostingModel.getJobPostingsByUserId(targetUserId);

    if (jobPostings === null) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    return res.status(200).json(jobPostings);
  } catch (error) {
    return res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

/**
 * POST /api/users/:id/jobs (Kullanıcı Adına Yeni İş İlanı Oluşturma - Strictly Self or Admin)
 */
const createUserJob = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;
    const targetUserId = parsePositiveIntegerId(id);

    if (targetUserId === null) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    if (!isAdminUser(req && req.user) && !isSelfUser(req && req.user, targetUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only create job postings under your own account.'
      });
    }

    const user = await userModel.getDirectoryUserById(targetUserId);

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const jobPayload = buildAndValidateJobPostingPayload(req, {
      isPartial: false,
      existingJobPosting: null,
      isAdmin: isAdminUser(req && req.user),
      forcedUserId: targetUserId
    });

    const newJobPosting = await jobPostingModel.createJobPosting(jobPayload);
    return res.status(201).json(newJobPosting);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ message: error.message });
    }
    if (error && error.code === 'TITLE_TOO_LONG') {
      return res.status(400).json({ message: error.message });
    }
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
