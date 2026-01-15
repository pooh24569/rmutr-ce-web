
import React from "react";
import Calendar from "@/components/calendar/Calendar";

export default function TeacherCalendarPage() {
    return (
        <div className="flex flex-col h-full">
            {}
            <header className="h-16 flex items-center px-8 border-b border-[#dddddd] bg-white">
                <div>
                    <h1 className="text-xs font-semibold tracking-wide text-blue-600 uppercase">
                        CALENDAR
                    </h1>
                    <div className="mt-1 text-[11px] text-[#777]">
                        Manage your schedule
                    </div>
                </div>
            </header>

            <section className="flex-1 bg-[#e5e5e5] p-6 overflow-hidden">
                <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden">
                    <Calendar />
                </div>
            </section>
        </div>
    );
}
