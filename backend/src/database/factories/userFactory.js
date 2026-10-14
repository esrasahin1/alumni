/**
 * User Factory
 * Generates realistic alumni user data with guaranteed unique email addresses.
 */

const FIRST_NAMES = [
  'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Mustafa', 
  'Zeynep', 'Emre', 'Elif', 'Can', 'Burak', 
  'Gamze', 'Oğuz', 'Selin', 'Deniz', 'Ece'
];

const LAST_NAMES = [
  'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 
  'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 
  'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara'
];

let counter = 1;

/**
 * Normalizes Turkish characters for email generation.
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Generates a single user object.
 * @param {Object} [overrides={}] Custom attribute overrides
 * @returns {Object} { name, email }
 */
function createOne(overrides = {}) {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const fullName = `${firstName} ${lastName}`;
  
  const emailPrefix = `${slugify(firstName)}.${slugify(lastName)}`;
  const uniqueEmail = `${emailPrefix}${counter++}@alumni.edu.tr`;

  return {
    name: overrides.name !== undefined ? overrides.name : fullName,
    email: overrides.email !== undefined ? overrides.email : uniqueEmail
  };
}

/**
 * Generates multiple user objects ensuring each has a unique email.
 * @param {number} [count=5] Number of users to generate
 * @param {Array<Object>} [overrides=[]] Array of overrides for specific users
 * @returns {Array<Object>} Array of user objects
 */
function createMany(count = 5, overrides = []) {
  const users = [];
  const generatedEmails = new Set();

  for (let i = 0; i < count; i++) {
    const override = overrides[i] || {};
    let user;
    let attempts = 0;

    do {
      user = createOne(override);
      attempts++;
    } while (generatedEmails.has(user.email) && attempts < 100);

    generatedEmails.add(user.email);
    users.push(user);
  }

  return users;
}

/**
 * Predefined realistic seed users for predictable, high-quality sample data.
 */
function getPredefinedUsers() {
  return [
    { name: 'Esra Şahin', email: 'esra.sahin@alumni.edu.tr' },
    { name: 'Ahmet Yılmaz', email: 'ahmet.yilmaz@alumni.edu.tr' },
    { name: 'Zeynep Kaya', email: 'zeynep.kaya@alumni.edu.tr' },
    { name: 'Mehmet Demir', email: 'mehmet.demir@alumni.edu.tr' },
    { name: 'Elif Çelik', email: 'elif.celik@alumni.edu.tr' },
    { name: 'Burak Öztürk', email: 'burak.ozturk@alumni.edu.tr' }
  ];
}

module.exports = {
  createOne,
  createMany,
  getPredefinedUsers
};
