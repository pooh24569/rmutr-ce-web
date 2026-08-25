
import React from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { getMonthName } from "@/utils/dateUtils";

export default function CalendarHeader({
    year,
    month,
    onPrevMonth,
    onNextMonth,
    onToday,
    onAddEvent,
    view = "month",
    onViewChange,
}) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white">
            {}
            <div className="flex items-center">
                <button
                    onClick={onToday}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                    Today
                </button>
            </div>

            {}
            <div className="flex items-center gap-2">
                <button
                    onClick={onPrevMonth}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                    title="Previous month"
                >
                    <ChevronLeft className="w-5 h-5 text-neutral-500" />
                </button>

                <h2 className="text-lg font-semibold text-neutral-800 min-w-[160px] text-center">
                    {getMonthName(month)} {year}
                </h2>

                <button
                    onClick={onNextMonth}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                    title="Next month"
                >
                    <ChevronRight className="w-5 h-5 text-neutral-500" />
                </button>
            </div>

            {}
            <div className="flex items-center">
                {}
                <button
                    onClick={onAddEvent}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Event</span>
                </button>
            </div>
        </div>
    );
}