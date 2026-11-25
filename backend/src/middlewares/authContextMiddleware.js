const userModel = require('../models/userModel');

/**
 * Loads the currently authenticated user from the active session, if present.
 * Sets req.user and res.locals.currentUser without enforcing route authorization.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function attachCurrentUser(req, res, next) {
  req.user = null;
  res.locals.currentUser = null;

  if (!req.session || !req.session.userId) {
    return next();
  }

  try {
    const user = await userModel.getSessionUserById(req.session.userId);
    if (!user) {
      delete req.session.userId;
      return next();
    }

    req.user = user;
    res.locals.currentUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  attachCurrentUser
};
