import React, { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  TrendingUp,
  RefreshCw,
  Fingerprint,
  Edit3,
} from "lucide-react";
import api from "@/lib/api";
import StudentHeader from "@/components/student/StudentHeader";

// ─── Color Palette ───────────────────────────────────────────────────
const COLORS = [
  { bg: "from-blue-500 to-blue-600", light: "bg-blue-50", text: "text-blue-600" },
  { bg: "from-emerald-500 to-emerald-600", light: "bg-emerald-50", text: "text-emerald-600" },
  { bg: "from-purple-500 to-purple-600", light: "bg-purple-50", text: "text-purple-600" },
  { bg: "from-orange-500 to-orange-600", light: "bg-orange-50", text: "text-orange-600" },
  { bg: "from-pink-500 to-pink-600", light: "bg-pink-50", text: "text-pink-600" },
  { bg: "from-teal-500 to-teal-600", light: "bg-teal-50", text: "text-teal-600" },
];

// ─── Status Config ───────────────────────────────────────────────────
const STATUS_CONFIG = {
  PRESENT: { label: "มาเรียน", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle2, dot: "bg-green-500" },
  LATE:    { label: "สาย",    color: "text-amber-600 bg-amber-50 border-amber-200", icon: Clock,        dot: "bg-amber-500" },
  ABSENT:  { label: "ขาดเรียน", color: "text-red-600 bg-red-50 border-red-200",    icon: XCircle,      dot: "bg-red-500" },
  EXCUSED: { label: "ลา",     color: "text-blue-600 bg-blue-50 border-blue-200",   icon: AlertCircle,  dot: "bg-blue-500" },
};

