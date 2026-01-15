
import React from "react";
import StudentHeader from "@/components/student/StudentHeader";
import Calendar from "@/components/calendar/Calendar";

export default function CalendarPage() {
    return (
        <div className="flex flex-col h-full">
            <StudentHeader title="CALENDAR"  />

            <section className="flex-1 bg-[#e5e5e5] p-6 overflow-hidden">
                <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden">
                    <Calendar />
                </div>
            </section>
        </div>
    );
}