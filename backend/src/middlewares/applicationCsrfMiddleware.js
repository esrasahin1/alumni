const crypto = require('crypto');
const { isValidTokenPair } = require('./profileCsrfMiddleware');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function getOrCreateApplicationCsrfToken(req) {
  if (!req || !req.session) {
    return '';
  }
  if (typeof req.session.applicationCsrfToken !== 'string' || req.session.applicationCsrfToken.length < 32) {
    req.session.applicationCsrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.applicationCsrfToken;
}

function renderApplicationCsrfErrorPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>403 Invalid CSRF Token - Alumni Tracking System</title>
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
      max-width: 540px;
      width: 100%;
      background: #202E46;
      border: 1px solid rgba(229, 62, 62, 0.5);
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
    }
    h1 { color: #F4F5F7; margin: 0 0 12px; font-size: 24px; }
    p { margin: 0 0 20px; line-height: 1.6; font-size: 15px; }
    .btn {
      display: inline-block;
      padding: 10px 18px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      background: #D5F36A;
      color: #101827;
    }
  </style>
</head>
<body>
  <div class="card" role="alert">
    <h1>Invalid CSRF Token</h1>
    <p>Your request could not be verified because the security token was missing or invalid. Please reload the page and try again.</p>
    <a href="/applications" class="btn">Back to Applications</a>
  </div>
</body>
</html>`;
}

/**
 * Session-bound synchronizer-token CSRF protection for authenticated MVC application
 * mutations (`POST`, `PUT`, `PATCH`, `DELETE`). Preserves unauthenticated guest `POST`
 * job application submissions while generating tokens for views on safe requests.
 */
function applicationCsrfProtection(req, res, next) {
  const token = getOrCreateApplicationCsrfToken(req);
  req.applicationCsrfToken = token;
  if (res && res.locals) {
    res.locals.applicationCsrfToken = token;
  }

  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const isAuthenticatedUser = Boolean(
    (req.user && req.user.id) || (req.session && req.session.userId)
  );

  // Public guests have no authenticated session and may submit job applications without CSRF.
  if (req.method === 'POST' && !isAuthenticatedUser) {
    return next();
  }

  const submittedToken =
    (req.body && typeof req.body._csrf === 'string' && req.body._csrf) ||
    (req.headers && typeof req.headers['x-csrf-token'] === 'string' && req.headers['x-csrf-token']) ||
    '';

  if (!token || !isValidTokenPair(submittedToken, token)) {
    const accept = (req.headers && req.headers.accept) || '';
    const prefersJson = accept.includes('application/json') && !accept.includes('text/html');
    if (prefersJson) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or missing CSRF token.'
      });
    }
    return res.status(403).type('html').send(renderApplicationCsrfErrorPage());
  }

  return next();
}

module.exports = {
  applicationCsrfProtection,
  getOrCreateApplicationCsrfToken
};
