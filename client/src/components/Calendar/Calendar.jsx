
import React, { useState, useEffect } from "react";
import { useCalendar } from "@/hooks/useCalendar";
import { useEvents } from "@/hooks/useEvents";
import { formatDate } from "@/utils/dateUtils";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import EventModal from "./EventModal";
import Loading from "@/components/Loading";

export default function Calendar() {
    const {
        year,
        month,
        calendarCells,
        monthRange,
        goToNextMonth,
        goToPrevMonth,
        goToToday,
    } = useCalendar();

    const {
        events,
        loading,
        fetchEvents,
        createEvent,
        updateEvent,
        deleteEvent,
    } = useEvents();

    const [eventModalOpen, setEventModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [eventTypes, setEventTypes] = useState([
        { value: "personal", label: "Personal", color: "#6b7280" },
        { value: "holiday", label: "Holiday", color: "#ef4444" },
        { value: "exam", label: "Exam", color: "#f59e0b" },
        { value: "homework", label: "Homework", color: "#3b82f6" },
        { value: "meeting", label: "Meeting", color: "#8b5cf6" },
        { value: "class", label: "Class", color: "#10b981" },
        { value: "other", label: "Other", color: "#ec4899" },
    ]);

    useEffect(() => {
        const params = {
            startDate: monthRange.startDate.toISOString(),
            endDate: monthRange.endDate.toISOString(),
        };
        fetchEvents(params);
    }, [monthRange.startDate, monthRange.endDate]);

    const handleAddEvent = (date = null) => {
        setSelectedEvent(null);
        setSelectedDate(date);
        setEventModalOpen(true);
    };

    const handleEditEvent = (event) => {
        setSelectedEvent(event);
        setSelectedDate(null);
        setEventModalOpen(true);
    };

    const handleSaveEvent = async (eventData) => {
        if (selectedEvent) {
            await updateEvent(selectedEvent._id, eventData);
        } else {

            if (selectedDate) {
                eventData.startDate = new Date(selectedDate).toISOString();
                eventData.endDate = new Date(selectedDate).toISOString();
            }
            await createEvent(eventData);
        }
        setEventModalOpen(false);
    };

    const handleCellClick = (date) => {
        handleAddEvent(date);
    };

    const handleEventClick = (event) => {
        handleEditEvent(event);
    };

    if (loading && events.length === 0) {
        return <Loading fullScreen message="Loading calendar..." />;
    }

    return (
        <div className="flex flex-col h-full">
            {}
            <CalendarHeader
                year={year}
                month={month}
                onPrevMonth={goToPrevMonth}
                onNextMonth={goToNextMonth}
                onToday={goToToday}
                onAddEvent={() => handleAddEvent()}
            />

            {}
            <CalendarGrid
                cells={calendarCells}
                events={events}
                onCellClick={handleCellClick}
                onEventClick={handleEventClick}
                onEventEdit={handleEditEvent}
                onEventDelete={deleteEvent}
            />

            {}
            <EventModal
                isOpen={eventModalOpen}
                onClose={() => setEventModalOpen(false)}
                onSave={handleSaveEvent}
                event={selectedEvent}
                eventTypes={eventTypes}
            />
        </div>
    );
}