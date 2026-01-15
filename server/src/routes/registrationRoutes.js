

import express from "express";
import verifyToken, { authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  getMyEnrolledCourses,
  getMyTeachingCourses,
  listAllCourses,
  getCourse,
} from "../controllers/registrationController.js";

const registrationRouter = express.Router();

registrationRouter.use(verifyToken);

registrationRouter.get(
  "/enrolled",
  authorizeRoles("student"),
  getMyEnrolledCourses
);

registrationRouter.get(
  "/teaching",
  authorizeRoles("teacher"),
  getMyTeachingCourses
);

registrationRouter.get(
  "/courses",
  authorizeRoles("student", "teacher", "admin", "superadmin"),
  listAllCourses
);

registrationRouter.get("/courses/:courseCode", getCourse);

export default registrationRouter;
