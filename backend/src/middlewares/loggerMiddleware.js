/**
 * Formats a Date object into HH:mm:ss string.
 * @param {Date} [date=new Date()]
 * @returns {string} Formatted time string (e.g. "10:20:30")
 */
function formatTime(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Express middleware that logs every HTTP request to the terminal.
 * Output format: Time (HH:mm:ss) Method Route StatusCode Duration ms
 * Example: 10:20:30 POST /api/users 201 18 ms
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function loggerMiddleware(req, res, next) {
  const startTime = Date.now();
  const requestDate = new Date();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const timeStr = formatTime(requestDate);
    const method = req.method;
    const url = req.originalUrl || req.url;
    const statusCode = res.statusCode;

    console.log(`${timeStr} ${method} ${url} ${statusCode} ${duration} ms`);
  });

  next();
}

loggerMiddleware.formatTime = formatTime;

module.exports = loggerMiddleware;
