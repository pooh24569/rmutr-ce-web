import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import { createEvent, deleteEvent, getEvent, getEvents, getEventTypes, updateEvent } from "../controllers/eventController.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getEvents);
router.get("/types",getEventTypes );
router.get("/:id",getEvent );
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;

