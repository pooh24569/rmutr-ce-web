
import React from "react";
import { X } from "lucide-react";

export default function EventCard({ event, onClick, onEdit, onDelete }) {
    const handleClick = (e) => {
        e.stopPropagation();
        onClick?.(event);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`ต้องการลบ "${event.title}" หรือไม่?`)) {
            onDelete?.(event._id);
        }
    };

    const getBackgroundColor = () => {
        if (event.color) {
            return event.color;
        }

        const colors = {
            personal: "#9CA3AF",
            holiday: "#EF4444",
            exam: "#F59E0B",
            homework: "#3B82F6",
            meeting: "#8B5CF6",
            class: "#10B981",
            other: "#EC4899",
        };
        return colors[event.eventType] || "#8B5CF6";
    };

    const bgColor = getBackgroundColor();

    return (
        <div
            onClick={handleClick}
            className="group flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity relative"
            style={{
                backgroundColor: bgColor + "20",
            }}
        >
            {}
            <div
                className="w-1 h-3.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: bgColor }}
            />
            {}
            <span
                className="text-[14px] font-medium truncate flex-1"
                style={{ color: bgColor }}
            >
                {event.title}
            </span>

            {}
            <button
                onClick={handleDelete}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 transition-opacity"
                title="ลบ Event"
            >
                <X className="w-3.5 h-3.5 text-red-500" />
            </button>
        </div>
    );
}