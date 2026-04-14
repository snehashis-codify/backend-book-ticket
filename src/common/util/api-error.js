class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  static BadRequest(message = "Bad Request") {
    throw new ApiError(400, message);
  }
  static Forbidden(message = "Wrong Role") {
    throw new ApiError(403, message);
  }
  static Conflict(message = "Conflict") {
    throw new ApiError(409, message);
  }
  static Unauthorized(message = "Unauthorized") {
    throw new ApiError(401, message);
  }
  static Notfound(message = "Not found") {
    throw new ApiError(404, message);
  }
}

export default ApiError;
