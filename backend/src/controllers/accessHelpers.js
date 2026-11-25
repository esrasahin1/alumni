const escapeHtml = (str) => {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

function parsePositiveIntegerId(val) {
  if (typeof val === 'number') {
    return Number.isInteger(val) && val > 0 ? val : null;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!/^\d+$/.test(trimmed)) {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

function isAdminUser(user) {
  return Boolean(user && user.auth_role === 'admin');
}

function isSelfUser(user, targetId) {
  const userId = parsePositiveIntegerId(user && user.id);
  const parsedTargetId = parsePositiveIntegerId(targetId);
  return userId !== null && parsedTargetId !== null && userId === parsedTargetId;
}

function prefersJsonResponse(req) {
  const accept = (req && req.headers && req.headers.accept) || '';
  return accept.includes('application/json') && !accept.includes('text/html');
}

function renderForbiddenPage(message = 'You do not have permission to perform this action.', backHref = '/') {
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
    h1 { color: #F4F5F7; margin: 0 0 12px; font-size: 24px; }
    p { margin: 0 0 22px; line-height: 1.6; font-size: 15px; }
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
    <h1>403 Forbidden</h1>
    <p>${escapeHtml(message)}</p>
    <a href="${escapeHtml(backHref)}" class="btn">← Go Back</a>
  </div>
</body>
</html>`;
}

function sendForbiddenResponse(req, res, message = 'Forbidden', backHref = '/') {
  if (prefersJsonResponse(req)) {
    return res.status(403).json({
      success: false,
      message
    });
  }
  return res.status(403).type('html').send(renderForbiddenPage(message, backHref));
}

function sendBadRequestResponse(req, res, message = 'Bad Request', backHref = '/') {
  if (prefersJsonResponse(req)) {
    return res.status(400).json({
      success: false,
      message
    });
  }
  return res.status(400).type('html').send(
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>400 Bad Request - Alumni Tracking System</title><style>body{margin:0;padding:40px 20px;background:#101827;color:#B9C3D2;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}.card{max-width:560px;width:100%;background:#202E46;border:1px solid rgba(229,62,62,0.5);border-radius:12px;padding:32px}h1{color:#F4F5F7;margin:0 0 12px;font-size:24px}p{margin:0 0 22px;line-height:1.6}.btn{display:inline-block;padding:10px 18px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:700;background:#D5F36A;color:#101827}</style></head><body><div class="card" role="alert"><h1>Validation Error</h1><p>${escapeHtml(message)}</p><a href="${escapeHtml(backHref)}" class="btn">← Go Back</a></div></body></html>`
  );
}

function toPublicDirectoryUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    role: user.role !== undefined ? user.role : null,
    department: user.department !== undefined ? user.department : null,
    graduation_year: user.graduation_year !== undefined ? user.graduation_year : null,
    created_at: user.created_at
  };
}

function toSelfOrAdminUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email !== undefined ? user.email : null,
    role: user.role !== undefined ? user.role : null,
    auth_role: user.auth_role !== undefined ? user.auth_role : 'user',
    department: user.department !== undefined ? user.department : null,
    graduation_year: user.graduation_year !== undefined ? user.graduation_year : null,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}

module.exports = {
  escapeHtml,
  parsePositiveIntegerId,
  isAdminUser,
  isSelfUser,
  prefersJsonResponse,
  renderForbiddenPage,
  sendForbiddenResponse,
  sendBadRequestResponse,
  toPublicDirectoryUser,
  toSelfOrAdminUser
};
