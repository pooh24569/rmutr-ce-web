// frontend/src/components/calendar/CalendarCell.jsx
import React from "react";
import { isToday, isSameDay } from "@/utils/dateUtils";
import EventCard from "./EventCard";

export default function CalendarCell({
    cell,
    events = [],
    onCellClick,
    onEventClick,
    onEventEdit,
    onEventDelete,
}) {
    const dayEvents = events.filter((event) =>
        isSameDay(cell.date, event.startDate)
    );

    const isCurrentDay = isToday(cell.date);
    const dateNum = cell.date.getDate();

    return (
        <div
            onClick={() => onCellClick?.(cell.date)}
            className={`
        h-28 border-r border-b border-neutral-200 px-2 py-1.5
        flex flex-col cursor-pointer
        hover:bg-neutral-50 transition-colors
        ${!cell.isCurrentMonth ? "bg-neutral-50/50" : "bg-white"}
      `}
        >
            {/* Date Number */}
            <div className="flex items-center justify-between mb-1">
                <span
                    className={`
            text-xs font-medium
            ${isCurrentDay ? "flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white" : ""}
            ${!cell.isCurrentMonth ? "text-neutral-400" : "text-neutral-700"}
          `}
                >
                    {dateNum}
                </span>

                {/* Event count indicator */}
                {dayEvents.length > 3 && (
                    <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-full">
                        +{dayEvents.length - 3}
                    </span>
                )}
            </div>

            {/* Events */}
            <div className="flex-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => (
                    <EventCard
                        key={event._id}
                        event={event}
                        onClick={onEventClick}
                        onEdit={onEventEdit}
                        onDelete={onEventDelete}
                    />
                ))}
            </div>
        </div>
    );
}