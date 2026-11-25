const { getPool } = require('../config/db');

// In-memory array kept for backward compatibility if imported directly
const users = [];

/**
 * Returns all users from MySQL ordered by id.
 * @returns {Promise<Array>} List of users
 */
const getAllUsers = async () => {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, name, email, created_at, updated_at FROM users ORDER BY id ASC'
  );
  return rows;
};

/**
 * Finds a single user by ID.
 * @param {number|string} id - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
const getUserById = async (id) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return null;
  }
  const userId = Number(id);
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [userId]
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Finds safe session-context user details by ID (excluding password_hash).
 * Used by authContextMiddleware without altering public CRUD response shapes.
 * @param {number|string} id - User ID
 * @returns {Promise<Object|null>} Safe user identity object or null
 */
const getSessionUserById = async (id) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return null;
  }
  const userId = Number(id);
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, name, email, role, auth_role, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [userId]
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Creates a new user in MySQL.
 * @param {Object} userData - User data { name, email }
 * @returns {Promise<Object>} Created user object
 */
const createUser = async (userData = {}) => {
  const name = userData.name !== undefined ? String(userData.name) : '';
  const email = userData.email !== undefined ? String(userData.email) : '';

  const pool = await getPool();
  const [result] = await pool.query(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [name, email]
  );

  return await getUserById(result.insertId);
};

/**
 * Updates a user by ID in MySQL (full PUT or partial PATCH).
 * @param {number|string} id - User ID
 * @param {Object} userData - New user data
 * @param {boolean} [isPartial=false] - Partial update flag
 * @returns {Promise<Object|null>} Updated user or null if not found
 */
const updateUser = async (id, userData = {}, isPartial = false) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return null;
  }
  const userId = Number(id);
  const existingUser = await getUserById(userId);

  if (!existingUser) {
    return null;
  }

  const pool = await getPool();
  let updatedName = existingUser.name;
  let updatedEmail = existingUser.email;

  if (isPartial) {
    if (userData.name !== undefined) updatedName = String(userData.name);
    if (userData.email !== undefined) updatedEmail = String(userData.email);
  } else {
    updatedName = userData.name !== undefined ? String(userData.name) : '';
    updatedEmail = userData.email !== undefined ? String(userData.email) : '';
  }

  await pool.query(
    'UPDATE users SET name = ?, email = ? WHERE id = ?',
    [updatedName, updatedEmail, userId]
  );

  return await getUserById(userId);
};

/**
 * Partially updates a user by ID (PATCH).
 * @param {number|string} id - User ID
 * @param {Object} partialData - Partial fields to update
 * @returns {Promise<Object|null>}
 */
const patchUser = async (id, partialData) => {
  return await updateUser(id, partialData, true);
};

/**
 * Safely deletes a user by ID inside a transaction:
 * - Blocks deletion of the sole administrator account.
 * - Detaches dependent applications (user_id = NULL) before removing the user.
 * @param {number|string} id
 * @returns {Promise<{deleted: boolean, detachedApplicationsCount?: number}>}
 */
const safeDeleteUserById = async (id) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return { deleted: false };
  }
  const userId = Number(id);
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [userRows] = await connection.query(
      'SELECT id, auth_role FROM users WHERE id = ? LIMIT 1 FOR UPDATE',
      [userId]
    );
    if (userRows.length === 0) {
      await connection.rollback();
      return { deleted: false };
    }

    if (userRows[0].auth_role === 'admin') {
      const [adminRows] = await connection.query(
        "SELECT id FROM users WHERE auth_role = 'admin' FOR UPDATE"
      );
      if (adminRows.length <= 1) {
        await connection.rollback();
        throw createModelError('CANNOT_DELETE_LAST_ADMIN', 'Cannot delete the sole administrator account.');
      }
    }

    const [appUpdate] = await connection.query(
      'UPDATE applications SET user_id = NULL WHERE user_id = ?',
      [userId]
    );

    const [deleteResult] = await connection.query('DELETE FROM users WHERE id = ?', [userId]);
    await connection.commit();

    return {
      deleted: deleteResult.affectedRows > 0,
      detachedApplicationsCount: appUpdate.affectedRows || 0
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_) {
      // Ignore rollback failure when transaction already ended
    }
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Deletes a user by ID from MySQL safely inside a transaction.
 * @param {number|string} id - User ID
 * @returns {Promise<boolean>} True if deleted, false if user not found
 */
