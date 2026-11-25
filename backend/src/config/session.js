const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { getPool } = require('./db');

const DEFAULT_SESSION_COOKIE_NAME = 'alumni.sid';
const DEFAULT_SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEV_FALLBACK_SECRET = 'alumni-dev-session-secret-not-for-production';

/**
 * Resolves the session signing secret from environment variables.
 * Requires SESSION_SECRET in production.
 *
 * @returns {string}
 */
function getSessionSecret() {
  const secret = typeof process.env.SESSION_SECRET === 'string'
    ? process.env.SESSION_SECRET.trim()
    : '';

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET environment variable must be set in production.');
    }
    return DEV_FALLBACK_SECRET;
  }

  return secret;
}

/**
 * Resolves whether session cookies require HTTPS.
 *
 * @returns {boolean}
 */
function isCookieSecure() {
  if (process.env.COOKIE_SECURE === 'true') {
    return true;
  }
  if (process.env.COOKIE_SECURE === 'false') {
    return false;
  }
  return process.env.NODE_ENV === 'production';
}

const SESSION_COOKIE_NAME = (typeof process.env.SESSION_COOKIE_NAME === 'string' && process.env.SESSION_COOKIE_NAME.trim())
  ? process.env.SESSION_COOKIE_NAME.trim()
  : DEFAULT_SESSION_COOKIE_NAME;

const parsedMaxAge = Number(process.env.SESSION_MAX_AGE_MS);
const SESSION_MAX_AGE_MS = Number.isFinite(parsedMaxAge) && parsedMaxAge > 0
  ? parsedMaxAge
  : DEFAULT_SESSION_MAX_AGE_MS;

/**
 * Returns shared cookie attributes used by express-session and res.clearCookie().
 *
 * @returns {Object}
 */
function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isCookieSecure(),
    path: '/'
  };
}

/**
 * Pool adapter delegating express-mysql-session queries to db.js's resolved pool.
 */
const poolConnectionAdapter = {
  query: async (sql, params) => {
    const pool = await getPool();
    return pool.query(sql, params);
  },
  end: async () => {}
};

// Automatic table creation is disabled; schema is managed via migration 008_create_sessions_table.
const sessionStore = new MySQLStore(
  {
    createDatabaseTable: false,
    endConnectionOnClose: false,
    clearExpired: true,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: SESSION_MAX_AGE_MS,
    schema: {
      tableName: 'sessions',
      columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data'
      }
    }
  },
  poolConnectionAdapter
);

// Prevent the periodic cleanup timer from keeping short-lived processes alive
sessionStore.onReady().then(() => {
  if (sessionStore._expirationInterval && typeof sessionStore._expirationInterval.unref === 'function') {
    sessionStore._expirationInterval.unref();
  }
}).catch(() => {});

const sessionMiddleware = session({
  name: SESSION_COOKIE_NAME,
  secret: getSessionSecret(),
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    ...getSessionCookieOptions(),
    maxAge: SESSION_MAX_AGE_MS
  }
});

module.exports = {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  getSessionSecret,
  isCookieSecure,
  getSessionCookieOptions,
  sessionStore,
  sessionMiddleware
};
