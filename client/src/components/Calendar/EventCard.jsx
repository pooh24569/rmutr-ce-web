// frontend/src/components/calendar/EventCard.jsx
import React from "react";
import { Clock, MapPin, Trash2, Edit } from "lucide-react";
import { formatTime } from "@/utils/dateUtils";

export default function EventCard({ event, onClick, onEdit, onDelete }) {
    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit?.(event);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this event?")) {
            onDelete?.(event._id);
        }
    };

    return (
        <div
            onClick={() => onClick?.(event)}
            className="group relative mb-1 px-2 py-1 rounded text-xs cursor-pointer hover:opacity-90 transition-opacity"
            style={{
                backgroundColor: event.color + "20",
                borderLeft: `3px solid ${event.color}`,
            }}
        >
            {/* Title */}
            <div className="font-medium truncate" style={{ color: event.color }}>
                {event.title}
            </div>

            {/* Time */}
            {!event.allDay && (
                <div className="flex items-center gap-1 text-[10px] text-neutral-600 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(event.startDate)}</span>
                </div>
            )}

            {/* Location */}
            {event.location && (
                <div className="flex items-center gap-1 text-[10px] text-neutral-600 mt-0.5 truncate">
                    <MapPin className="w-3 h-3" />
                    <span>{event.location}</span>
                </div>
            )}

            {/* Quick Actions (show on hover) */}
            <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                <button
                    onClick={handleEdit}
                    className="p-1 bg-white rounded shadow-sm hover:bg-neutral-100"
                    title="Edit event"
                >
                    <Edit className="w-3 h-3 text-neutral-600" />
                </button>
                <button
                    onClick={handleDelete}
                    className="p-1 bg-white rounded shadow-sm hover:bg-red-50"
                    title="Delete event"
                >
                    <Trash2 className="w-3 h-3 text-red-600" />
                </button>
            </div>
        </div>
    );
}