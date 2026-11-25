const { escapeHtml } = require('../views/authView');

/**
 * Renders a Full Midnight 403 Forbidden HTML response for authenticated non-admin users.
 *
 * @param {Object|null} currentUser
 * @returns {string}
 */
function renderForbiddenPage(currentUser = null) {
  const userLabel = currentUser && currentUser.email
    ? `${escapeHtml(currentUser.name || '')} (${escapeHtml(currentUser.email)})`
    : 'Current User';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>403 Forbidden - Alumni Tracking System</title>
  <style>
    body {
      margin: 0;
      padding: 40px 20px;
      background-color: #101827;
      color: #B9C3D2;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .card {
      max-width: 560px;
      width: 100%;
      background: #202E46;
      border: 1px solid rgba(229, 62, 62, 0.5);
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(229, 62, 62, 0.16);
      color: #feb2b2;
      border: 1px solid rgba(229, 62, 62, 0.4);
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 14px;
    }
    h1 {
      color: #F4F5F7;
      margin: 0 0 12px;
      font-size: 28px;
    }
    p {
      margin: 0 0 20px;
      line-height: 1.6;
      font-size: 15px;
    }
    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-block;
      padding: 10px 18px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
    }
    .btn-lime {
      background: #D5F36A;
      color: #101827;
    }
    .btn-secondary {
      background: rgba(16, 24, 39, 0.65);
      color: #F4F5F7;
      border: 1px solid #35445D;
    }
  </style>
</head>
<body>
  <div class="card" role="alert">
    <div class="badge">403 Forbidden</div>
    <h1>Administrator Access Required</h1>
    <p>Signed in as <strong>${userLabel}</strong>. This area is restricted to administrators only.</p>
    <div class="actions">
      <a href="/" class="btn btn-lime">Return to Home</a>
      <a href="/login" class="btn btn-secondary">Switch Account</a>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Authorization middleware requiring an authenticated administrator (auth_role === 'admin').
 * Relies strictly on server-side session/database user context (req.user) hydrated by attachCurrentUser.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requireAdmin(req, res, next) {
  const isApi = (req.originalUrl && req.originalUrl.startsWith('/api')) ||
                (req.path && req.path.startsWith('/api'));
  const accept = (req.headers && req.headers.accept) || '';
  const prefersJson = accept.includes('application/json') && !accept.includes('text/html');

  if (!req.user || !req.user.id) {
    if (isApi || prefersJson) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    return res.redirect('/login?authRequired=1');
  }

  if (req.user.auth_role !== 'admin') {
    if (isApi || prefersJson) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Administrator access required.'
      });
    }
    return res.status(403).type('html').send(renderForbiddenPage(req.user));
  }

  return next();
}

module.exports = {
  requireAdmin,
  renderForbiddenPage
};
