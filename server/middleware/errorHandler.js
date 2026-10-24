import logger from '../utils/logger.js';

/**
 * Centralized Express Error Handling Middleware.
 * Standardizes error responses across all controllers and services.
 */
export function errorHandler(err, req, res, next) {
  // If response headers have already been sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  logger.error('Unhandled request exception', {
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: err.stack,
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'An internal server error occurred.';
  let errors = err.errors || [];

  // PostgreSQL unique constraint violation (duplicate key)
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Conflict. A record with this unique identifier or FDR number already exists.';
    errors = [err.detail || 'Duplicate resource violation.'];
  }

  // PostgreSQL foreign key constraint violation
  if (err.code === '23503') {
    statusCode = 400;
    message = 'Invalid reference. Referenced institution, bank, or user does not exist.';
    errors = [err.detail || 'Foreign key constraint violation.'];
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed for request parameters.';
    errors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
  }

  // Format consistent error response
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : [message],
  });
}

export default errorHandler;
