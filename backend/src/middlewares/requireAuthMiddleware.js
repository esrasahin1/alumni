/**
 * Authentication Guardian Middleware.
 * Verifies that an authenticated user is attached to req.user (by attachCurrentUser).
 * Does NOT perform role-based authorization checks.
 *
 * - API / JSON requests: responds with 401 Unauthorized JSON.
 * - Browser / HTML requests: redirects to /login?authRequired=1.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requireAuth(req, res, next) {
  if (req.user && req.user.id) {
    return next();
  }

  const isApi = (req.originalUrl && req.originalUrl.startsWith('/api')) ||
                (req.path && req.path.startsWith('/api'));
  const accept = (req.headers && req.headers.accept) || '';
  const prefersJson = accept.includes('application/json') && !accept.includes('text/html');

  if (isApi || prefersJson) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  return res.redirect('/login?authRequired=1');
}

module.exports = {
  requireAuth
};
