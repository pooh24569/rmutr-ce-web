// frontend/src/components/calendar/CalendarGrid.jsx
import React from "react";
import CalendarCell from "./CalendarCell";


const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarGrid({
    cells,
    events,
    onCellClick,
    onEventClick,
    onEventEdit,
    onEventDelete,
}) {
    return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-neutral-200">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider border-r border-neutral-200 last:border-r-0"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                {cells.map((cell, index) => (
                    <CalendarCell
                        key={index}
                        cell={cell}
                        events={events}
                        onCellClick={onCellClick}
                        onEventClick={onEventClick}
                        onEventEdit={onEventEdit}
                        onEventDelete={onEventDelete}
                    />
                ))}
            </div>
        </div>
    );
}