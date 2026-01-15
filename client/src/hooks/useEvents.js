
import { useState, useCallback } from "react";
import { eventService } from "@/services/eventService";
import { toast } from "sonner";

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await eventService.getEvents(params);
      setEvents(response.events || []);
      return response.events;
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to fetch events";
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (eventData) => {
    try {
      const response = await eventService.createEvent(eventData);
      setEvents((prev) => [...prev, response.event]);
      toast.success("Event created successfully");
      return response.event;
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to create event";
      toast.error(message);
      throw err;
    }
  }, []);

  const updateEvent = useCallback(async (id, eventData) => {
    try {
      const response = await eventService.updateEvent(id, eventData);
      setEvents((prev) =>
        prev.map((event) => (event._id === id ? response.event : event))
      );
      toast.success("Event updated successfully");
      return response.event;
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to update event";
      toast.error(message);
      throw err;
    }
  }, []);

  const deleteEvent = useCallback(async (id) => {
    try {
      await eventService.deleteEvent(id);
      setEvents((prev) => prev.filter((event) => event._id !== id));
      toast.success("Event deleted successfully");
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to delete event";
      toast.error(message);
      throw err;
    }
  }, []);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
