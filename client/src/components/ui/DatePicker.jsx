import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS_TH = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
    "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
    "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const DAYS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

const THEMES = {
    green: {
        gradient: "from-green-500 to-teal-500",
        selected: "bg-green-500",
        today: "bg-green-100 text-green-700 hover:bg-green-200",
        ring: "focus:ring-green-500/20 focus:border-green-500",
        accent: "text-green-600 hover:text-green-700"
    },
    blue: {
        gradient: "from-blue-500 to-indigo-500",
        selected: "bg-blue-500",
        today: "bg-blue-100 text-blue-700 hover:bg-blue-200",
        ring: "focus:ring-blue-500/20 focus:border-blue-500",
        accent: "text-blue-600 hover:text-blue-700"
    },
    red: {
        gradient: "from-red-500 to-pink-500",
        selected: "bg-red-500",
        today: "bg-red-100 text-red-700 hover:bg-red-200",
        ring: "focus:ring-red-500/20 focus:border-red-500",
        accent: "text-red-600 hover:text-red-700"
    }
};

export const DatePicker = ({
    value,
    onChange,
    name,
    placeholder = "เลือกวันที่",
    className = "",
    minYear = 1940,
    maxYear = new Date().getFullYear(),
    theme = "blue",
    label = "วันที่"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewMode, setViewMode] = useState("calendar");
    const [viewDate, setViewDate] = useState(() => {
        if (value) return new Date(value);
        return new Date(1980, 0, 1);
    });
    const containerRef = useRef(null);
    const themeColors = THEMES[theme] || THEMES.blue;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setViewMode("calendar");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (value) {
            setViewDate(new Date(value));
        }
    }, [value]);

    // Parse date string safely without timezone shift
    const parseLocalDate = (dateStr) => {
        if (!dateStr) return null;
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const selectedDate = value ? parseLocalDate(value) : null;

    const formatDisplayDate = (date) => {
        if (!date) return "";
        const d = parseLocalDate(date);
        if (!d || isNaN(d.getTime())) return "";
        const day = d.getDate();
        const month = MONTHS_TH[d.getMonth()];
        const year = d.getFullYear() + 543;
        return `${day} ${month} ${year}`;
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const handleDateChange = (formattedDate) => {
        if (typeof onChange === 'function') {
            if (name) {
                onChange({ target: { name, value: formattedDate } });
            } else {
                onChange(formattedDate);
            }
        }
    };

    const selectDate = (day) => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth() + 1; // 1-indexed for string
        // Format as YYYY-MM-DD without timezone conversion
        const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        handleDateChange(formattedDate);
        setIsOpen(false);
        setViewMode("calendar");
    };

    const selectMonth = (monthIndex) => {
        setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
        setViewMode("calendar");
    };

    const selectYear = (year) => {
        setViewDate(new Date(year, viewDate.getMonth(), 1));
        setViewMode("month");
    };

    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isSelected = selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;

            const isToday = new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => selectDate(day)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-all
            ${isSelected
                            ? `${themeColors.selected} text-white shadow-md`
                            : isToday
                                ? themeColors.today
                                : "text-gray-700 hover:bg-gray-100"
                        }`}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    const renderYears = () => {
        const years = [];
        for (let year = maxYear; year >= minYear; year--) {
            const isSelected = viewDate.getFullYear() === year;
            years.push(
                <button
                    key={year}
                    type="button"
                    onClick={() => selectYear(year)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
            ${isSelected
                            ? `${themeColors.selected} text-white`
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                >
                    {year + 543}
                </button>
            );
        }
        return years;
    };

    const renderMonths = () => {
        return MONTHS_TH.map((month, index) => {
            const isSelected = viewDate.getMonth() === index;
            return (
                <button
                    key={month}
                    type="button"
                    onClick={() => selectMonth(index)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
            ${isSelected
                            ? `${themeColors.selected} text-white`
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                >
                    {month}
                </button>
            );
        });
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer
          focus:outline-none focus:ring-2 ${themeColors.ring} 
          transition-all bg-white hover:border-gray-400 flex items-center gap-2`}
            >
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className={value ? "text-gray-800" : "text-gray-400"}>
                    {value ? formatDisplayDate(value) : placeholder}
                </span>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className={`bg-gradient-to-r ${themeColors.gradient} p-4 text-white`}>
                        <p className="text-sm opacity-80">{label}</p>
                        <p className="text-lg font-semibold">
                            {value ? formatDisplayDate(value) : "เลือกวันที่"}
                        </p>
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        {viewMode === "calendar" && (
                            <>
                                <button type="button" onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setViewMode("month")} className="px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                        {MONTHS_TH[viewDate.getMonth()]}
                                    </button>
                                    <button type="button" onClick={() => setViewMode("year")} className="px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                        {viewDate.getFullYear() + 543}
                                    </button>
                                </div>
                                <button type="button" onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                    <ChevronRight className="w-5 h-5 text-gray-600" />
                                </button>
                            </>
                        )}
                        {viewMode === "month" && (
                            <button type="button" onClick={() => setViewMode("year")} className="w-full text-center py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                ปี {viewDate.getFullYear() + 543}
                            </button>
                        )}
                        {viewMode === "year" && (
                            <span className="w-full text-center text-sm font-medium text-gray-700">เลือกปี</span>
                        )}
                    </div>

                    <div className="p-3">
                        {viewMode === "calendar" && (
                            <>
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {DAYS_TH.map((day) => (
                                        <div key={day} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-400">{day}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
                            </>
                        )}
                        {viewMode === "month" && <div className="grid grid-cols-3 gap-2">{renderMonths()}</div>}
                        {viewMode === "year" && <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">{renderYears()}</div>}
                    </div>

                    <div className="flex justify-between px-4 py-3 border-t bg-gray-50">
                        <button type="button" onClick={() => { handleDateChange(""); setIsOpen(false); }} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">ล้าง</button>
                        <button type="button" onClick={() => { setIsOpen(false); setViewMode("calendar"); }} className={`text-sm font-medium ${themeColors.accent} transition-colors`}>ปิด</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;
