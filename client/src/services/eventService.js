// frontend/src/services/eventService.js
import api from "@/lib/api";

/**
 * Event API Service
 */
export const eventService = {
  // Get events with filters
  getEvents: async (params = {}) => {
    const { data } = await api.get("/api/events", { params });
    return data;
  },

  // Get single event
  getEvent: async (id) => {
    const { data } = await api.get(`/api/events/${id}`);
    return data;
  },

  // Create event
  createEvent: async (eventData) => {
    const { data } = await api.post("/api/events", eventData);
    return data;
  },

  // Update event
  updateEvent: async (id, eventData) => {
    const { data } = await api.put(`/api/events/${id}`, eventData);
    return data;
  },

  // Delete event
  deleteEvent: async (id) => {
    const { data } = await api.delete(`/api/events/${id}`);
    return data;
  },

  // Get event types
  getEventTypes: async () => {
    const { data } = await api.get("/api/events/types");
    return data;
  },
};
