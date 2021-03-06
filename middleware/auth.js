/** @format */

"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const {
  UnauthorizedError,
  ForbiddenError,
  ExpressError,
} = require("../expressError");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 *
 * Basically, all this middleware function does is continue to store your authentication token in res.local.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 *
 * Checks to make sure the user is logged in by checking res.locals
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be an ADMIN.
 *
 * If not, raises Forbidden.
 *
 * Checks to make sure the user is a logged in admin
 */

function ensureAdmin(req, res, next) {
  try {
    if (res.locals.user.isAdmin === false) {
      throw new ForbiddenError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be either an ADMIN or themself!.
 *
 * If not, raises Forbidden.
 *
 * Checks to make sure the user is either an an admin, or is logged in as themselves.
 */

function ensureAdminOrSelf(req, res, next) {
  try {
    if (
      res.locals.user.isAdmin === false &&
      res.locals.user.username != req.params.username
    ) {
      throw new ForbiddenError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureAdminOrSelf,
};
