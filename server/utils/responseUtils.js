/**
 * Response utility functions for consistent API responses
 */

/**
 * Send success response
 * @param {object} res - Express response object
 * @param {object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };

  res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {object} details - Additional error details
 */
export const sendError = (res, message = 'Internal server error', statusCode = 500, details = null) => {
  const response = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };

  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }

  res.status(statusCode).json(response);
};

/**
 * Send validation error response
 * @param {object} res - Express response object
 * @param {string|array} errors - Validation errors
 */
export const sendValidationError = (res, errors) => {
  const response = {
    success: false,
    error: 'Validation failed',
    errors: Array.isArray(errors) ? errors : [errors],
    timestamp: new Date().toISOString()
  };

  res.status(400).json(response);
};

/**
 * Send not found error response
 * @param {object} res - Express response object
 * @param {string} resource - Resource name
 */
export const sendNotFound = (res, resource = 'Resource') => {
  sendError(res, `${resource} not found`, 404);
};