const userModel = require('../models/userModel');
const profileView = require('../views/profileView');

const MAX_NAME_LENGTH = 255;
const MAX_DEPARTMENT_LENGTH = 150;
const MIN_GRADUATION_YEAR = 1950;

function getCsrfToken(req, res) {
  return (
    (req && req.profileCsrfToken) ||
    (res && res.locals && res.locals.profileCsrfToken) ||
    ''
  );
}

/**
 * Validates and normalizes submitted personal profile fields.
 * Explicitly extracts only { name, department, graduation_year } to prevent mass assignment,
 * rejects non-string / non-scalar payloads instead of coercing arrays/objects,
 * and strictly ignores any role, auth_role, email, or id fields.
 *
 * @param {Object} body
 * @returns {{ errors: string[], fieldErrors: Object, values: Object, parsedData: Object }}
 */
function validateProfileInput(body = {}) {
  const source = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const maxGraduationYear = new Date().getFullYear() + 10;

  const errors = [];
  const fieldErrors = {};

  let name = '';
  if (source.name === undefined || source.name === null) {
    const msg = 'Full name is required.';
    errors.push(msg);
    fieldErrors.name = msg;
  } else if (typeof source.name !== 'string') {
    const msg = 'Full name must be a valid string.';
    errors.push(msg);
    fieldErrors.name = msg;
  } else {
    name = source.name.trim();
    if (!name) {
      const msg = 'Full name is required.';
      errors.push(msg);
      fieldErrors.name = msg;
    } else if (name.length > MAX_NAME_LENGTH) {
      const msg = `Full name must be at most ${MAX_NAME_LENGTH} characters.`;
      errors.push(msg);
      fieldErrors.name = msg;
    }
  }

  let department = '';
  if (source.department !== undefined && source.department !== null) {
    if (typeof source.department !== 'string') {
      const msg = 'Department must be a valid string.';
      errors.push(msg);
      fieldErrors.department = msg;
    } else {
      department = source.department.trim();
      if (department.length > MAX_DEPARTMENT_LENGTH) {
        const msg = `Department must be at most ${MAX_DEPARTMENT_LENGTH} characters.`;
        errors.push(msg);
        fieldErrors.department = msg;
      }
    }
  }

  let rawGraduationYear = '';
  let parsedGraduationYear = null;
  if (source.graduation_year !== undefined && source.graduation_year !== null) {
    const rawVal = source.graduation_year;
    if (typeof rawVal !== 'string' && typeof rawVal !== 'number') {
      const msg = 'Graduation year must be a valid scalar 4-digit year.';
      errors.push(msg);
      fieldErrors.graduation_year = msg;
    } else if (typeof rawVal === 'number') {
      if (!Number.isFinite(rawVal) || !Number.isInteger(rawVal)) {
        const msg = `Graduation year must be a valid 4-digit year between ${MIN_GRADUATION_YEAR} and ${maxGraduationYear}.`;
        errors.push(msg);
        fieldErrors.graduation_year = msg;
      } else {
        rawGraduationYear = String(rawVal);
        if (rawVal < MIN_GRADUATION_YEAR || rawVal > maxGraduationYear) {
          const msg = `Graduation year must be between ${MIN_GRADUATION_YEAR} and ${maxGraduationYear}.`;
          errors.push(msg);
          fieldErrors.graduation_year = msg;
        } else {
          parsedGraduationYear = rawVal;
        }
      }
    } else {
      rawGraduationYear = rawVal.trim();
      if (rawGraduationYear !== '') {
        if (!/^\d{4}$/.test(rawGraduationYear)) {
          const msg = `Graduation year must be a valid 4-digit year between ${MIN_GRADUATION_YEAR} and ${maxGraduationYear}.`;
          errors.push(msg);
          fieldErrors.graduation_year = msg;
        } else {
          const yearNum = Number(rawGraduationYear);
          if (!Number.isInteger(yearNum) || yearNum < MIN_GRADUATION_YEAR || yearNum > maxGraduationYear) {
            const msg = `Graduation year must be between ${MIN_GRADUATION_YEAR} and ${maxGraduationYear}.`;
            errors.push(msg);
            fieldErrors.graduation_year = msg;
          } else {
            parsedGraduationYear = yearNum;
          }
        }
      }
    }
  }

  return {
    errors,
    fieldErrors,
    values: {
      name,
      department,
      graduation_year: rawGraduationYear
    },
    parsedData: {
      name,
      department: department !== '' ? department : null,
      graduation_year: parsedGraduationYear
    }
  };
}

/**
 * GET /profile
 * Renders the currently authenticated user's personal profile page using req.user.id.
 */
const showProfilePage = async (req, res, next) => {
  try {
    const profile = await userModel.getProfileById(req.user.id);
    if (!profile) {
      return res.redirect('/login?authRequired=1');
    }

    const isUpdated = Boolean(req && req.query && req.query.updated === '1');
    const successMessage = isUpdated ? 'Your profile details have been updated successfully.' : '';

    const html = profileView.renderProfilePage({
      profile,
      successMessage,
      csrfToken: getCsrfToken(req, res),
      currentUser: req.user
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /profile
 * Updates only { name, department, graduation_year } for req.user.id using PRG redirect.
 */
const updateProfile = async (req, res, next) => {
  try {
    const existingProfile = await userModel.getProfileById(req.user.id);
    if (!existingProfile) {
      return res.redirect('/login?authRequired=1');
    }

    const { errors, fieldErrors, values, parsedData } = validateProfileInput(req && req.body);
    if (errors.length > 0) {
      const html = profileView.renderProfilePage({
        profile: existingProfile,
        values,
        errors,
        fieldErrors,
        csrfToken: getCsrfToken(req, res),
        currentUser: req.user
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(html);
    }

    await userModel.updateOwnProfile(req.user.id, parsedData);
    return res.redirect(303, '/profile?updated=1');
  } catch (error) {
    if (error && error.code === 'VALIDATION_ERROR') {
      const existingProfile = await userModel.getProfileById(req.user.id);
      const { values } = validateProfileInput(req && req.body);
      const html = profileView.renderProfilePage({
        profile: existingProfile || req.user,
        values,
        errors: [error.message],
        csrfToken: getCsrfToken(req, res),
        currentUser: req.user
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(html);
    }
    return next(error);
  }
};

module.exports = {
  validateProfileInput,
  showProfilePage,
  updateProfile
};
