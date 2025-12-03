// src/pages/student/Schedule.jsx
import React, { useMemo } from "react";

// Time slots row (8:00–20:00)
const TIME_SLOTS = [
  "8:00 - 9:00",
  "9:01 - 10:00",
  "10:01 - 11:00",
  "11:01 - 12:00",
  "12:01 - 13:00",
  "13:01 - 14:00",
  "14:01 - 15:00",
  "15:01 - 16:00",
  "16:01 - 17:00",
  "17:01 - 18:00",
  "18:01 - 19:00",
  "19:01 - 20:00",
];

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Mock classes to look like the design
const CLASSES = [
  {
    id: "dbt2266-mon",
    day: "Monday",
    startSlot: 1, // 9–10
    endSlot: 5, // 13–14
    code: "DBT 2266-66",
    room: "01-102",
    instructor: "Asst. Prof. Worasith Thaisut",
    colorBg: "#fffbe6",
    colorBorder: "#f2cf5b",
  },
  {
    id: "dbt2214-tue",
    day: "Tuesday",
    startSlot: 2, // 10–11
    endSlot: 5, // 13–14
    code: "DBT 2214-66",
    room: "01-103",
    instructor: "Asst. Prof. Worasith Thaisut",
    colorBg: "#ffeaf2",
    colorBorder: "#f7b6d8",
  },
  {
    id: "dbt3223-thu",
    day: "Thursday",
    startSlot: 6, // 14–15
    endSlot: 10, // 18–19
    code: "DBT 3223-66",
    room: "01-100",
    instructor: "Lect. Warisara Oupra",
    colorBg: "#fff3df",
    colorBorder: "#f4a64c",
  },
];

// Bottom course table data
const COURSE_ROWS = [
  {
    code: "DBT 2266-66",
    sec: "1",
    nameTh: "โปรแกรมบนเว็บ",
    nameEn: "Web Programming",
    credit: "3(2-2-5)",
    instructor: "อาจารย์วรสิทธิ์ ไทยสุดา",
    examDate: "Mon 09:00 - 12:00",
    room: "01-102",
  },
  {
    code: "DBT 3223-66",
    sec: "1",
    nameTh: "การวิเคราะห์และออกแบบระบบ",
    nameEn: "System Analysis and Design",
    credit: "3(2-2-5)",
    instructor: "อาจารย์วริศรา อุปะรา",
    examDate: "Thu 14:00 - 18:00",
    room: "01-100",
  },
  {
    code: "DBT 2214-66",
    sec: "1",
    nameTh: "ระบบสื่อสังคมออนไลน์",
    nameEn: "Social Media System",
    credit: "3(2-2-5)",
    instructor: "อาจารย์วริศรา อุปะรา",
    examDate: "Tue 10:00 - 13:00",
    room: "01-103",
  },
];

