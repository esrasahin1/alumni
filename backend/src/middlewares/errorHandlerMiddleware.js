const { logErrorToFile } = require('./errorLogger');

/**
 * 5xx Guardian Middleware (Centralized Error Handler)
 *
 * Catches all unhandled errors thrown or passed via next(err).
 * - Logs technical error details and stack trace to the terminal via console.error.
 * - Appends each centrally handled error to logs/error.logs via shared errorLogger.
 * - If headers have already been sent, delegates to Express default next(err).
 * - Preserves existing valid HTTP status codes (e.g., 400 Bad Request) from error objects without converting them to 500.
 * - Defaults unexpected errors to HTTP 500 Internal Server Error.
 * - Prevents leaking internal technical details, stack traces, or raw error messages to the client.
 * - Uses clean, safe, generic messages for both 4xx and 5xx responses.
 * - Responds with JSON for API requests and clean HTML for web requests.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandlerMiddleware(err, req, res, next) {
  // If response headers have already been sent, delegate to Express next(err)
  if (res.headersSent) {
    return next(err);
  }

  // Log technical details and stack trace to terminal
  console.error(err);

  // Append error details to logs/error.logs
  logErrorToFile(err, req);

  // Determine HTTP status code (preserve valid 4xx/5xx status codes, default to 500)
  let statusCode = 500;
  const rawStatus = err.statusCode || err.status;
  if (typeof rawStatus === 'number' && rawStatus >= 400 && rawStatus < 600) {
    statusCode = rawStatus;
  }

  // Determine whether request expects API JSON response or Web HTML
  const isApi = (req.originalUrl && req.originalUrl.startsWith('/api')) ||
                (req.path && req.path.startsWith('/api')) ||
                (req.headers && req.headers.accept && req.headers.accept.includes('application/json') && !req.headers.accept.includes('text/html'));

  // Safe, generic user-facing message (never leak raw err.message or stack trace)
  const clientMessage = statusCode >= 500
    ? 'Internal Server Error'
    : (statusCode === 401 ? 'Unauthorized'
      : statusCode === 403 ? 'Forbidden'
      : statusCode === 404 ? 'Not Found'
      : statusCode === 409 ? 'Conflict'
      : 'Bad Request');

  if (isApi) {
    return res.status(statusCode).json({
      success: false,
      message: clientMessage
    });
  }

  // Clean HTML error response for web clients without exposing stack trace or raw error messages
  const title = statusCode >= 500 ? 'Internal Server Error' : clientMessage;
  const heading = statusCode >= 500 ? '500 Internal Server Error' : `${statusCode} ${clientMessage}`;
  const description = statusCode >= 500
    ? 'An unexpected error occurred on the server.'
    : 'The server could not understand or process the request.';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>
<body>
  <h1>${heading}</h1>
  <p>${description}</p>
</body>
</html>
`;

  return res.status(statusCode).type('html').send(html);
}

module.exports = errorHandlerMiddleware;
