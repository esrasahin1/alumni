const fs = require('fs');
const path = require('path');

// Resolve the log directory relative to this middleware file (backend/logs)
const LOGS_DIR = path.resolve(__dirname, '../../logs');
const LOG_FILE = path.join(LOGS_DIR, 'error.logs');

/**
 * Appends a raw log entry to logs/error.logs safely.
 * Automatically creates the logs directory if it does not exist.
 * File writing errors are caught safely and do not crash the application.
 *
 * @param {string} logEntry
 */
function appendToLogFile(logEntry) {
  try {
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    }

    fs.appendFile(LOG_FILE, logEntry, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Failed to write to error.logs:', writeErr.message);
      }
    });
  } catch (fsErr) {
    console.error('Failed to log error to file:', fsErr.message);
  }
}

/**
 * Logs centrally handled errors (5xx / 4xx) to logs/error.logs.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 */
function logErrorToFile(err, req) {
  const timestamp = new Date().toISOString();
  const method = req && req.method ? req.method : 'UNKNOWN';
  const url = req && (req.originalUrl || req.url) ? (req.originalUrl || req.url) : 'UNKNOWN';
  const errorMessage = err && err.message ? err.message : String(err);
  const stackTrace = err && err.stack ? `\nStack: ${err.stack}` : '';

  const logEntry = `[${timestamp}] ${method} ${url} - Error: ${errorMessage}${stackTrace}\n\n`;
  appendToLogFile(logEntry);
}

/**
 * Logs unmatched routes (404) to logs/error.logs.
 * Includes ISO timestamp, HTTP method, request URL, 404 status code, and "Route not found" message.
 *
 * @param {import('express').Request} req
 */
function logNotFoundToFile(req) {
  const timestamp = new Date().toISOString();
  const method = req && req.method ? req.method : 'UNKNOWN';
  const url = req && (req.originalUrl || req.url) ? (req.originalUrl || req.url) : 'UNKNOWN';

  const logEntry = `[${timestamp}] ${method} ${url} 404 - Route not found\n\n`;
  appendToLogFile(logEntry);
}

module.exports = {
  LOGS_DIR,
  LOG_FILE,
  logErrorToFile,
  logNotFoundToFile
};
