// frontend/src/components/calendar/CalendarCell.jsx
import React from "react";
import { isToday, isSameDay } from "@/utils/dateUtils";
import { getHolidayName } from "@/utils/thaiHolidays";
import EventCard from "./EventCard";

export default function CalendarCell({
    cell,
    events = [],
    isSunday,
    isSaturday,
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
    const holidayName = getHolidayName(cell.date);
    const isHoliday = !!holidayName;

    // Determine text color
    const getDateColor = () => {
        if (!cell.isCurrentMonth) return "text-neutral-300";
        if (isHoliday || isSunday) return "text-red-500";
        if (isSaturday) return "text-blue-500";
        return "text-neutral-700";
    };

    return (
        <div
            onClick={() => onCellClick?.(cell.date)}
            className={`
                min-h-[100px] border-r border-b border-neutral-200 p-2
                flex flex-col cursor-pointer
                hover:bg-neutral-50 transition-colors
                ${!cell.isCurrentMonth ? "bg-neutral-50" : "bg-white"}
            `}
            style={!cell.isCurrentMonth ? {
                backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 6px)'
            } : {}}
        >
            {/* Date Number */}
            <div className="flex items-start justify-between mb-1">
                <span
                    className={`
                        text-sm font-medium
                        ${isCurrentDay
                            ? "flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 text-white"
                            : getDateColor()
                        }
                    `}
                >
                    {dateNum}
                </span>

                {/* Event count indicator */}
                {dayEvents.length > 2 && (
                    <span className="text-[10px] text-neutral-400">
                        +{dayEvents.length - 2}
                    </span>
                )}
            </div>

            {/* Thai Holiday - with highlight like event card */}
            {holidayName && cell.isCurrentMonth && (
                <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded mb-1"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                >
                    <div className="w-1 h-3.5 rounded-full flex-shrink-0 bg-red-500" />
                    <span className="text-[11px] font-medium truncate text-red-500">
                        {holidayName}
                    </span>
                </div>
            )}

            {/* Events */}
            <div className="flex-1 space-y-1 overflow-hidden">
                {dayEvents.slice(0, 2).map((event) => (
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