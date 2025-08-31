/**
 * Validation middleware
 */
import { sendValidationError } from '../utils/responseUtils.js';

/**
 * Validate request body has required fields
 * @param {string[]} requiredFields - Array of required field names
 * @returns {function} Middleware function
 */
export const validateRequiredFields = (requiredFields) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const field of requiredFields) {
      if (!req.body[field]) {
        errors.push(`${field} is required`);
      }
    }
    
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }
    
    next();
  };
};

/**
 * Validate request parameters
 * @param {string[]} requiredParams - Array of required parameter names
 * @returns {function} Middleware function
 */
export const validateParams = (requiredParams) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const param of requiredParams) {
      if (!req.params[param]) {
        errors.push(`${param} parameter is required`);
      }
    }
    
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }
    
    next();
  };
};

/**
 * Rate limiting middleware (simple implementation)
 * @param {number} maxRequests - Maximum requests per window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {function} Middleware function
 */
export const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get or create request history for this IP
    if (!requests.has(ip)) {
      requests.set(ip, []);
    }
    
    const ipRequests = requests.get(ip);
    
    // Remove old requests outside the window
    const recentRequests = ipRequests.filter(timestamp => timestamp > windowStart);
    requests.set(ip, recentRequests);
    
    // Check if rate limit exceeded
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    recentRequests.push(now);
    
    next();
  };
};