const deleteUser = async (id) => {
  const result = await safeDeleteUserById(id);
  return Boolean(result.deleted);
};

/**
 * Finds a single user by normalized email for authentication/registration checks.
 * Note: Returns password_hash for internal verification only; never pass directly to views/APIs.
 * @param {string} email - User email address
 * @returns {Promise<Object|null>} User record or null if not found
 */
const getUserByEmail = async (email) => {
  if (typeof email !== 'string' || email.trim() === '') {
    return null;
  }
  const normalizedEmail = email.trim().toLowerCase();
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, name, email, password_hash, role, auth_role, department, graduation_year, created_at, updated_at FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail]
  );
  return rows.length > 0 ? rows[0] : null;
};

const ALLOWED_REGISTRATION_ROLES = new Set(['student', 'alumni']);
const MIN_GRADUATION_YEAR = 1950;

/**
 * Creates a newly registered user in MySQL using explicitly allowed fields.
 * Applies defensive validation and never returns password_hash in the returned public user object.
 * @param {Object} userData - { name, email, password_hash, role, department, graduation_year }
 * @returns {Promise<Object>} Public created user object (without password_hash)
 */
const createRegisteredUser = async (userData = {}) => {
  const data = userData && typeof userData === 'object' ? userData : {};

  if (typeof data.name !== 'string' || data.name.trim() === '') {
    const err = new Error('User name must be a non-empty string.');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  const name = data.name.trim();

  if (typeof data.email !== 'string' || data.email.trim() === '') {
    const err = new Error('User email must be a non-empty string.');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  const email = data.email.trim().toLowerCase();

  if (typeof data.password_hash !== 'string' || data.password_hash.trim() === '') {
    const err = new Error('User password_hash must be a non-empty string.');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  const passwordHash = data.password_hash;

  const role = typeof data.role === 'string' ? data.role.trim() : '';
  if (!ALLOWED_REGISTRATION_ROLES.has(role)) {
    const err = new Error('User role must be either "student" or "alumni".');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const department = data.department !== undefined && data.department !== null && String(data.department).trim() !== ''
    ? String(data.department).trim()
    : null;

  let graduationYear = null;
  if (data.graduation_year !== undefined && data.graduation_year !== null && String(data.graduation_year).trim() !== '') {
    const maxGraduationYear = new Date().getFullYear() + 10;
    let parsedYear = NaN;

    if (typeof data.graduation_year === 'number') {
      parsedYear = data.graduation_year;
    } else if (typeof data.graduation_year === 'string' && /^\d+$/.test(data.graduation_year.trim())) {
      parsedYear = Number(data.graduation_year.trim());
    }

    if (!Number.isInteger(parsedYear) || parsedYear < MIN_GRADUATION_YEAR || parsedYear > maxGraduationYear) {
      const err = new Error(`Graduation year must be an integer between ${MIN_GRADUATION_YEAR} and ${maxGraduationYear}.`);
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    graduationYear = parsedYear;
  }

  const pool = await getPool();
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, role, auth_role, department, graduation_year) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, email, passwordHash, role, 'user', department, graduationYear]
  );

  const [rows] = await pool.query(
    'SELECT id, name, email, role, auth_role, department, graduation_year, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [result.insertId]
  );
  return rows.length > 0 ? rows[0] : null;
};

const ALLOWED_ADMIN_USER_ROLES = ['student', 'alumni'];
const ALLOWED_AUTH_ROLES = ['user', 'admin'];

const createModelError = (code, message) => {
  const err = new Error(message);
  err.code = code;
  return err;
};

const normalizeOptionalUserRole = (role) => {
  if (role === undefined || role === null || String(role).trim() === '') {
    return null;
  }
  const normalized = String(role).trim().toLowerCase();
  if (!ALLOWED_ADMIN_USER_ROLES.includes(normalized)) {
    throw createModelError('VALIDATION_ERROR', 'role must be student, alumni, or empty.');
  }
  return normalized;
};

const normalizeAuthRole = (authRole, defaultRole = 'user') => {
  if (authRole === undefined || authRole === null || String(authRole).trim() === '') {
    return defaultRole;
  }
  const normalized = String(authRole).trim().toLowerCase();
  if (!ALLOWED_AUTH_ROLES.includes(normalized)) {
    throw createModelError('VALIDATION_ERROR', 'auth_role must be user or admin.');
  }
  return normalized;
};

const normalizeOptionalDepartment = (department) => {
  if (department === undefined || department === null || String(department).trim() === '') {
    return null;
  }
  return String(department).trim();
};

const normalizeOptionalGraduationYear = (graduationYear) => {
  if (graduationYear === undefined || graduationYear === null || String(graduationYear).trim() === '') {
    return null;
  }
  const parsed = Number(graduationYear);
  const maxYear = new Date().getFullYear() + 10;
  if (!Number.isInteger(parsed) || parsed < 1950 || parsed > maxYear) {
    throw createModelError('VALIDATION_ERROR', `graduation_year must be an integer between 1950 and ${maxYear}.`);
  }
  return parsed;
};

/**
 * Returns safe user directory rows (excluding password_hash) with role, department, and graduation_year.
 * @returns {Promise<Array>}
 */
const getDirectoryUsers = async () => {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, name, email, role, auth_role, department, graduation_year, created_at, updated_at FROM users ORDER BY id ASC'
  );
  return rows;
};

/**
 * Finds a single directory user by strict positive integer ID (excluding password_hash).
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
const getDirectoryUserById = async (id) => {
  if (typeof id !== 'number' && typeof id !== 'string') {
    return null;
  }
  const normalizedId = typeof id === 'number' ? id : (/^\d+$/.test(id.trim()) ? Number(id.trim()) : NaN);
  if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
    return null;
  }
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, name, email, role, auth_role, department, graduation_year, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [normalizedId]
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Returns all users for the Admin Panel (never exposes password_hash).
 * @returns {Promise<Array>}
 */
const getAllUsersAdmin = async () => {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, name, email, role, auth_role, department, graduation_year, created_at, updated_at FROM users ORDER BY id DESC'
  );
  return rows;
};

