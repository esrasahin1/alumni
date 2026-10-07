// In-memory veri depolama (Database kullanılmadığı için bellek içi dizi)
const users = [];

/**
 * Tüm kullanıcıları döndürür.
 * @returns {Array} Kullanıcılar listesi
 */
const getAllUsers = () => {
  return users;
};

/**
 * ID'ye göre tek bir kullanıcıyı bulur.
 * @param {number|string} id - Kullanıcı ID
 * @returns {Object|null} Kullanıcı nesnesi veya bulunamazsa null
 */
const getUserById = (id) => {
  const userId = Number(id);
  const user = users.find(u => u.id === userId);
  return user || null;
};

/**
 * Yeni bir kullanıcı oluşturur ve listeye ekler.
 * @param {Object} userData - Yeni kullanıcı bilgileri
 * @returns {Object} Oluşturulan kullanıcı nesnesi
 */
const createUser = (userData) => {
  const newUser = {
    id: userData && userData.id ? Number(userData.id) : users.length + 1,
    ...userData
  };
  newUser.id = Number(newUser.id);
  users.push(newUser);
  return newUser;
};

/**
 * Belirtilen ID'deki kullanıcının tüm bilgilerini günceller (PUT).
 * @param {number|string} id - Kullanıcı ID
 * @param {Object} userData - Güncellenecek yeni bilgiler
 * @param {boolean} [isPartial=false] - Kısmi güncelleme (PATCH) bayrağı
 * @returns {Object|null} Güncellenmiş kullanıcı veya bulunamazsa null
 */
const updateUser = (id, userData, isPartial = false) => {
  const userId = Number(id);
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return null;
  }

  if (isPartial) {
    // Kısmi güncelleme: Mevcut alanları koru, sadece gelenleri ez, ID'yi koru
    const updatedUser = {
      ...users[userIndex],
      ...userData,
      id: userId
    };
    users[userIndex] = updatedUser;
    return updatedUser;
  }

  // Tam güncelleme (PUT): Yeni body ile değiştir, ID'yi koru
  const updatedUser = {
    id: userId,
    ...userData
  };
  updatedUser.id = userId;

  users[userIndex] = updatedUser;
  return updatedUser;
};

/**
 * Belirtilen ID'deki kullanıcının alanlarını kısmi olarak günceller (PATCH).
 * @param {number|string} id - Kullanıcı ID
 * @param {Object} partialData - Güncellenecek alanlar
 * @returns {Object|null} Güncellenmiş kullanıcı veya bulunamazsa null
 */
const patchUser = (id, partialData) => {
  return updateUser(id, partialData, true);
};

/**
 * Belirtilen ID'deki kullanıcıyı siler.
 * @param {number|string} id - Kullanıcı ID
 * @returns {boolean} Silme başarılıysa true, kullanıcı bulunamazsa false
 */
const deleteUser = (id) => {
  const userId = Number(id);
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return false;
  }

  users.splice(userIndex, 1);
  return true;
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
