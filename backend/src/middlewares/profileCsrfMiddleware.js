const crypto = require('crypto');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function getOrCreateProfileCsrfToken(req) {
  if (!req.session) {
    return '';
  }
  if (typeof req.session.profileCsrfToken !== 'string' || req.session.profileCsrfToken.length < 32) {
    req.session.profileCsrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.profileCsrfToken;
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

function renderCsrfErrorPage() {
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
    <p>Your profile update could not be verified because the security token was missing or invalid. Please reload your profile page and try again.</p>
    <a href="/profile" class="btn">Back to My Profile</a>
  </div>
</body>
</html>`;
}

/**
 * Synchronizer-token CSRF protection scoped to authenticated /profile routes.
 * Uses a dedicated session key (`profileCsrfToken`) without touching admin CSRF or auth routes.
 */
function profileCsrfProtection(req, res, next) {
  const token = getOrCreateProfileCsrfToken(req);
  req.profileCsrfToken = token;
  if (res.locals) {
    res.locals.profileCsrfToken = token;
  }

  if (SAFE_METHODS.has(req.method)) {
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
    return res.status(403).type('html').send(renderCsrfErrorPage());
  }

  return next();
}

module.exports = {
  profileCsrfProtection,
  getOrCreateProfileCsrfToken,
  isValidTokenPair
};