/**
 * Returns a single user for the Admin Panel (never exposes password_hash).
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
const getUserAdminById = async (id) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return null;
  }
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, name, email, role, auth_role, department, graduation_year, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [Number(id)]
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Returns safe personal profile details for the authenticated user (never exposes password_hash).
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
const getProfileById = async (id) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return null;
  }
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, name, email, role, auth_role, department, graduation_year, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [userId]
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Updates only safe self-editable profile fields (name, department, graduation_year) for the user's own account.
 * Never modifies role, auth_role, email, or password_hash.
 * @param {number|string} id
 * @param {Object} profileData
 * @returns {Promise<Object|null>}
 */
const updateOwnProfile = async (id, profileData = {}) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return null;
  }
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  const data = profileData && typeof profileData === 'object' ? profileData : {};
  const normalizedName = typeof data.name === 'string' ? data.name.trim() : '';
  if (!normalizedName || normalizedName.length > 255) {
    throw createModelError('VALIDATION_ERROR', 'Name must be between 1 and 255 characters.');
  }

  const normalizedDepartment = normalizeOptionalDepartment(data.department);
  if (normalizedDepartment !== null && normalizedDepartment.length > 150) {
    throw createModelError('VALIDATION_ERROR', 'Department must be at most 150 characters.');
  }

  const normalizedGraduationYear = normalizeOptionalGraduationYear(data.graduation_year);

  const pool = await getPool();
  const [result] = await pool.query(
    'UPDATE users SET name = ?, department = ?, graduation_year = ? WHERE id = ?',
    [normalizedName, normalizedDepartment, normalizedGraduationYear, userId]
  );
  if (!result || result.affectedRows === 0) {
    return null;
  }

  return await getProfileById(userId);
};

/**
 * Counts how many users currently hold the admin authorization role.
 * @returns {Promise<number>}
 */
const countAdmins = async () => {
  const pool = await getPool();
  const [rows] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE auth_role = 'admin'");
  return Number(rows[0]?.count || 0);
};

/**
 * Counts related records owned by or linked to a user.
 * @param {number|string} id
 * @returns {Promise<{jobPostingsCount: number, applicationsCount: number}>}
 */
const getUserDependencies = async (id) => {
  const userId = Number(id);
  const pool = await getPool();
  const [jobRows] = await pool.query('SELECT COUNT(*) AS count FROM job_postings WHERE user_id = ?', [userId]);
  const [appRows] = await pool.query('SELECT COUNT(*) AS count FROM applications WHERE user_id = ?', [userId]);
  return {
    jobPostingsCount: Number(jobRows[0]?.count || 0),
    applicationsCount: Number(appRows[0]?.count || 0)
  };
};

