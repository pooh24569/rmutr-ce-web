// src/pages/student/Schedule.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Calendar, Clock, MapPin, User, BookOpen, RefreshCw } from "lucide-react";
import { classService } from "@/services/classService";

// Time slots row (8:00–20:00)
const TIME_SLOTS = [
  "8:00",
  "9:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

const DAYS = [
  { key: "monday", label: "จันทร์", labelEn: "Monday" },
  { key: "tuesday", label: "อังคาร", labelEn: "Tuesday" },
  { key: "wednesday", label: "พุธ", labelEn: "Wednesday" },
  { key: "thursday", label: "พฤหัส", labelEn: "Thursday" },
  { key: "friday", label: "ศุกร์", labelEn: "Friday" },
  { key: "saturday", label: "เสาร์", labelEn: "Saturday" },
  { key: "sunday", label: "อาทิตย์", labelEn: "Sunday" },
];

// สี gradient สำหรับ Class cards
const COLORS = [
  { bg: "from-blue-400 to-blue-600", text: "text-white" },
  { bg: "from-purple-400 to-purple-600", text: "text-white" },
  { bg: "from-green-400 to-green-600", text: "text-white" },
  { bg: "from-orange-400 to-orange-600", text: "text-white" },
  { bg: "from-pink-400 to-pink-600", text: "text-white" },
  { bg: "from-teal-400 to-teal-600", text: "text-white" },
];

const Schedule = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnrolledClasses();
  }, []);

  const fetchEnrolledClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await classService.getEnrolledClasses();
      if (response.success) {
        setClasses(response.data);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError("ไม่สามารถโหลดตารางเรียนได้");
    } finally {
      setLoading(false);
    }
  };

  // แปลง schedule entries เป็น format ที่ใช้แสดง
  const scheduleEntries = useMemo(() => {
    const entries = [];

    classes.forEach((cls, classIndex) => {
      if (!cls.schedule) return;

      cls.schedule.forEach((sch) => {
        // แปลงเวลาเป็น slot index
        const startHour = parseInt(sch.startTime?.split(":")[0] || "8");
        const endHour = parseInt(sch.endTime?.split(":")[0] || "9");

        entries.push({
          id: `${cls._id}-${sch.day}`,
          classId: cls._id,
          day: sch.day,
          startHour,
          endHour,
          classCode: cls.classCode,
          className: cls.className,
          section: cls.section,
          room: sch.room || "-",
          teacher: cls.teacher
            ? `${cls.teacher.firstName || ""} ${cls.teacher.lastName || ""}`
            : "-",
          color: COLORS[classIndex % COLORS.length],
        });
      });
    });

    return entries;
  }, [classes]);

  // Group entries by day
  const entriesByDay = useMemo(() => {
    const map = {};
    DAYS.forEach((d) => (map[d.key] = []));

    scheduleEntries.forEach((entry) => {
      if (map[entry.day]) {
        map[entry.day].push(entry);
      }
    });

    return map;
  }, [scheduleEntries]);

  // คำนวณตำแหน่งและขนาดของ block
  const getBlockStyle = (entry) => {
    const startSlot = entry.startHour - 8; // 8:00 = slot 0
    const duration = entry.endHour - entry.startHour;
    const left = (startSlot / 12) * 100;
    const width = (duration / 12) * 100;
    return { left: `${left}%`, width: `${width}%` };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">กำลังโหลดตารางเรียน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              ตารางเรียน
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ปีการศึกษา 2567 ภาคเรียนที่ 2
            </p>
          </div>
          <button
            onClick={fetchEnrolledClasses}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            รีเฟรช
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 bg-gray-50 p-6 overflow-auto">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchEnrolledClasses}
              className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            >
              ลองใหม่
            </button>
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ยังไม่มีวิชาที่ลงทะเบียน
            </h3>
            <p className="text-gray-500">
              รอให้อาจารย์เพิ่มคุณเข้าวิชาก่อนนะครับ
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Schedule Grid */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Time header */}
              <div className="grid grid-cols-[100px_1fr] border-b border-gray-200">
                <div className="bg-gray-50 border-r border-gray-200 p-3">
                  <span className="text-xs font-medium text-gray-500">วัน/เวลา</span>
                </div>
                <div className="grid grid-cols-12 bg-gray-50">
                  {TIME_SLOTS.map((time) => (
                    <div
                      key={time}
                      className="text-center py-3 text-xs font-medium text-gray-500 border-r border-gray-100 last:border-r-0"
                    >
                      {time}
                    </div>
                  ))}
                </div>
              </div>

              {/* Days */}
              {DAYS.map((day) => (
                <div
                  key={day.key}
                  className="grid grid-cols-[100px_1fr] border-b border-gray-100 last:border-b-0"
                >
                  {/* Day label */}
                  <div className="bg-gray-50 border-r border-gray-200 p-3 flex flex-col justify-center">
                    <span className="text-sm font-medium text-gray-800">
                      {day.label}
                    </span>
                    <span className="text-xs text-gray-400">{day.labelEn}</span>
                  </div>

                  {/* Time slots */}
                  <div className="relative min-h-[70px]">
                    {/* Grid lines */}
                    <div className="absolute inset-0 grid grid-cols-12">
                      {TIME_SLOTS.map((_, idx) => (
                        <div
                          key={idx}
                          className="border-r border-gray-50 last:border-r-0"
                        />
                      ))}
                    </div>

                    {/* Class blocks */}
                    {entriesByDay[day.key]?.map((entry) => (
                      <div
                        key={entry.id}
                        className="absolute top-1 bottom-1 px-0.5"
                        style={getBlockStyle(entry)}
                      >
                        <div
                          className={`h-full bg-gradient-to-r ${entry.color.bg} ${entry.color.text} rounded-lg p-2 shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden`}
                        >
                          <div className="text-xs font-bold truncate">
                            {entry.classCode}
                          </div>
                          <div className="text-[10px] opacity-90 truncate">
                            {entry.className}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[10px] opacity-80">
                            <MapPin className="w-3 h-3" />
                            <span>{entry.room}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Class List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">
                  รายวิชาที่ลงทะเบียน ({classes.length} วิชา)
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {classes.map((cls, index) => (
                  <div
                    key={cls._id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${COLORS[index % COLORS.length].bg} flex items-center justify-center text-white font-bold text-lg shadow-sm`}
                      >
                        {cls.classCode?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">
                            {cls.classCode}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            Section {cls.section}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-800 mt-0.5">
                          {cls.className}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {cls.teacher?.firstName} {cls.teacher?.lastName}
                          </span>
                          {cls.schedule?.[0] && (
                            <>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {cls.schedule[0].startTime} - {cls.schedule[0].endTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {cls.schedule[0].room}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;