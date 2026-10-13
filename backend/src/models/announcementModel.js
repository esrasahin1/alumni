// In-memory veri depolama (Database kullanılmadığı için bellek içi dizi)
const announcements = [];

/**
 * Benzersiz sayısal ID üretir.
 * @returns {number} Yeni ID
 */
const generateId = () => {
  if (announcements.length === 0) {
    return 1;
  }
  return Math.max(...announcements.map(a => Number(a.id) || 0)) + 1;
};

/**
 * Tüm duyuruları döndürür.
 * @returns {Array} Duyurular listesi
 */
const getAllAnnouncements = () => {
  return announcements;
};

/**
 * ID'ye göre tek bir duyuruyu bulur.
 * @param {number|string} id - Duyuru ID
 * @returns {Object|null} Duyuru nesnesi veya bulunamazsa null
 */
const getAnnouncementById = (id) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return null;
  }
  const announcementId = Number(id);
  const announcement = announcements.find(a => a.id === announcementId);
  return announcement || null;
};

/**
 * Yeni bir duyuru oluşturur ve listeye ekler.
 * @param {Object} announcementData - Yeni duyuru bilgileri
 * @returns {Object} Oluşturulan duyuru nesnesi
 */
const createAnnouncement = (announcementData = {}) => {
  const data = announcementData || {};
  const announcementId = data.id !== undefined && data.id !== null && !isNaN(Number(data.id))
    ? Number(data.id)
    : generateId();

  const now = new Date().toISOString();
  const createdDate = data.createdAt || data.createdDate || now;

  const newAnnouncement = {
    id: announcementId,
    title: data.title !== undefined ? data.title : '',
    content: data.content !== undefined ? data.content : '',
    createdAt: createdDate,
    createdDate: createdDate,
    ...data,
    id: announcementId
  };

  if (!newAnnouncement.createdAt) {
    newAnnouncement.createdAt = createdDate;
  }
  if (!newAnnouncement.createdDate) {
    newAnnouncement.createdDate = newAnnouncement.createdAt;
  }

  announcements.push(newAnnouncement);
  return newAnnouncement;
};

/**
 * Belirtilen ID'deki duyurunun tüm bilgilerini günceller (PUT).
 * @param {number|string} id - Duyuru ID
 * @param {Object} announcementData - Güncellenecek yeni bilgiler
 * @param {boolean} [isPartial=false] - Kısmi güncelleme (PATCH) bayrağı
 * @returns {Object|null} Güncellenmiş duyuru veya bulunamazsa null
 */
const updateAnnouncement = (id, announcementData = {}, isPartial = false) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return null;
  }

  const announcementId = Number(id);
  const announcementIndex = announcements.findIndex(a => a.id === announcementId);

  if (announcementIndex === -1) {
    return null;
  }

  const existingAnnouncement = announcements[announcementIndex];
  const data = announcementData || {};

  if (isPartial) {
    // Kısmi güncelleme: Mevcut alanları koru, sadece gelenleri ez, ID'yi koru
    const updatedAnnouncement = {
      ...existingAnnouncement,
      ...data,
      id: announcementId
    };
    announcements[announcementIndex] = updatedAnnouncement;
    return updatedAnnouncement;
  }

  // Tam güncelleme (PUT): Yeni body ile değiştir, ID ve oluşturma tarihini koru
  const createdDate = data.createdAt || data.createdDate || existingAnnouncement.createdAt || existingAnnouncement.createdDate;
  const updatedAnnouncement = {
    id: announcementId,
    title: data.title !== undefined ? data.title : '',
    content: data.content !== undefined ? data.content : '',
    createdAt: createdDate,
    createdDate: createdDate,
    ...data,
    id: announcementId
  };

  if (!updatedAnnouncement.createdAt) {
    updatedAnnouncement.createdAt = createdDate;
  }
  if (!updatedAnnouncement.createdDate) {
    updatedAnnouncement.createdDate = updatedAnnouncement.createdAt;
  }

  announcements[announcementIndex] = updatedAnnouncement;
  return updatedAnnouncement;
};

/**
 * Belirtilen ID'deki duyurunun alanlarını kısmi olarak günceller (PATCH).
 * @param {number|string} id - Duyuru ID
 * @param {Object} partialData - Güncellenecek alanlar
 * @returns {Object|null} Güncellenmiş duyuru veya bulunamazsa null
 */
const patchAnnouncement = (id, partialData) => {
  return updateAnnouncement(id, partialData, true);
};

/**
 * Belirtilen ID'deki duyuruyu siler.
 * @param {number|string} id - Duyuru ID
 * @returns {boolean} Silme başarılıysa true, duyuru bulunamazsa false
 */
const deleteAnnouncement = (id) => {
  if (id === undefined || id === null || id === '' || isNaN(Number(id))) {
    return false;
  }

  const announcementId = Number(id);
  const announcementIndex = announcements.findIndex(a => a.id === announcementId);

  if (announcementIndex === -1) {
    return false;
  }

  announcements.splice(announcementIndex, 1);
  return true;
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
