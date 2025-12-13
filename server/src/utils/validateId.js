import mongoose from "mongoose";

/**
 * Validate if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean}
 */
export const isValidObjectId = (id) => {
  return (
    mongoose.Types.ObjectId.isValid(id) &&
    new mongoose.Types.ObjectId(id).toString() === id
  );
};

/**
 * Middleware to validate ObjectId params
 * @param  {...string} paramNames - Parameter names to validate
 * @returns {Function} Express middleware
 */
export const validateObjectIdParams = (...paramNames) => {
  return (req, res, next) => {
    for (const param of paramNames) {
      const id = req.params[param];
      if (id && !isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${param} format`,
        });
      }
    }
    next();
  };
};

export default {
  isValidObjectId,
  validateObjectIdParams,
};
