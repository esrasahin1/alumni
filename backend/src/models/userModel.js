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

module.exports = {
  users,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser
};
