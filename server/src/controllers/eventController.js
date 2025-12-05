// backend/src/controllers/eventController.js
import Event from "../models/eventModel.js";
import { logger } from "../utils/logger.js";

export const getEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, type } = req.query;

    // Build query
    const query = {
      $or: [
        { createdBy: userId },
        { visibility: "public" },
        { visibility: "school" },
      ],
    };

    // Date range filter
    if (startDate && endDate) {
      query.startDate = { $lte: new Date(endDate) };
      query.endDate = { $gte: new Date(startDate) };
    }

    // Type filter
    if (type) {
      query.type = type;
    }

    const events = await Event.find(query)
      .populate("createdBy", "username email")
      .sort({ startDate: 1 })
      .lean();

    logger.info("Events fetched", { userId, count: events.length });

    return res.json({
      success: true,
      events,
    });
  } catch (error) {
    logger.error("Get events error", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

// GET /api/events/:id
export const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(id).populate(
      "createdBy",
      "username email"
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check permission
    if (
      event.visibility === "private" &&
      String(event.createdBy._id) !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.json({
      success: true,
      event,
    });
  } catch (error) {
    logger.error("Get event error", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Failed to fetch event",
    });
  }
};

// POST /api/events
export const createEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      startDate,
      endDate,
      allDay,
      type,
      color,
      visibility,
      location,
    } = req.body;

    // Validation
    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Title, start date, and end date are required",
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    const event = await Event.create({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      allDay,
      type,
      color,
      visibility,
      location,
      createdBy: userId,
    });

    logger.info("Event created", { eventId: event._id, userId });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    logger.error("Create event error", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
};

// PUT /api/events/:id
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check permission
    if (String(event.createdBy) !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own events",
      });
    }

    // Update fields
    const allowedFields = [
      "title",
      "description",
      "startDate",
      "endDate",
      "allDay",
      "type",
      "color",
      "visibility",
      "location",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();

    logger.info("Event updated", { eventId: event._id, userId });

    return res.json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    logger.error("Update event error", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
};

// DELETE /api/events/:id
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check permission
    if (String(event.createdBy) !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own events",
      });
    }

    await Event.findByIdAndDelete(id);

    logger.info("Event deleted", { eventId: id, userId });

    return res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    logger.error("Delete event error", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
};

// GET /api/events/types
export const getEventTypes = async (_req, res) => {
  return res.json({
    success: true,
    types: [
      { value: "holiday", label: "Holiday", color: "#ef4444" },
      { value: "exam", label: "Exam", color: "#f59e0b" },
      { value: "homework", label: "Homework", color: "#3b82f6" },
      { value: "meeting", label: "Meeting", color: "#8b5cf6" },
      { value: "class", label: "Class", color: "#10b981" },
      { value: "personal", label: "Personal", color: "#6b7280" },
      { value: "other", label: "Other", color: "#ec4899" },
    ],
  });
};
