const { getPool } = require('../config/db');

// In-memory array kept for backward compatibility if imported directly
const announcements = [];

/**
 * Normalizes MySQL row to match existing view layer and JSON expectations.
 */
const formatAnnouncement = (row) => {
  if (!row) return null;
  const createdAtIso = row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString();
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: createdAtIso,
    createdDate: createdAtIso,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

/**
 * Returns all announcements from MySQL ordered by id.
 * @returns {Promise<Array>} List of announcements
 */
const getAllAnnouncements = async () => {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, title, content, created_at, updated_at FROM announcements ORDER BY id ASC'
  );
  return rows.map(formatAnnouncement);
};

/**
 * Finds a single announcement by ID.
 * @param {number|string} id - Announcement ID
 * @returns {Promise<Object|null>} Announcement object or null if not found
 */
const getAnnouncementById = async (id) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return null;
  }
  const announcementId = Number(id);
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, title, content, created_at, updated_at FROM announcements WHERE id = ? LIMIT 1',
    [announcementId]
  );
  return rows.length > 0 ? formatAnnouncement(rows[0]) : null;
};

/**
 * Creates a new announcement in MySQL.
 * @param {Object} announcementData - Announcement data { title, content }
 * @returns {Promise<Object>} Created announcement object
 */
const createAnnouncement = async (announcementData = {}) => {
  const data = announcementData || {};
  const title = data.title !== undefined ? String(data.title) : '';
  const content = data.content !== undefined ? String(data.content) : '';

  const pool = await getPool();
  const [result] = await pool.query(
    'INSERT INTO announcements (title, content) VALUES (?, ?)',
    [title, content]
  );

  return await getAnnouncementById(result.insertId);
};

/**
 * Updates an announcement by ID in MySQL (full PUT or partial PATCH).
 * @param {number|string} id - Announcement ID
 * @param {Object} announcementData - New announcement data
 * @param {boolean} [isPartial=false] - Partial update flag
 * @returns {Promise<Object|null>} Updated announcement or null if not found
 */
const updateAnnouncement = async (id, announcementData = {}, isPartial = false) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return null;
  }
  const announcementId = Number(id);
  const existingAnnouncement = await getAnnouncementById(announcementId);

  if (!existingAnnouncement) {
    return null;
  }

  const data = announcementData || {};
  let updatedTitle = existingAnnouncement.title;
  let updatedContent = existingAnnouncement.content;

  if (isPartial) {
    if (data.title !== undefined) updatedTitle = String(data.title);
    if (data.content !== undefined) updatedContent = String(data.content);
  } else {
    updatedTitle = data.title !== undefined ? String(data.title) : '';
    updatedContent = data.content !== undefined ? String(data.content) : '';
  }

  const pool = await getPool();
  await pool.query(
    'UPDATE announcements SET title = ?, content = ? WHERE id = ?',
    [updatedTitle, updatedContent, announcementId]
  );

  return await getAnnouncementById(announcementId);
};

/**
 * Partially updates an announcement by ID (PATCH).
 * @param {number|string} id - Announcement ID
 * @param {Object} partialData - Partial fields to update
 * @returns {Promise<Object|null>}
 */
const patchAnnouncement = async (id, partialData) => {
  return await updateAnnouncement(id, partialData, true);
};

/**
 * Deletes an announcement by ID from MySQL.
 * @param {number|string} id - Announcement ID
 * @returns {Promise<boolean>} True if deleted, false if announcement not found
 */
const deleteAnnouncement = async (id) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return false;
  }
  const announcementId = Number(id);
  const pool = await getPool();
  const [result] = await pool.query(
    'DELETE FROM announcements WHERE id = ?',
    [announcementId]
  );
  return result.affectedRows > 0;
};

module.exports = {
  announcements,
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  patchAnnouncement,
  deleteAnnouncement
};
