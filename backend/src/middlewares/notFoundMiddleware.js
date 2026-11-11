const { logNotFoundToFile } = require('./errorLogger');
const { renderNotFoundPage } = require('../views/notFoundView');

/**
 * 404 Guardian Middleware
 *
 * Catches all incoming requests that did not match any previously registered route.
 * - Appends each unmatched route to logs/error.logs.
 * - For /api/ endpoints (or JSON-preferring clients): returns a structured 404 JSON response.
 * - For non-API / web endpoints: renders a generic, professional 404 HTML page.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function notFoundMiddleware(req, res, next) {
  // Append 404 error to logs/error.logs
  logNotFoundToFile(req);

  const method = req.method;
  const url = req.originalUrl || req.url;
  const isApi = (req.originalUrl && req.originalUrl.startsWith('/api')) || (req.path && req.path.startsWith('/api'));
  const prefersJson = req.headers && req.headers.accept && req.headers.accept.includes('application/json') && !req.headers.accept.includes('text/html');

  if (isApi || prefersJson) {
    return res.status(404).json({
      success: false,
      message: "Route not found",
      reason: `No route matches ${method} ${url}.`
    });
  }

  // Render generic 404 HTML page for web requests
  const html = renderNotFoundPage(req);
  return res.status(404).type('html').send(html);
}

module.exports = notFoundMiddleware;
