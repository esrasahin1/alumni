const { parsePositiveIntegerId } = require('./accessHelpers');

const MAX_TITLE_LENGTH = 120;
const MAX_VARCHAR_LENGTH = 255;

function createValidationError(message) {
  const err = new Error(message);
  err.code = 'VALIDATION_ERROR';
  err.statusCode = 400;
  return err;
}

/**
 * Validates and builds a strictly whitelisted payload for job posting creation and updates.
 * - Rejects non-string values for title, company, location, contact_email, and description.
 * - Validates company (1..255 chars) and title (1..120 chars) on POST, PUT, and PATCH (when supplied).
 * - Forces user_id = req.user.id (create) or existingJobPosting.user_id (update) for non-admins.
 * - Validates Admin-supplied user_id strictly (allows positive integer or explicit null/'', rejects true/arrays/objects/<=0/non-digits with 400).
 */
function buildAndValidateJobPostingPayload(
  req,
  { isPartial = false, existingJobPosting = null, isAdmin = false, forcedUserId = undefined } = {}
) {
  const body = req && req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body
    : {};

  const payload = {};

  if (!isPartial || body.title !== undefined) {
    if (body.title === undefined || body.title === null) {
      throw createValidationError(
        isPartial
          ? 'Başlık (title) boş olamaz.'
          : 'Başlık (title) ve şirket (company) alanları zorunludur.'
      );
    }
    if (typeof body.title !== 'string') {
      throw createValidationError('Başlık (title) geçerli bir metin olmalıdır.');
    }
    const title = body.title.trim();
    if (!title) {
      throw createValidationError(
        isPartial
          ? 'Başlık (title) boş olamaz.'
          : 'Başlık (title) ve şirket (company) alanları zorunludur.'
      );
    }
    if (title.length > MAX_TITLE_LENGTH) {
      throw createValidationError('İş ilanı başlığı en fazla 120 karakter olabilir.');
    }
    payload.title = title;
  }

  if (!isPartial || body.company !== undefined) {
    if (body.company === undefined || body.company === null) {
      throw createValidationError(
        isPartial
          ? 'Şirket (company) boş olamaz.'
          : 'Başlık (title) ve şirket (company) alanları zorunludur.'
      );
    }
    if (typeof body.company !== 'string') {
      throw createValidationError('Şirket (company) geçerli bir metin olmalıdır.');
    }
    const company = body.company.trim();
    if (!company) {
      throw createValidationError(
        isPartial
          ? 'Şirket (company) boş olamaz.'
          : 'Başlık (title) ve şirket (company) alanları zorunludur.'
      );
    }
    if (company.length > MAX_VARCHAR_LENGTH) {
      throw createValidationError(`Şirket (company) adı en fazla ${MAX_VARCHAR_LENGTH} karakter olabilir.`);
    }
    payload.company = company;
  }

  if (!isPartial || body.location !== undefined || body.city !== undefined) {
    const rawLoc = body.city !== undefined ? body.city : body.location;
    if (rawLoc === undefined || rawLoc === null) {
      payload.location = null;
    } else if (typeof rawLoc === 'string') {
      const trimmedLoc = rawLoc.trim();
      if (trimmedLoc.length > MAX_VARCHAR_LENGTH) {
        throw createValidationError(`Konum (location) en fazla ${MAX_VARCHAR_LENGTH} karakter olabilir.`);
      }
      payload.location = trimmedLoc !== '' ? trimmedLoc : null;
    } else {
      throw createValidationError('Konum (location) geçerli bir metin olmalıdır.');
    }
  }

  if (!isPartial || body.contact_email !== undefined || body.contactEmail !== undefined) {
    const rawEmail = body.contact_email !== undefined ? body.contact_email : body.contactEmail;
    if (rawEmail === undefined || rawEmail === null) {
      payload.contact_email = null;
    } else if (typeof rawEmail === 'string') {
      const trimmedEmail = rawEmail.trim();
      if (trimmedEmail.length > MAX_VARCHAR_LENGTH) {
        throw createValidationError(`İletişim e-postası en fazla ${MAX_VARCHAR_LENGTH} karakter olabilir.`);
      }
      payload.contact_email = trimmedEmail !== '' ? trimmedEmail : null;
    } else {
      throw createValidationError('İletişim e-postası (contact_email) geçerli bir metin olmalıdır.');
    }
  }

  if (!isPartial || body.description !== undefined) {
    if (body.description === undefined || body.description === null) {
      payload.description = null;
    } else if (typeof body.description === 'string') {
      payload.description = body.description.trim() !== '' ? body.description : null;
    } else {
      throw createValidationError('Açıklama (description) geçerli bir metin olmalıdır.');
    }
  }

  if (forcedUserId !== undefined) {
    payload.user_id = forcedUserId;
    payload.userId = forcedUserId;
  } else if (!isAdmin) {
    if (existingJobPosting) {
      payload.user_id = existingJobPosting.user_id;
      payload.userId = existingJobPosting.user_id;
    } else {
      const authUserId = parsePositiveIntegerId(req && req.user && req.user.id);
      payload.user_id = authUserId;
      payload.userId = authUserId;
    }
  } else {
    const hasUserIdInput = body.user_id !== undefined || body.userId !== undefined;
    const rawUserId = body.user_id !== undefined ? body.user_id : body.userId;

    if (!hasUserIdInput) {
      if (existingJobPosting) {
        payload.user_id = existingJobPosting.user_id;
        payload.userId = existingJobPosting.user_id;
      } else {
        const defaultUserId = parsePositiveIntegerId(req && req.user && req.user.id);
        payload.user_id = defaultUserId;
        payload.userId = defaultUserId;
      }
    } else if (rawUserId === null || (typeof rawUserId === 'string' && rawUserId.trim() === '')) {
      payload.user_id = null;
      payload.userId = null;
    } else {
      const parsedAdminUserId = parsePositiveIntegerId(rawUserId);
      if (parsedAdminUserId === null) {
        throw createValidationError("Geçersiz kullanıcı ID'si (user_id). Pozitif bir tam sayı veya boş olmalıdır.");
      }
      payload.user_id = parsedAdminUserId;
      payload.userId = parsedAdminUserId;
    }
  }

  return payload;
}

module.exports = {
  MAX_TITLE_LENGTH,
  MAX_VARCHAR_LENGTH,
  buildAndValidateJobPostingPayload
};
