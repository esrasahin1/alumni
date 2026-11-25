const crypto = require('crypto');
const { renderAdminErrorPage } = require('../views/adminView');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function getOrCreateCsrfToken(req) {
  if (!req.session) {
    return '';
  }
  if (typeof req.session.adminCsrfToken !== 'string' || req.session.adminCsrfToken.length < 32) {
    req.session.adminCsrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.adminCsrfToken;
}

function isValidTokenPair(submitted, expected) {
  if (typeof submitted !== 'string' || typeof expected !== 'string' || !submitted || !expected) {
    return false;
  }
  const a = Buffer.from(submitted, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

/**
 * Synchronizer-token CSRF protection scoped to authenticated /admin MVC routes.
 * Preserves existing login, registration, logout, and guest application flows untouched.
 */
function adminCsrfProtection(req, res, next) {
  const token = getOrCreateCsrfToken(req);
  req.adminCsrfToken = token;
  res.locals.adminCsrfToken = token;

  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const submittedToken =
    (req.body && typeof req.body._csrf === 'string' && req.body._csrf) ||
    (req.headers && typeof req.headers['x-csrf-token'] === 'string' && req.headers['x-csrf-token']) ||
    '';

  if (!token || !isValidTokenPair(submittedToken, token)) {
    return res.status(403).type('html').send(
      renderAdminErrorPage({
        statusCode: 403,
        title: 'Invalid CSRF Token',
        message: 'Your admin form submission could not be verified (missing or invalid CSRF token). Please reload the admin page and try again.',
        backHref: '/admin',
        backLabel: 'Back to Admin Dashboard',
        currentUser: req.user || null,
        csrfToken: token
      })
    );
  }

  return next();
}

module.exports = {
  adminCsrfProtection,
  getOrCreateCsrfToken,
  isValidTokenPair
};
