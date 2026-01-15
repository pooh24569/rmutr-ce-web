

export const successResponse = (data = null, message = "Success") => ({
  success: true,
  message,
  data,
});

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
