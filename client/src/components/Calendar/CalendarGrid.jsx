
import React from "react";
import CalendarCell from "./CalendarCell";

const WEEKDAYS = [
    { name: "MON", isWeekend: false },
    { name: "TUE", isWeekend: false },
    { name: "WED", isWeekend: false },
    { name: "THE", isWeekend: false },
    { name: "FRI", isWeekend: false },
    { name: "SAT", isWeekend: true },
    { name: "SUN", isWeekend: true },
];

export default function CalendarGrid({
    cells,
    events,
    onCellClick,
    onEventClick,
    onEventEdit,
    onEventDelete,
}) {

    const reorderedCells = cells.map((cell) => {
        const dayOfWeek = cell.date.getDay();

        const newDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        return { ...cell, dayIndex: newDayIndex };
    });

    return (
        <div className="flex-1 flex flex-col bg-white">
            {}
            <div className="grid grid-cols-7 border-b border-neutral-200">
                {WEEKDAYS.map((day, index) => (
                    <div
                        key={day.name}
                        className={`
                            py-3 text-center text-xs font-semibold uppercase tracking-wider
                            border-r border-neutral-200 last:border-r-0
                            ${day.isWeekend ? "text-red-500" : "text-neutral-500"}
                        `}
                    >
                        {day.name}
                    </div>
                ))}
            </div>

            {}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                {cells.map((cell, index) => {
                    const dayOfWeek = cell.date.getDay();
                    const isSunday = dayOfWeek === 0;
                    const isSaturday = dayOfWeek === 6;

                    return (
                        <CalendarCell
                            key={index}
                            cell={cell}
                            events={events}
                            isSunday={isSunday}
                            isSaturday={isSaturday}
                            onCellClick={onCellClick}
                            onEventClick={onEventClick}
                            onEventEdit={onEventEdit}
                            onEventDelete={onEventDelete}
                        />
                    );
                })}
            </div>
        </div>
    );
}