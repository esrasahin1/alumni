const userModel = require('../models/userModel');
const authView = require('../views/authView');
const { hashPassword, verifyPassword } = require('../utils/passwordUtils');
const { SESSION_COOKIE_NAME, getSessionCookieOptions } = require('../config/session');

const ALLOWED_ROLES = Object.freeze(['student', 'alumni']);
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MAX_NAME_LENGTH = 255;
const MAX_EMAIL_LENGTH = 255;
const MAX_DEPARTMENT_LENGTH = 150;
const MIN_GRADUATION_YEAR = 1950;
const MAX_GRADUATION_YEAR = new Date().getFullYear() + 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates and normalizes submitted registration fields.
 * Explicitly extracts only allowed fields and never trusts client-supplied roles.
 *
 * @param {Object} body
 * @returns {{ errors: string[], fieldErrors: Object, values: Object, parsedData: Object }}
 */
function validateRegistrationInput(body = {}) {
  const source = body && typeof body === 'object' ? body : {};

  const name = source.name !== undefined && source.name !== null ? String(source.name).trim() : '';
  const email = source.email !== undefined && source.email !== null ? String(source.email).trim().toLowerCase() : '';
  const password = typeof source.password === 'string' ? source.password : '';
  const confirmPassword = typeof source.confirm_password === 'string' ? source.confirm_password : '';
  const role = source.role !== undefined && source.role !== null ? String(source.role).trim().toLowerCase() : '';
  const department = source.department !== undefined && source.department !== null ? String(source.department).trim() : '';
  const rawGraduationYear = source.graduation_year !== undefined && source.graduation_year !== null
    ? String(source.graduation_year).trim()
    : '';

  const errors = [];
  const fieldErrors = {};

  if (!name) {
    const msg = 'Full name is required.';
    errors.push(msg);
    fieldErrors.name = msg;
  } else if (name.length > MAX_NAME_LENGTH) {
    const msg = `Full name must be at most ${MAX_NAME_LENGTH} characters.`;
    errors.push(msg);
    fieldErrors.name = msg;
  }

  if (!email) {
    const msg = 'Email address is required.';
    errors.push(msg);
    fieldErrors.email = msg;
  } else if (email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
    const msg = 'Please enter a valid email address.';
    errors.push(msg);
    fieldErrors.email = msg;
  }

  if (!password) {
    const msg = 'Password is required.';
    errors.push(msg);
    fieldErrors.password = msg;
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    const msg = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
    errors.push(msg);
    fieldErrors.password = msg;
  } else if (password.length > MAX_PASSWORD_LENGTH) {
    const msg = `Password must be at most ${MAX_PASSWORD_LENGTH} characters long.`;
    errors.push(msg);
    fieldErrors.password = msg;
  }

  if (!confirmPassword) {
    const msg = 'Please confirm your password.';
    errors.push(msg);
    fieldErrors.confirm_password = msg;
  } else if (password && password !== confirmPassword) {
    const msg = 'Password and confirmation password do not match.';
    errors.push(msg);
    fieldErrors.confirm_password = msg;
  }

  if (!role) {
    const msg = 'Account type is required. Please select Student or Alumni.';
    errors.push(msg);
    fieldErrors.role = msg;
  } else if (!ALLOWED_ROLES.includes(role)) {
    const msg = 'Invalid account type. Only Student or Alumni accounts can be registered.';
    errors.push(msg);
    fieldErrors.role = msg;
  }

  if (department.length > MAX_DEPARTMENT_LENGTH) {
    const msg = `Department must be at most ${MAX_DEPARTMENT_LENGTH} characters.`;
    errors.push(msg);
    fieldErrors.department = msg;
  }

  let parsedGraduationYear = null;
  if (rawGraduationYear !== '') {
    if (!/^\d{4}$/.test(rawGraduationYear)) {
      const msg = `Graduation year must be a valid 4-digit year between ${MIN_GRADUATION_YEAR} and ${MAX_GRADUATION_YEAR}.`;
      errors.push(msg);
      fieldErrors.graduation_year = msg;
    } else {
      const yearNum = Number(rawGraduationYear);
      if (!Number.isInteger(yearNum) || yearNum < MIN_GRADUATION_YEAR || yearNum > MAX_GRADUATION_YEAR) {
        const msg = `Graduation year must be between ${MIN_GRADUATION_YEAR} and ${MAX_GRADUATION_YEAR}.`;
        errors.push(msg);
        fieldErrors.graduation_year = msg;
      } else {
        parsedGraduationYear = yearNum;
      }
    }
  }

  // Non-password values preserved for form re-render on error
  const values = {
    name,
    email,
    role: ALLOWED_ROLES.includes(role) ? role : '',
    department,
    graduation_year: rawGraduationYear
  };

  const parsedData = {
    name,
    email,
    password,
    role,
    department: department !== '' ? department : null,
    graduation_year: parsedGraduationYear
  };

  return { errors, fieldErrors, values, parsedData };
}

/**
 * GET /register
 * Renders the HTML registration page (and success banner after redirect-after-post).
 */