const Schedule = () => {
  // group classes by day
  const classByDay = useMemo(() => {
    const map = {};
    for (const d of DAYS) map[d] = [];
    for (const c of CLASSES) {
      if (!map[c.day]) map[c.day] = [];
      map[c.day].push(c);
    }
    return map;
  }, []);

  const totalSlots = TIME_SLOTS.length;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <header className="h-16 flex items-center px-8 border-b border-[#dddddd] bg-white">
        <div>
          <h1 className="text-xs font-semibold tracking-wide text-[#e62b2b] uppercase">
            STUDY / EXAM SCHEDULE
          </h1>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-[#777]">
            <span className="font-semibold">Year</span>
            <span>2025</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="flex-1 bg-[#e5e5e5] px-8 py-6 space-y-6">
        {/* Schedule board */}
        <div className="bg-white rounded-md border border-[#dddddd] shadow-sm overflow-hidden">
          {/* Time header row */}
          <div className="grid grid-cols-[110px_repeat(12,minmax(0,1fr))] border-b border-[#e5e5e5] text-[11px] text-[#777]">
            <div className="flex flex-col justify-center items-center border-r border-[#e5e5e5] bg-[#f5f5f9] text-[10px] font-semibold uppercase tracking-wide">
              <span>days/</span>
              <span>time</span>
            </div>
            {TIME_SLOTS.map((slot) => (
              <div
                key={slot}
                className="h-10 flex items-center justify-center border-r border-[#e5e5e5] bg-[#f5f5f9]"
              >
                {slot}
              </div>
            ))}
          </div>

          {/* Day rows */}
          <div className="text-xs text-[#333]">
            {DAYS.map((day) => (
              <div
                key={day}
                className="grid grid-cols-[110px_minmax(0,1fr)] border-b border-[#ececec] h-16"
              >
                {/* Day label */}
                <div className="flex items-center justify-center border-r border-[#ececec] bg-white text-[11px]">
                  {day}
                </div>

                {/* Timeline area */}
                <div className="relative bg-white">
                  {/* Vertical grid lines */}
                  <div className="grid grid-cols-12 h-full">
                    {TIME_SLOTS.map((slot, idx) => (
                      <div
                        key={slot}
                        className={[
                          "border-r border-[#f0f0f0]",
                          idx === 0 ? "border-l border-[#f0f0f0]" : "",
                        ].join(" ")}
                      />
                    ))}
                  </div>

                  {/* Class blocks */}
                  {classByDay[day].map((cls) => {
                    const left = (cls.startSlot / totalSlots) * 100;
                    const width =
                      ((cls.endSlot - cls.startSlot) / totalSlots) * 100;
                    return (
                      <div
                        key={cls.id}
                        className="absolute top-1 bottom-1 flex items-center justify-center text-[10px]"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                        }}
                      >
                        <div
                          className="w-full h-full flex flex-col justify-center rounded-md border px-3 py-1"
                          style={{
                            backgroundColor: cls.colorBg,
                            borderColor: cls.colorBorder,
                          }}
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] font-semibold border border-current text-[#ff7a00] bg-white/60">
                              {cls.code}
                            </span>
                            <span className="text-[9px] text-[#777]">
                              {cls.room}
                            </span>
                          </div>
                          <div className="text-[9px] text-[#555] truncate">
                            {cls.instructor}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom course table */}
        <div className="bg-[#f2f2f2] rounded-md border border-[#d9d9d9] overflow-hidden shadow-sm">
          {/* Header */}
          <div className="grid grid-cols-[120px_60px_minmax(0,1.4fr)_110px_minmax(0,1.1fr)_minmax(0,1.2fr)_120px] bg-[#e6e9f4] text-[10px] font-semibold text-[#555] border-b border-[#d4d7e0]">
            <div className="px-4 py-2 border-r border-[#d4d7e0]">
              Subject Code
            </div>
            <div className="px-2 py-2 border-r border-[#d4d7e0]">Sec.</div>
            <div className="px-4 py-2 border-r border-[#d4d7e0]">
              Subject Name
            </div>
            <div className="px-4 py-2 border-r border-[#d4d7e0]">Credit</div>
            <div className="px-4 py-2 border-r border-[#d4d7e0]">Lecturer</div>
            <div className="px-4 py-2 border-r border-[#d4d7e0]">
              Study/Exam Time
            </div>
            <div className="px-4 py-2">Room</div>
          </div>

          {/* Body */}
          <div className="text-[10px] text-[#444]">
            {COURSE_ROWS.map((row) => (
              <div
                key={row.code}
                className="grid grid-cols-[120px_60px_minmax(0,1.4fr)_110px_minmax(0,1.1fr)_minmax(0,1.2fr)_120px] border-b border-[#e1e1e1] bg-white hover:bg-[#fafafa]"
              >
                <div className="px-4 py-2 border-r border-[#ececec]">
                  {row.code}
                </div>
                <div className="px-2 py-2 border-r border-[#ececec]">
                  {row.sec}
                </div>
                <div className="px-4 py-2 border-r border-[#ececec]">
                  <div className="truncate">{row.nameTh}</div>
                  <div className="text-[9px] text-[#999] truncate">
                    {row.nameEn}
                  </div>
                </div>
                <div className="px-4 py-2 border-r border-[#ececec]">
                  {row.credit}
                </div>
                <div className="px-4 py-2 border-r border-[#ececec]">
                  {row.instructor}
                </div>
                <div className="px-4 py-2 border-r border-[#ececec]">
                  {row.examDate}
                </div>
                <div className="px-4 py-2">{row.room}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Schedule;