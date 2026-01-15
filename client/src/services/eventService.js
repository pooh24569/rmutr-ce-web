
import api from "@/lib/api";

export const eventService = {

  getEvents: async (params = {}) => {
    const { data } = await api.get("/api/events", { params });
    return data;
  },

  getEvent: async (id) => {
    const { data } = await api.get(`/api/events/${id}`);
    return data;
  },

  createEvent: async (eventData) => {
    const { data } = await api.post("/api/events", eventData);
    return data;
  },

  updateEvent: async (id, eventData) => {
    const { data } = await api.put(`/api/events/${id}`, eventData);
    return data;
  },

  deleteEvent: async (id) => {
    const { data } = await api.delete(`/api/events/${id}`);
    return data;
  },

  getEventTypes: async () => {
    const { data } = await api.get("/api/events/types");
    return data;
  },
};