const showRegisterPage = (req, res) => {
  const isRegistered = req && req.query && req.query.registered === '1';
  const successMessage = isRegistered
    ? 'Your account has been created successfully. You can now use the portal.'
    : '';

  const html = authView.renderRegisterPage({
    successMessage,
    currentUser: req && req.user ? req.user : null
  });
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
};

/**
 * POST /register
 * Validates registration input, hashes password with crypto.scrypt, saves user,
 * and redirects back to GET /register?registered=1 without auto-login.
 */
const register = async (req, res, next) => {
  const { errors, fieldErrors, values, parsedData } = validateRegistrationInput(req && req.body);

  if (errors.length > 0) {
    const html = authView.renderRegisterPage({
      values,
      errors,
      fieldErrors,
      currentUser: req && req.user ? req.user : null
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send(html);
  }

  try {
    const passwordHash = await hashPassword(parsedData.password);

    await userModel.createRegisteredUser({
      name: parsedData.name,
      email: parsedData.email,
      password_hash: passwordHash,
      role: parsedData.role,
      department: parsedData.department,
      graduation_year: parsedData.graduation_year
    });

    // Redirect-after-post (PRG pattern); do NOT create session/cookie or auto-login
    return res.redirect(303, '/register?registered=1');
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      const dupMessage = 'An account with this email address is already registered.';
      const html = authView.renderRegisterPage({
        values,
        errors: [dupMessage],
        fieldErrors: { email: dupMessage },
        currentUser: req && req.user ? req.user : null
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(409).send(html);
    }

    return next(error);
  }
};

/**
 * Validates submitted login credentials.
 * Preserves only normalized email; never preserves password.
 *
 * @param {Object} body
 * @returns {{ errors: string[], fieldErrors: Object, values: Object, parsedData: Object }}
 */
function validateLoginInput(body = {}) {
  const source = body && typeof body === 'object' ? body : {};
  const email = source.email !== undefined && source.email !== null ? String(source.email).trim().toLowerCase() : '';
  const password = typeof source.password === 'string' ? source.password : '';

  const errors = [];
  const fieldErrors = {};

  if (!email) {
    const msg = 'Email address is required.';
    errors.push(msg);
    fieldErrors.email = msg;
  } else if (email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
    const msg = 'Please enter a valid email address.';
    errors.push(msg);
    fieldErrors.email = msg;
  }

  if (!password) {
    const msg = 'Password is required.';
    errors.push(msg);
    fieldErrors.password = msg;
  }

  return {
    errors,
    fieldErrors,
    values: { email },
    parsedData: { email, password }
  };
}

/**
 * GET /login
 * Renders the HTML login page (and logout/authRequired banner when redirected).
 */
const showLoginPage = (req, res) => {
  const isLoggedOut = req && req.query && req.query.loggedOut === '1';
  const isAuthRequired = req && req.query && req.query.authRequired === '1';

  const successMessage = isLoggedOut
    ? 'You have been logged out successfully.'
    : '';
  const infoMessage = isAuthRequired
    ? 'Please sign in to access that page.'
    : '';

  const html = authView.renderLoginPage({
    successMessage,
    infoMessage,
    currentUser: req && req.user ? req.user : null
  });
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
};

/**
 * POST /login
 * Authenticates user credentials via verifyPassword(), regenerates session ID,
 * stores minimal user identity (userId) in session, and redirects to home.
 */
const login = async (req, res, next) => {
  const { errors, fieldErrors, values, parsedData } = validateLoginInput(req && req.body);

  if (errors.length > 0) {
    const html = authView.renderLoginPage({
      values,
      errors,
      fieldErrors,
      currentUser: req && req.user ? req.user : null
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send(html);
  }

  try {
    const user = await userModel.getUserByEmail(parsedData.email);
    const isValid = Boolean(
      user &&
      typeof user.password_hash === 'string' &&
      user.password_hash.length > 0 &&
      (await verifyPassword(parsedData.password, user.password_hash))
    );

    if (!isValid) {
      const invalidMsg = 'Invalid email or password.';
      const html = authView.renderLoginPage({
        values,
        errors: [invalidMsg],
        currentUser: null
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(401).send(html);
    }

    if (!req.session || typeof req.session.regenerate !== 'function') {
      return next(new Error('Session middleware is not configured.'));
    }

    return req.session.regenerate((regenErr) => {
      if (regenErr) {
        return next(regenErr);
      }

      // Store only the minimum required user identity in the session
      req.session.userId = user.id;

      return req.session.save((saveErr) => {
        if (saveErr) {
          return next(saveErr);
        }
        return res.redirect(303, '/');
      });
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /logout
 * Destroys the active session in MySQL, clears the session cookie, and redirects to /login.
 */
const logout = (req, res, next) => {
  const finishLogout = () => {
    res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());
    return res.redirect(303, '/login?loggedOut=1');
  };

  if (req.session && typeof req.session.destroy === 'function') {
    return req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      return finishLogout();
    });
  }

  return finishLogout();
};

module.exports = {
  ALLOWED_ROLES,
  validateRegistrationInput,
  validateLoginInput,
  showRegisterPage,
  register,
  showLoginPage,
  login,
  logout
};
