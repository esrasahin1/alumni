const crypto = require('crypto');

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;
const SALT_LEN = 16;
const SALT_HEX_LEN = SALT_LEN * 2;
const HASH_HEX_LEN = KEY_LEN * 2;
const EXPECTED_PARAM_STR = `N=${SCRYPT_N},r=${SCRYPT_R},p=${SCRYPT_P}`;
const MAXMEM = 32 * 1024 * 1024;

/**
 * Derives a key using Node's built-in crypto.scrypt.
 *
 * @param {string} password
 * @param {string} saltHex
 * @param {{ N: number, r: number, p: number }} params
 * @param {number} [keyLen=KEY_LEN]
 * @returns {Promise<Buffer>}
 */
function deriveKey(password, saltHex, params, keyLen = KEY_LEN) {
  return new Promise((resolve, reject) => {
    const salt = Buffer.from(saltHex, 'hex');
    crypto.scrypt(
      password,
      salt,
      keyLen,
      { N: params.N, r: params.r, p: params.p, maxmem: MAXMEM },
      (err, derivedKey) => {
        if (err) return reject(err);
        return resolve(derivedKey);
      }
    );
  });
}

/**
 * Hashes a plaintext password using crypto.scrypt with a unique random salt.
 * Output format: scrypt$N=16384,r=8,p=1$<salt_hex>$<hash_hex>
 *
 * @param {string} password
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password must be a non-empty string.');
  }

  const saltHex = crypto.randomBytes(SALT_LEN).toString('hex');
  const params = { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P };
  const derivedKey = await deriveKey(password, saltHex, params, KEY_LEN);

  return `scrypt$N=${params.N},r=${params.r},p=${params.p}$${saltHex}$${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plaintext password against a stored self-describing scrypt hash.
 * Uses constant-time comparison via crypto.timingSafeEqual.
 *
 * @param {string} password
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
async function verifyPassword(password, storedHash) {
  if (typeof password !== 'string' || password.length === 0) {
    return false;
  }
  if (typeof storedHash !== 'string' || storedHash.length === 0) {
    return false;
  }

  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== 'scrypt') {
    return false;
  }

  const [, paramStr, saltHex, expectedHex] = parts;
  if (paramStr !== EXPECTED_PARAM_STR) {
    return false;
  }

  if (
    saltHex.length !== SALT_HEX_LEN ||
    expectedHex.length !== HASH_HEX_LEN ||
    !/^[0-9a-f]{32}$/i.test(saltHex) ||
    !/^[0-9a-f]{128}$/i.test(expectedHex)
  ) {
    return false;
  }

  const saltBuf = Buffer.from(saltHex, 'hex');
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  if (saltBuf.length !== SALT_LEN || expectedBuf.length !== KEY_LEN) {
    return false;
  }

  try {
    const derivedBuf = await deriveKey(
      password,
      saltHex,
      { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P },
      KEY_LEN
    );

    if (derivedBuf.length !== expectedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(derivedBuf, expectedBuf);
  } catch (err) {
    return false;
  }
}

module.exports = {
  hashPassword,
  verifyPassword
};
