/**
 * Global error handling middleware
 */
import { sendError } from '../utils/responseUtils.js';

/**
 * Global error handler middleware
 * @param {Error} error - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
export const errorHandler = (error, req, res, next) => {
  console.error('Unhandled error:', error);

  // If response was already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(error);
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return sendError(res, error.message, 400);
  }

  if (error.name === 'CastError') {
    return sendError(res, 'Invalid ID format', 400);
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 'File too large', 413);
  }

  // Default error response
  sendError(res, 'Internal server error', 500, error.stack);
};

/**
 * 404 handler middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const notFoundHandler = (req, res) => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};