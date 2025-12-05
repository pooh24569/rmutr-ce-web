/**
 * Response Formatter Utilities
 * Provides consistent API response formats across the application
 */

/**
 * Success response format
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Formatted success response
 */
export const successResponse = (data = null, message = "Success") => ({
  success: true,
  message,
  data,
});

/**
 * Error response format
 * @param {string} message - Error message
 * @param {Array|Object} errors - Validation errors or error details
 * @returns {Object} Formatted error response
 */
export const errorResponse = (message, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return response;
};

/**
 * Paginated response format
 * @param {Array} data - Array of data items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {Object} Formatted paginated response
 */
export const paginatedResponse = (data, page, limit, total) => ({
  success: true,
  data,
  pagination: {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  },
});

/**
 * Created response format (for POST requests)
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 * @returns {Object} Formatted created response
 */
export const createdResponse = (data, message = "Created successfully") => ({
  success: true,
  message,
  data,
});

export default {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
};
