/**
 * ExpressError extends normal JS error so we can
 *  add a status when we make an instance of it.
 *
 *  The error-handling middleware will return this.
 *
 * Quick note about 401 vs 403: 401 'Unauthorized' response should be used for missing or bad authentication. 403 'Forbidden' response should be used afterwards, when the user is authenticated but isn’t authorized to perform the requested operation on the given resource. In a 403, providing authentication will not change the outcome.
 * 401 - "your authentication is not correct. try again."
 * 403 - "your athentication checks out and I still don't want you accessing this info."
 *
 * @format
 */

class ExpressError extends Error {
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
  }
}

/** 404 NOT FOUND error. */

class NotFoundError extends ExpressError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

/** 401 UNAUTHORIZED error. */

class UnauthorizedError extends ExpressError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/** 400 BAD REQUEST error. */

class BadRequestError extends ExpressError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

/** 403 BAD REQUEST error. */

class ForbiddenError extends ExpressError {
  constructor(message = "Bad Request") {
    super(message, 403);
  }
}

module.exports = {
  ExpressError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError,
};