const isSingleAdminUniqueError = (error) => {
  return Boolean(
    error &&
    error.code === 'ER_DUP_ENTRY' &&
    String(error.message || '').includes('uq_users_single_admin')
  );
};

/**
 * Creates a user from the Admin Panel with validated fields while enforcing max 1 admin.
 * @param {Object} data
 * @returns {Promise<Object|null>}
 */
const createUserAdmin = async ({ name, email, password_hash, role, auth_role, department, graduation_year }) => {
  if (typeof name !== 'string' || name.trim() === '') {
    throw createModelError('VALIDATION_ERROR', 'Name must be a non-empty string.');
  }
  if (typeof email !== 'string' || email.trim() === '') {
    throw createModelError('VALIDATION_ERROR', 'Email must be a non-empty string.');
  }
  if (typeof password_hash !== 'string' || password_hash.trim() === '') {
    throw createModelError('VALIDATION_ERROR', 'Password hash must be a non-empty string.');
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRole = normalizeOptionalUserRole(role);
  const normalizedAuthRole = normalizeAuthRole(auth_role, 'user');
  const normalizedDepartment = normalizeOptionalDepartment(department);
  const normalizedGraduationYear = normalizeOptionalGraduationYear(graduation_year);

  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (normalizedAuthRole === 'admin') {
      const [adminRows] = await connection.query(
        "SELECT id FROM users WHERE auth_role = 'admin' FOR UPDATE"
      );
      if (adminRows.length >= 1) {
        await connection.rollback();
        throw createModelError(
          'SINGLE_ADMIN_EXISTS',
          'Only one administrator account is allowed in the system.'
        );
      }
    }

    const [result] = await connection.query(
      'INSERT INTO users (name, email, password_hash, role, auth_role, department, graduation_year) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        normalizedName,
        normalizedEmail,
        password_hash,
        normalizedRole,
        normalizedAuthRole,
        normalizedDepartment,
        normalizedGraduationYear
      ]
    );

    const [createdRows] = await connection.query(
      'SELECT id, name, email, role, auth_role, department, graduation_year, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [result.insertId]
    );
    await connection.commit();
    return createdRows.length > 0 ? createdRows[0] : null;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_) {
      // Ignore rollback failure when transaction already ended
    }
    if (isSingleAdminUniqueError(error)) {
      throw createModelError(
        'SINGLE_ADMIN_EXISTS',
        'Only one administrator account is allowed in the system.'
      );
    }
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Updates a user from the Admin Panel inside a transaction with row locking:
 * - Enforces at most 1 administrator account in the system.
 * - Blocks demoting the sole administrator account.
 * @param {number|string} id
 * @param {Object} data
 * @returns {Promise<Object|null>}
 */
