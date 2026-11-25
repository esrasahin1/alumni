const crypto = require('crypto');
const { isValidTokenPair } = require('./profileCsrfMiddleware');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function renderMvcCsrfErrorPage(backHref = '/') {
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
    <a href="${backHref}" class="btn">← Go Back</a>
  </div>
</body>
</html>`;
}

/**
 * Factory creating session-bound synchronizer-token CSRF protection for MVC route groups.
 */
function createSessionCsrfProtection({
  sessionKey,
  localsKey,
  backHref = '/'
}) {
  function getOrCreateToken(req) {
    if (!req || !req.session) {
      return '';
    }
    if (typeof req.session[sessionKey] !== 'string' || req.session[sessionKey].length < 32) {
      req.session[sessionKey] = crypto.randomBytes(32).toString('hex');
    }
    return req.session[sessionKey];
  }

  function middleware(req, res, next) {
    const token = getOrCreateToken(req);
    req[localsKey] = token;
    if (res && res.locals) {
      res.locals[localsKey] = token;
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
      return res.status(403).type('html').send(renderMvcCsrfErrorPage(backHref));
    }

    return next();
  }

  function readToken(req, res) {
    if (req && typeof req[localsKey] === 'string' && req[localsKey]) {
      return req[localsKey];
    }
    if (res && res.locals && typeof res.locals[localsKey] === 'string' && res.locals[localsKey]) {
      return res.locals[localsKey];
    }
    if (req && req.session && typeof req.session[sessionKey] === 'string' && req.session[sessionKey]) {
      return req.session[sessionKey];
    }
    return '';
  }

  return {
    middleware,
    getOrCreateToken,
    readToken
  };
}

const userCsrf = createSessionCsrfProtection({
  sessionKey: 'userCsrfToken',
  localsKey: 'userCsrfToken',
  backHref: '/users'
});

const jobPostingCsrf = createSessionCsrfProtection({
  sessionKey: 'jobPostingCsrfToken',
  localsKey: 'jobPostingCsrfToken',
  backHref: '/job-postings'
});

const announcementCsrf = createSessionCsrfProtection({
  sessionKey: 'announcementCsrfToken',
  localsKey: 'announcementCsrfToken',
  backHref: '/announcements'
});

module.exports = {
  createSessionCsrfProtection,
  userCsrfProtection: userCsrf.middleware,
  getUserCsrfToken: userCsrf.readToken,
  jobPostingCsrfProtection: jobPostingCsrf.middleware,
  getJobPostingCsrfToken: jobPostingCsrf.readToken,
  announcementCsrfProtection: announcementCsrf.middleware,
  getAnnouncementCsrfToken: announcementCsrf.readToken
};
