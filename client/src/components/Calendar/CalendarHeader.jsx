// frontend/src/components/calendar/CalendarHeader.jsx
import React from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { getMonthName } from "@/utils/dateUtils";


export default function CalendarHeader({
    year,
    month,
    onPrevMonth,
    onNextMonth,
    onAddEvent,
}) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white">
            {/* Month/Year */}
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-neutral-900">
                    {getMonthName(month)} {year}
                </h2>

                {/* Navigation */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={onPrevMonth}
                        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                        title="Previous month"
                    >
                        <ChevronLeft className="w-5 h-5 text-neutral-600" />
                    </button>

                    <button
                        onClick={onNextMonth}
                        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                        title="Next month"
                    >
                        <ChevronRight className="w-5 h-5 text-neutral-600" />
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onAddEvent}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Event</span>
                </button>
            </div>
        </div>
    );
}