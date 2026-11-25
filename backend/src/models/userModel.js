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
    'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
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
 * Deletes a user by ID from MySQL.
 * @param {number|string} id - User ID
 * @returns {Promise<boolean>} True if deleted, false if user not found
 */
const deleteUser = async (id) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return false;
  }
  const userId = Number(id);
  const pool = await getPool();
  const [result] = await pool.query(
    'DELETE FROM users WHERE id = ?',
    [userId]
  );
  return result.affectedRows > 0;
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
    'SELECT id, name, email, password_hash, role, department, graduation_year, created_at, updated_at FROM users WHERE email = ? LIMIT 1',
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
    'INSERT INTO users (name, email, password_hash, role, department, graduation_year) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, passwordHash, role, department, graduationYear]
  );

  const [rows] = await pool.query(
    'SELECT id, name, email, role, department, graduation_year, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [result.insertId]
  );
  return rows.length > 0 ? rows[0] : null;
};

module.exports = {
  users,
  getAllUsers,
  getUserById,
  getSessionUserById,
  getUserByEmail,
  createUser,
  createRegisteredUser,
  updateUser,
  patchUser,
  deleteUser
};