const Attendance = () => {
  // ─── State ─────────────────────────────────────────────────────────
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Per-course attendance summary cache
  const [summaries, setSummaries] = useState({}); // { [offeringId]: { summary, attendances } }
  const [loadingSummary, setLoadingSummary] = useState({});

  // Detail view
  const [selectedClass, setSelectedClass] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ─── Fetch Courses ─────────────────────────────────────────────────
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: response } = await api.get("/student-registration/my-courses");
      if (response.success) {
        const courses = response.data.courses || [];
        setClasses(courses);
        // Fetch summary for each course
        courses.forEach((cls) => fetchCourseSummary(cls._id));
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.response?.data?.message || "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseSummary = async (offeringId) => {
    try {
      setLoadingSummary((prev) => ({ ...prev, [offeringId]: true }));
      const { data: response } = await api.get(`/attendance/history/${offeringId}`);
      if (response.success) {
        setSummaries((prev) => ({ ...prev, [offeringId]: response.data }));
      }
    } catch (err) {
      console.error(`Error fetching summary for ${offeringId}:`, err);
    } finally {
      setLoadingSummary((prev) => ({ ...prev, [offeringId]: false }));
    }
  };

  // ─── Detail View ───────────────────────────────────────────────────
  const openDetail = async (cls) => {
    setSelectedClass(cls);
    setLoadingDetail(true);
    try {
      const { data: response } = await api.get(`/attendance/history/${cls._id}`);
      if (response.success) {
        setDetailData(response.data);
      }
    } catch (err) {
      console.error("Error fetching detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setSelectedClass(null);
    setDetailData(null);
  };

  // ─── Helpers ───────────────────────────────────────────────────────
  const getAttendanceRate = (summary) => {
    if (!summary || summary.total === 0) return 0;
    return summary.attendanceRate || 0;
  };

  const getRateColor = (rate) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getRateBarColor = (rate) => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ─── Loading State ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <StudentHeader title="ATTENDANCE" />
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Detail View ───────────────────────────────────────────────────
  if (selectedClass && detailData) {
    const { summary, attendances } = detailData;
    const colorIndex = classes.findIndex((c) => c._id === selectedClass._id);
    const palette = COLORS[colorIndex % COLORS.length];
    const rate = getAttendanceRate(summary);

    return (
      <div className="flex flex-col h-full">
        <StudentHeader
          breadcrumbs={[
            { label: "สถิติเข้าเรียน", link: "/student/attendance" },
            { label: selectedClass.course?.courseCode || "รายวิชา" },
          ]}
          subtitle={selectedClass.course?.courseNameTH || selectedClass.course?.courseNameEN}
        />

        <section className="flex-1 px-4 sm:px-6 py-4 sm:py-6 bg-gray-100 overflow-y-auto">
          {/* Back Button */}
          <button
            onClick={closeDetail}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">กลับ</span>
          </button>

          {/* Summary Card */}
          <div className={`bg-gradient-to-r ${palette.bg} rounded-2xl p-6 text-white mb-6 shadow-lg`}>
            <h2 className="text-lg font-bold mb-1">
              {selectedClass.course?.courseCode}
            </h2>
            <p className="text-white/80 text-sm mb-4">
              {selectedClass.course?.courseNameTH || selectedClass.course?.courseNameEN}
            </p>

            <div className="grid grid-cols-5 gap-3">
              <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{summary?.total || 0}</p>
                <p className="text-xs text-white/70">ทั้งหมด</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{summary?.present || 0}</p>
                <p className="text-xs text-white/70">มา</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{summary?.late || 0}</p>
                <p className="text-xs text-white/70">สาย</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{summary?.absent || 0}</p>
                <p className="text-xs text-white/70">ขาด</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{rate}%</p>
                <p className="text-xs text-white/70">อัตรา</p>
              </div>
            </div>
          </div>

          {/* Attendance Records */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                ประวัติเข้าเรียน ({attendances?.length || 0} ครั้ง)
              </h3>
            </div>

            {loadingDetail ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">กำลังโหลด...</p>
              </div>
            ) : attendances?.length === 0 ? (
              <div className="p-8 text-center">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">ยังไม่มีข้อมูลการเข้าเรียน</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {attendances.map((att, index) => {
                  const statusConf = STATUS_CONFIG[att.status] || STATUS_CONFIG.ABSENT;
                  const StatusIcon = statusConf.icon;

                  return (
                    <div
                      key={att._id || index}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Date number */}
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex flex-col items-center justify-center">
                          <span className="text-lg font-bold text-gray-800 leading-none">
                            {new Date(att.date).getDate()}
                          </span>
                          <span className="text-[10px] text-gray-500 uppercase">
                            {new Date(att.date).toLocaleDateString("th-TH", { month: "short" })}
                          </span>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            ครั้งที่ {attendances.length - index}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {att.sessionId?.room && (
                              <span className="text-xs text-gray-500">
                                ห้อง {att.sessionId.room}
                              </span>
                            )}
                            {att.checkInTime && (
                              <span className="text-xs text-gray-400">
                                เช็คชื่อ {formatTime(att.checkInTime)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Method icon */}
                        {att.method === "FINGERPRINT" ? (
                          <Fingerprint className="w-4 h-4 text-gray-400" title="สแกนลายนิ้วมือ" />
                        ) : att.method === "MANUAL" ? (
                          <Edit3 className="w-4 h-4 text-gray-400" title="เช็คชื่อโดยอาจารย์" />
                        ) : null}

                        {/* Status badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConf.color}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConf.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ─── Course List View (Main) ───────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      <StudentHeader title="ATTENDANCE" />

      <section className="flex-1 px-4 sm:px-6 py-4 sm:py-6 bg-gray-100 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">สถิติการเข้าเรียน</h2>
            <p className="text-sm text-gray-500">
              ลงทะเบียน {classes.length} วิชา
            </p>
          </div>
          <button
            onClick={fetchCourses}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-600">
            {error}
          </div>
        )}

        {classes.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              ยังไม่มีรายวิชา
            </h3>
            <p className="text-gray-500">คุณยังไม่ได้ลงทะเบียนวิชาใดๆ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls, index) => {
              const palette = COLORS[index % COLORS.length];
              const data = summaries[cls._id];
              const summary = data?.summary;
              const isLoading = loadingSummary[cls._id];
              const rate = getAttendanceRate(summary);

              return (
                <div
                  key={cls._id}
                  onClick={() => openDetail(cls)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-100 group"
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${palette.bg} p-5 relative`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-white flex-1 min-w-0">
                        <h3 className="font-extrabold text-lg">
                          {cls.course?.courseCode}
                        </h3>
                        <p className="text-white/80 text-sm truncate">
                          {cls.course?.courseNameTH || cls.course?.courseNameEN}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : summary ? (
                      <>
                        {/* Attendance Rate Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              อัตราเข้าเรียน
                            </span>
                            <span className={`text-sm font-bold ${getRateColor(rate)}`}>
                              {rate}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getRateBarColor(rate)}`}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-4 gap-2">
                          <div className="text-center p-2 bg-green-50 rounded-lg">
                            <p className="text-lg font-bold text-green-600">{summary.present}</p>
                            <p className="text-[10px] text-green-600/70">มา</p>
                          </div>
                          <div className="text-center p-2 bg-amber-50 rounded-lg">
                            <p className="text-lg font-bold text-amber-600">{summary.late}</p>
                            <p className="text-[10px] text-amber-600/70">สาย</p>
                          </div>
                          <div className="text-center p-2 bg-red-50 rounded-lg">
                            <p className="text-lg font-bold text-red-600">{summary.absent}</p>
                            <p className="text-[10px] text-red-600/70">ขาด</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <p className="text-lg font-bold text-gray-600">{summary.total}</p>
                            <p className="text-[10px] text-gray-500">ทั้งหมด</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-400">ยังไม่มีข้อมูล</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Attendance;
