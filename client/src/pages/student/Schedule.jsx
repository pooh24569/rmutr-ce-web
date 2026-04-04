
import React, { useState, useEffect, useMemo } from "react";
import { RefreshCw, User, BookOpen, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

const TIME_SLOTS = [
  { start: "8:00", end: "9:00" },
  { start: "9:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "11:00", end: "12:00" },
  { start: "12:00", end: "13:00" },
  { start: "13:00", end: "14:00" },
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" },
  { start: "17:00", end: "18:00" },
  { start: "18:00", end: "19:00" },
  { start: "19:00", end: "20:00" },
  { start: "20:00", end: "21:00" },
  { start: "21:00", end: "22:00" },
];

// Support both CourseOffering format (mon/tue) and Class format (monday/tuesday)
const DAY_NORMALIZE = {
  mon: "monday", tue: "tuesday", wed: "wednesday",
  thu: "thursday", fri: "friday", sat: "saturday", sun: "sunday",
  monday: "monday", tuesday: "tuesday", wednesday: "wednesday",
  thursday: "thursday", friday: "friday", saturday: "saturday", sunday: "sunday",
};

const DAYS = [
  { key: "monday", label: "จันทร์" },
  { key: "tuesday", label: "อังคาร" },
  { key: "wednesday", label: "พุธ" },
  { key: "thursday", label: "พฤหัสบดี" },
  { key: "friday", label: "ศุกร์" },
  { key: "saturday", label: "เสาร์" },
  { key: "sunday", label: "อาทิตย์" },
];

const COLORS = [
  { bg: "bg-yellow-50", leftBorder: "border-l-4 border-l-pink-500" },
  { bg: "bg-green-50", leftBorder: "border-l-4 border-l-green-500" },
  { bg: "bg-blue-50", leftBorder: "border-l-4 border-l-blue-500" },
  { bg: "bg-orange-50", leftBorder: "border-l-4 border-l-orange-500" },
  { bg: "bg-purple-50", leftBorder: "border-l-4 border-l-purple-500" },
  { bg: "bg-red-50", leftBorder: "border-l-4 border-l-red-500" },
];

const Schedule = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const year = 2567;

  useEffect(() => {
    fetchEnrolledClasses();
  }, []);

  const fetchEnrolledClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: response } = await api.get("/student-registration/my-courses");
      if (response.success) {
        setClasses(response.data.courses || []);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError(err.response?.data?.message || "ไม่สามารถโหลดตารางเรียนได้");
    } finally {
      setLoading(false);
    }
  };

  const scheduleEntries = useMemo(() => {
    const entries = [];

    classes.forEach((cls, classIndex) => {
      if (!cls.schedule) return;

      cls.schedule.forEach((sch) => {
        const startHour = parseInt(sch.startTime?.split(":")[0] || "8");
        const endHour = parseInt(sch.endTime?.split(":")[0] || "9");

        // Normalize day key: mon → monday, etc.
        const normalizedDay = DAY_NORMALIZE[sch.day] || sch.day;

        entries.push({
          id: `${cls._id}-${sch.day}`,
          classId: cls._id,
          day: normalizedDay,
          startHour,
          endHour,
          duration: endHour - startHour,
          classCode: cls.course?.courseCode || cls.classCode,
          className: cls.course?.courseNameTH || cls.className,
          section: cls.section,
          room: sch.room || "-",
          teacher: cls.instructor
            ? `${cls.instructor.firstName || ""} ${cls.instructor.lastName || ""}`
            : cls.teacher
              ? `${cls.teacher.firstName || ""} ${cls.teacher.lastName || ""}`
              : "-",
          color: COLORS[classIndex % COLORS.length],
        });
      });
    });

    return entries;
  }, [classes]);

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

  const getDayLabel = (day) => {
    const days = {
      mon: "จันทร์", tue: "อังคาร", wed: "พุธ",
      thu: "พฤหัส", fri: "ศุกร์", sat: "เสาร์", sun: "อาทิตย์",
      monday: "จันทร์", tuesday: "อังคาร", wednesday: "พุธ",
      thursday: "พฤหัส", friday: "ศุกร์", saturday: "เสาร์", sunday: "อาทิตย์",
    };
    return days[day] || day;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      { }
      <header className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white tracking-wide">
            STUDY SCHEDULE
          </h1>
          <button
            onClick={fetchEnrolledClasses}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </header>

      { }
      <div className="flex-1 p-6 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">กำลังโหลด...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchEnrolledClasses}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            >
              ลองใหม่
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {classes.length === 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  (ยังไม่มีวิชาลงทะเบียน —{" "}
                  <button
                    onClick={() => navigate("/student/registration")}
                    className="text-red-500 hover:underline"
                  >
                    ไปลงทะเบียน
                  </button>
                  )
                </span>
              </div>
            )}

            { }
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
              { }
              <div className="grid grid-cols-[80px_repeat(14,minmax(70px,1fr))] border-b border-gray-200 bg-gray-100">
                <div className="p-2 text-center border-r border-gray-200">
                  <span className="text-xs text-gray-600 font-medium">วัน/เวลา</span>
                </div>
                {TIME_SLOTS.map((slot, idx) => (
                  <div
                    key={idx}
                    className="p-2 text-center text-[10px] text-gray-600 border-r border-gray-200 last:border-r-0 whitespace-nowrap"
                  >
                    {slot.start} - {slot.end}
                  </div>
                ))}
              </div>

              { }
              {DAYS.map((day) => {
                const dayEntries = entriesByDay[day.key] || [];

                return (
                  <div
                    key={day.key}
                    className="grid grid-cols-[80px_repeat(14,minmax(70px,1fr))] border-b border-gray-100 last:border-b-0 h-[50px]"
                  >
                    { }
                    <div className="p-2 border-r border-gray-200 bg-gray-50 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">
                        {day.label}
                      </span>
                    </div>

                    { }
                    <div className="col-span-14 relative">
                      { }
                      <div className="absolute inset-0 grid grid-cols-14">
                        {TIME_SLOTS.map((_, idx) => (
                          <div
                            key={idx}
                            className="border-r border-gray-100 last:border-r-0"
                          />
                        ))}
                      </div>

                      { }
                      <div
                        className="absolute inset-0 p-0.5 grid"
                        style={{
                          gridTemplateColumns: 'repeat(14, minmax(70px, 1fr))',
                          gridTemplateRows: '1fr',
                          gridAutoFlow: 'column',
                        }}
                      >
                        {dayEntries.map((entry) => {
                          const startCol = entry.startHour - 8;
                          const span = entry.duration;

                          return (
                            <div
                              key={entry.id}
                              className={`${entry.color.bg} ${entry.color.leftBorder} px-2 flex flex-col justify-center overflow-hidden h-full`}
                              style={{
                                gridColumn: `${startCol + 1} / span ${span}`,
                              }}
                            >
                              { }
                              <span className="text-xs font-bold text-gray-800 leading-tight truncate">
                                {entry.classCode} ({entry.section || "1"})
                              </span>
                              { }
                              <p className="text-[12px] text-gray-600 leading-tight truncate">
                                {entry.teacher || "-"}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            { }
            {classes.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        รหัสวิชา
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        SEC
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        รายวิชา
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        อาจารย์ผู้สอน
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        วัน/เวลาเรียน-ห้อง
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        สถานะ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {classes.map((cls) => (
                      <tr key={cls._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {cls.course?.courseCode || cls.classCode}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {cls.section || 1}
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          {cls.course?.courseNameTH || cls.className}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              {cls.instructor?.firstName || cls.teacher?.firstName}{" "}
                              {cls.instructor?.lastName || cls.teacher?.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {cls.schedule?.map((s, i) => (
                            <div key={i} className="text-xs">
                              <span className="inline-block bg-gray-100 px-1.5 py-0.5 rounded mr-1">
                                {getDayLabel(s.day)}
                              </span>
                              {s.startTime}-{s.endTime} ห้อง {s.room}
                            </div>
                          ))}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            ลงทะเบียนแล้ว
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;