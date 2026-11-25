const userModel = require('../models/userModel');
const jobPostingModel = require('../models/jobPostingModel');
const userView = require('../views/userView');
const userJobsView = require('../views/userJobsView');
const { getUserCsrfToken, getJobPostingCsrfToken } = require('../middlewares/mvcCsrfFactory');
const {
  escapeHtml,
  parsePositiveIntegerId,
  isAdminUser,
  isSelfUser,
  prefersJsonResponse,
  sendForbiddenResponse,
  sendBadRequestResponse,
  toPublicDirectoryUser,
  toSelfOrAdminUser
} = require('./accessHelpers');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildNonAdminSelfUpdatePayload(body, existingProfile, isPartial) {
  const input = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  let nextName = existingProfile.name;
  if (input.name !== undefined) {
    if (typeof input.name !== 'string') {
      const err = new Error('Name must be a valid string.');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    nextName = input.name.trim();
  } else if (!isPartial) {
    nextName = '';
  }

  if (!nextName || nextName.length > 255) {
    const err = new Error('Name is required and must not exceed 255 characters.');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  let nextDepartment = existingProfile.department;
  if (input.department !== undefined) {
    if (input.department !== null && typeof input.department !== 'string') {
      const err = new Error('Department must be a valid string.');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    const trimmedDept = typeof input.department === 'string' ? input.department.trim() : '';
    if (trimmedDept.length > 150) {
      const err = new Error('Department must not exceed 150 characters.');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    nextDepartment = trimmedDept !== '' ? trimmedDept : null;
  } else if (!isPartial) {
    nextDepartment = null;
  }

  let nextGradYear = existingProfile.graduation_year;
  if (input.graduation_year !== undefined) {
    const rawYear = input.graduation_year;
    if (rawYear === null || (typeof rawYear === 'string' && rawYear.trim() === '')) {
      nextGradYear = null;
    } else if (typeof rawYear === 'number' || typeof rawYear === 'string') {
      const strYear = String(rawYear).trim();
      const parsed = /^\d+$/.test(strYear) ? Number(strYear) : NaN;
      const maxYear = new Date().getFullYear() + 10;
      if (!Number.isInteger(parsed) || parsed < 1950 || parsed > maxYear) {
        const err = new Error(`Graduation year must be an integer between 1950 and ${maxYear}.`);
        err.code = 'VALIDATION_ERROR';
        throw err;
      }
      nextGradYear = parsed;
    } else {
      const err = new Error('Graduation year must be a valid year integer.');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
  } else if (!isPartial) {
    nextGradYear = null;
  }

  return {
    name: nextName,
    department: nextDepartment,
    graduation_year: nextGradYear
  };
}

/**
 * Controller: User işlemlerini ve iş mantığını yönetir (View Layer entegrasyonlu, MySQL destekli)
 */

/**
 * GET /users (Kullanıcı Listesi - View Layer)
 * Logged-in users see a limited read-only directory; only Admin sees management controls.
 */
const getUsers = async (req, res) => {
  try {
    const rawUsers = await userModel.getDirectoryUsers();
    const isAdmin = isAdminUser(req && req.user);
    const directoryUsers = rawUsers.map((u) => (isAdmin ? toSelfOrAdminUser(u) : toPublicDirectoryUser(u)));

    if (prefersJsonResponse(req)) {
      return res.status(200).json(directoryUsers);
    }

    const html = userView.renderUsersPage(directoryUsers, req.user || null, {
      isAdminView: isAdmin,
      csrfToken: getUserCsrfToken(req, res)
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * GET /users/:id (Kullanıcı Detayı - View Layer)
 * Displays only public-appropriate profile info to other users; full self info to owner/Admin.
 */
const getUser = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;
    const rawUser = await userModel.getDirectoryUserById(id);

    if (!rawUser) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      const html = userView.renderUserNotFoundPage(id, req.user || null);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }

    const isAdmin = isAdminUser(req && req.user);
    const isSelf = isSelfUser(req && req.user, rawUser.id);
    const safeUser = (isAdmin || isSelf) ? toSelfOrAdminUser(rawUser) : toPublicDirectoryUser(rawUser);

    if (prefersJsonResponse(req)) {
      return res.status(200).json(safeUser);
    }

    const html = userView.renderUserDetailPage(safeUser, req.user || null, {
      isAdmin,
      isSelf
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * POST /users (Yeni Kullanıcı Oluşturma - Admin Only)
 */
const createUser = async (req, res) => {
  try {
    if (!isAdminUser(req && req.user)) {
      return sendForbiddenResponse(req, res, 'Only administrators can create user accounts.', '/users');
    }

    const body = req && req.body && typeof req.body === 'object' ? req.body : {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!name || !email || !EMAIL_REGEX.test(email) || name.length > 255 || email.length > 255) {
      return sendBadRequestResponse(req, res, 'Valid name and email are required.', '/users');
    }

    const newUser = await userModel.createUser({ name, email });

    if (prefersJsonResponse(req)) {
      return res.status(201).json(newUser);
    }

    const html = userView.renderUserCreatedPage(newUser, req.user || null);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(201).send(html);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (prefersJsonResponse(req)) {
        return res.status(409).json({ message: "Bu e-posta adresi zaten kullanımda." });
      }
      return res.status(409).send('Hata: Bu e-posta adresi zaten kullanımda.');
    }
    res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

const handleProfileOrAdminUpdate = async (req, res, isPartial) => {
  try {
    const id = req && req.params && req.params.id;
    const targetId = parsePositiveIntegerId(id);
    if (targetId === null) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      const html = userView.renderUserNotFoundPage(id, req.user || null);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }

    const isAdmin = isAdminUser(req && req.user);
    const isSelf = isSelfUser(req && req.user, targetId);

    if (!isAdmin && !isSelf) {
      return sendForbiddenResponse(req, res, 'You can only update your own profile.', `/users/${targetId}`);
    }

    let updatedUser = null;
    if (isAdmin) {
      const body = req && req.body && typeof req.body === 'object' ? req.body : {};
      if (!isPartial) {
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        if (!name || !email || !EMAIL_REGEX.test(email) || name.length > 255 || email.length > 255) {
          return sendBadRequestResponse(req, res, 'Valid name and email are required.', `/users/${targetId}`);
        }
        updatedUser = await userModel.updateUser(targetId, { name, email }, false);
      } else {
        const patchData = {};
        if (body.name !== undefined) {
          if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 255) {
            return sendBadRequestResponse(req, res, 'Name must be a non-empty string up to 255 characters.', `/users/${targetId}`);
          }
          patchData.name = body.name.trim();
        }
        if (body.email !== undefined) {
          if (typeof body.email !== 'string' || !EMAIL_REGEX.test(body.email.trim()) || body.email.trim().length > 255) {
            return sendBadRequestResponse(req, res, 'Email must be a valid address.', `/users/${targetId}`);
          }
          patchData.email = body.email.trim().toLowerCase();
        }
        updatedUser = await userModel.patchUser(targetId, patchData);
      }
    } else {
      // Non-admin self: strictly whitelist name, department, graduation_year (never email/role/auth_role/password_hash)
      const existingProfile = await userModel.getProfileById(targetId);
      if (!existingProfile) {
        if (prefersJsonResponse(req)) {
          return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }
        const html = userView.renderUserNotFoundPage(id, req.user || null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html);
      }
      const safePayload = buildNonAdminSelfUpdatePayload(req.body, existingProfile, isPartial);
      updatedUser = await userModel.updateOwnProfile(targetId, safePayload);
    }

    if (!updatedUser) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      const html = userView.renderUserNotFoundPage(id, req.user || null);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }

    const safeResponse = toSelfOrAdminUser(updatedUser);
    if (prefersJsonResponse(req)) {
      return res.status(200).json(safeResponse);
    }

    const html = userView.renderUserUpdatedPage(safeResponse, { isPartial, currentUser: req.user || null });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      return sendBadRequestResponse(req, res, error.message, '/users');
    }
    if (error && error.code === 'ER_DUP_ENTRY') {
      if (prefersJsonResponse(req)) {
        return res.status(409).json({ message: "Bu e-posta adresi zaten kullanımda." });
      }
      return res.status(409).send('Hata: Bu e-posta adresi zaten kullanımda.');
    }
    return res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

const updateUser = async (req, res) => handleProfileOrAdminUpdate(req, res, false);
const patchUser = async (req, res) => handleProfileOrAdminUpdate(req, res, true);

/**
 * DELETE /users/:id (Silme - Admin Only)
 */
const deleteUser = async (req, res) => {
  try {
    if (!isAdminUser(req && req.user)) {
      return sendForbiddenResponse(req, res, 'Only administrators can delete user accounts.', '/users');
    }

    const id = req && req.params && req.params.id;
    if (parsePositiveIntegerId(id) === null) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      const html = userView.renderUserNotFoundPage(id, req.user || null);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }

    const isDeleted = await userModel.deleteUser(id);

    if (!isDeleted) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      const html = userView.renderUserNotFoundPage(id, req.user || null);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }

    if (prefersJsonResponse(req)) {
      return res.status(204).send();
    }

    const html = userView.renderUserDeletedPage(id, req.user || null);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    if (error && error.code === 'CANNOT_DELETE_LAST_ADMIN') {
      if (prefersJsonResponse(req)) {
        return res.status(409).json({ success: false, message: error.message });
      }
      return res.status(409).send(escapeHtml(error.message));
    }
    res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

/**
 * GET /users/:id/jobs (Kullanıcının Oluşturduğu İş İlanları - Strictly Self or Admin)
 */
const getUserJobs = async (req, res) => {
  try {
    const id = req && req.params && req.params.id;
    const targetUserId = parsePositiveIntegerId(id);

    if (targetUserId === null) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      const html = userView.renderUserNotFoundPage(id, req.user || null);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }

    const isAdmin = isAdminUser(req && req.user);
    const isSelf = isSelfUser(req && req.user, targetUserId);
    if (!isAdmin && !isSelf) {
      return sendForbiddenResponse(req, res, 'You can only view and manage your own job postings.', '/job-postings');
    }

    const user = await userModel.getDirectoryUserById(targetUserId);
    if (!user) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      const html = userView.renderUserNotFoundPage(id, req.user || null);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }

    const jobPostings = await jobPostingModel.getJobPostingsByUserId(targetUserId);

    if (jobPostings === null) {
      if (prefersJsonResponse(req)) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      const html = userView.renderUserNotFoundPage(id, req.user || null);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }

    if (prefersJsonResponse(req)) {
      return res.status(200).json(jobPostings);
    }

    const html = userJobsView.renderUserJobsPage(toSelfOrAdminUser(user), jobPostings, req.user || null, {
      canManage: isAdmin || isSelf,
      isAdminView: isAdmin,
      csrfToken: getJobPostingCsrfToken(req, res)
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (error) {
    if (prefersJsonResponse(req)) {
      return res.status(500).json({ message: "Sunucu hatası: " + error.message });
    }
    res.status(500).send('Internal Server Error: ' + escapeHtml(error.message));
  }
};

module.exports = {
  buildNonAdminSelfUpdatePayload,
  getUsers,
  getUser,
  getUserJobs,
  createUser,
  updateUser,
  patchUser,
  deleteUser
};