const updateUserAdmin = async (id, data = {}) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return null;
  }
  const userId = Number(id);
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.query(
      'SELECT id, name, email, role, auth_role, department, graduation_year, created_at, updated_at FROM users WHERE id = ? LIMIT 1 FOR UPDATE',
      [userId]
    );
    if (existingRows.length === 0) {
      await connection.rollback();
      return null;
    }
    const existing = existingRows[0];

    const nextName = data.name !== undefined ? String(data.name).trim() : existing.name;
    const nextEmail = data.email !== undefined ? String(data.email).trim().toLowerCase() : existing.email;
    if (!nextName) {
      throw createModelError('VALIDATION_ERROR', 'Name must be a non-empty string.');
    }
    if (!nextEmail) {
      throw createModelError('VALIDATION_ERROR', 'Email must be a non-empty string.');
    }

    const nextRole = data.role !== undefined ? normalizeOptionalUserRole(data.role) : existing.role;
    const nextAuthRole = data.auth_role !== undefined ? normalizeAuthRole(data.auth_role, existing.auth_role) : existing.auth_role;
    const nextDepartment = data.department !== undefined ? normalizeOptionalDepartment(data.department) : existing.department;
    const nextGraduationYear =
      data.graduation_year !== undefined
        ? normalizeOptionalGraduationYear(data.graduation_year)
        : existing.graduation_year;

    if (existing.auth_role !== nextAuthRole) {
      const [adminRows] = await connection.query(
        "SELECT id FROM users WHERE auth_role = 'admin' FOR UPDATE"
      );

      if (existing.auth_role === 'admin' && nextAuthRole !== 'admin' && adminRows.length <= 1) {
        await connection.rollback();
        throw createModelError('CANNOT_DEMOTE_LAST_ADMIN', 'Cannot demote the sole administrator account.');
      }

      if (existing.auth_role !== 'admin' && nextAuthRole === 'admin' && adminRows.length >= 1) {
        await connection.rollback();
        throw createModelError(
          'SINGLE_ADMIN_EXISTS',
          'Only one administrator account is allowed in the system.'
        );
      }
    }

    if (typeof data.password_hash === 'string' && data.password_hash.trim() !== '') {
      await connection.query(
        'UPDATE users SET name = ?, email = ?, password_hash = ?, role = ?, auth_role = ?, department = ?, graduation_year = ? WHERE id = ?',
        [nextName, nextEmail, data.password_hash, nextRole, nextAuthRole, nextDepartment, nextGraduationYear, existing.id]
      );
    } else {
      await connection.query(
        'UPDATE users SET name = ?, email = ?, role = ?, auth_role = ?, department = ?, graduation_year = ? WHERE id = ?',
        [nextName, nextEmail, nextRole, nextAuthRole, nextDepartment, nextGraduationYear, existing.id]
      );
    }

    const [updatedRows] = await connection.query(
      'SELECT id, name, email, role, auth_role, department, graduation_year, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [existing.id]
    );
    await connection.commit();
    return updatedRows.length > 0 ? updatedRows[0] : null;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_) {
      // Ignore rollback failure when transaction already ended
    }
    if (isSingleAdminUniqueError(error)) {
      throw createModelError(
        'SINGLE_ADMIN_EXISTS',
        'Only one administrator account is allowed in the system.'
      );
    }
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Safely deletes a user from the Admin Panel inside a transaction.
 * Blocks deletion of the sole admin and detaches dependent applications (user_id = NULL).
 * @param {number|string} id
 * @returns {Promise<{deleted: boolean, detachedApplicationsCount?: number}>}
 */
const deleteUserAdmin = async (id) => {
  return await safeDeleteUserById(id);
};

/**
 * Promotes an existing registered user with a password_hash to the single admin account via CLI script.
 * Enforces max-1-admin inside a transaction with row locking.
 * @param {string} email
 * @returns {Promise<Object>}
 */
const promoteUserToAdminByEmail = async (email) => {
  if (typeof email !== 'string' || email.trim() === '') {
    throw createModelError('VALIDATION_ERROR', 'A valid email address is required.');
  }
  const normalizedEmail = email.trim().toLowerCase();
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [adminRows] = await connection.query(
      "SELECT id, email FROM users WHERE auth_role = 'admin' FOR UPDATE"
    );

    const [rows] = await connection.query(
      'SELECT id, name, email, password_hash, role, auth_role FROM users WHERE email = ? LIMIT 1 FOR UPDATE',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      await connection.rollback();
      throw createModelError('USER_NOT_FOUND', `No user found with email: ${normalizedEmail}`);
    }

    const user = rows[0];
    if (!user.password_hash) {
      await connection.rollback();
      throw createModelError(
        'USER_HAS_NO_PASSWORD',
        `User ${normalizedEmail} has no password set and cannot be promoted to admin.`
      );
    }

    if (user.auth_role !== 'admin') {
      if (adminRows.length >= 1) {
        await connection.rollback();
        throw createModelError(
          'SINGLE_ADMIN_EXISTS',
          `An administrator account (${adminRows[0].email}) already exists. Only one administrator account is allowed.`
        );
      }
      await connection.query("UPDATE users SET auth_role = 'admin' WHERE id = ?", [user.id]);
    }

    await connection.commit();
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      auth_role: 'admin'
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_) {
      // Ignore rollback failure when transaction already ended
    }
    if (isSingleAdminUniqueError(error)) {
      throw createModelError(
        'SINGLE_ADMIN_EXISTS',
        'Only one administrator account is allowed in the system.'
      );
    }
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  users,
  ALLOWED_ADMIN_USER_ROLES,
  ALLOWED_AUTH_ROLES,
  getAllUsers,
  getUserById,
  getDirectoryUsers,
  getDirectoryUserById,
  getProfileById,
  getSessionUserById,
  getUserByEmail,
  createUser,
  createRegisteredUser,
  updateUser,
  updateOwnProfile,
  patchUser,
  deleteUser,
  getAllUsersAdmin,
  getUserAdminById,
  countAdmins,
  getUserDependencies,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  promoteUserToAdminByEmail
};
