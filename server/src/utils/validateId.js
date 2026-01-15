import mongoose from "mongoose";

export const isValidObjectId = (id) => {
  return (
    mongoose.Types.ObjectId.isValid(id) &&
    new mongoose.Types.ObjectId(id).toString() === id
  );
};

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
