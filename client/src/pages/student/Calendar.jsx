// src/pages/student/Calendar.jsx
import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

// --- Mock events (ตัวอย่างวันหยุด / event) ---
const HOLIDAY_EVENTS = [
    { date: "2025-05-01", title: "National Labor Day" },
    { date: "2025-05-04", title: "Coronation Day" },
    { date: "2025-05-11", title: "Visakha Bucha Day" },
    {
        date: "2025-05-12",
        title: "Compensatory holiday for Visakha Bucha Day",
    },
];

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function formatDateKey(date) {
    // YYYY-MM-DD
    return date.toISOString().slice(0, 10);
}

const Calendar = () => {
    // เก็บ state เป็น "เดือนที่กำลังดู" (วันที่ fix เป็น 1)
    const [monthCursor, setMonthCursor] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    const eventsByDate = useMemo(() => {
        const map = {};
        for (const ev of HOLIDAY_EVENTS) {
            if (!map[ev.date]) map[ev.date] = [];
            map[ev.date].push(ev);
        }
        return map;
    }, []);

    const todayKey = formatDateKey(new Date());

    const gridCells = useMemo(() => {
        const year = monthCursor.getFullYear();
        const month = monthCursor.getMonth();

        const firstOfMonth = new Date(year, month, 1);
        const startWeekday = firstOfMonth.getDay(); // 0 = Sunday

        // เริ่มกริดที่วันอาทิตย์ก่อนหน้า (หรือวันเดียวกัน ถ้าเริ่มที่ Sunday)
        const startDate = new Date(year, month, 1 - startWeekday);

        const cells = [];
        for (let i = 0; i < 42; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);

            cells.push({
                date: d,
                key: formatDateKey(d),
                inCurrentMonth: d.getMonth() === month,
            });
        }
        return cells;
    }, [monthCursor]);

    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();

    const handlePrevMonth = () => {
        setMonthCursor((prev) => {
            const y = prev.getFullYear();
            const m = prev.getMonth();
            return new Date(y, m - 1, 1);
        });
    };

    const handleNextMonth = () => {
        setMonthCursor((prev) => {
            const y = prev.getFullYear();
            const m = prev.getMonth();
            return new Date(y, m + 1, 1);
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Top bar เหมือน Dashboard */}
            <header className="h-16 flex items-center px-8 border-b border-[#dddddd] bg-white">
                <h1 className="text-sm font-semibold text-[#333]">Dashboard</h1>
            </header>

            {/* Content */}
            <section className="flex-1 bg-[#e5e5e5] px-8 py-6">
                <div className="bg-white rounded-md border border-[#dddddd] shadow-sm overflow-hidden">
                    {/* Month header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-[#e5e5e5]">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="p-1 rounded-full hover:bg-[#f5f5f5]"
                                aria-label="Previous month"
                            >
                                <ChevronLeft className="w-4 h-4 text-[#555]" />
                            </button>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="p-1 rounded-full hover:bg-[#f5f5f5]"
                                aria-label="Next month"
                            >
                                <ChevronRight className="w-4 h-4 text-[#555]" />
                            </button>
                            <span className="ml-3 text-sm font-semibold text-[#333]">
                                {MONTH_NAMES[month]} {year}
                            </span>
                        </div>
                    </div>

                    {/* Days of week row */}
                    <div className="grid grid-cols-7 border-b border-[#e5e5e5] bg-[#fafafa] text-[11px] text-[#777]">
                        {DAYS_OF_WEEK.map((name) => (
                            <div
                                key={name}
                                className="px-3 py-2 text-left font-semibold tracking-wide"
                            >
                                {name}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 text-xs text-[#333]">
                        {gridCells.map((cell, index) => {
                            const dateNum = cell.date.getDate();
                            const isToday = cell.key === todayKey;
                            const dayEvents = eventsByDate[cell.key] || [];

                            return (
                                <div
                                    key={cell.key + index}
                                    className={[
                                        "h-24 border-r border-b border-[#eeeeee] px-3 py-2 flex flex-col",
                                        !cell.inCurrentMonth ? "bg-[#fbfbfb] text-[#bbb]" : "",
                                    ].join(" ")}
                                >
                                    {/* วันที่ */}
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={[
                                                "text-[11px]",
                                                isToday ? "font-semibold text-[#2f80ed]" : "",
                                            ].join(" ")}
                                        >
                                            {dateNum}
                                        </span>
                                        {isToday && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#e6f0ff] text-[#2f80ed]">
                                                Today
                                            </span>
                                        )}
                                    </div>

                                    {/* Events */}
                                    <div className="mt-1 space-y-1">
                                        {dayEvents.map((ev, i) => (
                                            <div
                                                key={ev.title + i}
                                                className="inline-flex items-center gap-1 max-w-full px-2 py-1 rounded-full bg-[#e6f0ff] text-[10px] text-[#2563eb]"
                                            >
                                                <Star className="w-3 h-3 shrink-0" />
                                                <span className="truncate">{ev.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Calendar;