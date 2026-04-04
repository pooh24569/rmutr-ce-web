
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import {
    BookOpen,
    Clock,
    MapPin,
    User,
    Search,
    ShoppingCart,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
    CreditCard,
    CalendarDays,
    Loader2,
    Download,
    GraduationCap,
    Info,
} from "lucide-react";

const MAX_CREDITS = 21;
const COST_PER_CREDIT = 500; // บาทต่อหน่วยกิต (mock)

const DAY_LABELS = {
    mon: "จันทร์", tue: "อังคาร", wed: "พุธ",
    thu: "พฤหัส", fri: "ศุกร์", sat: "เสาร์", sun: "อาทิตย์",
    monday: "จันทร์", tuesday: "อังคาร", wednesday: "พุธ",
    thursday: "พฤหัส", friday: "ศุกร์", saturday: "เสาร์", sunday: "อาทิตย์",
};

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const TIMETABLE_COLORS = [
    "bg-blue-100 text-blue-800 border-blue-300",
    "bg-emerald-100 text-emerald-800 border-emerald-300",
    "bg-purple-100 text-purple-800 border-purple-300",
    "bg-orange-100 text-orange-800 border-orange-300",
    "bg-pink-100 text-pink-800 border-pink-300",
    "bg-cyan-100 text-cyan-800 border-cyan-300",
    "bg-amber-100 text-amber-800 border-amber-300",
    "bg-rose-100 text-rose-800 border-rose-300",
];

const getDayLabel = (day) => DAY_LABELS[day] || day;

// Normalize day key: "monday" → "mon"
const normalizeDay = (day) => {
    const map = {
        monday: "mon", tuesday: "tue", wednesday: "wed",
        thursday: "thu", friday: "fri", saturday: "sat", sunday: "sun",
    };
    return map[day] || day;
};

// Parse time string "HH:MM" → minutes since midnight
const parseTime = (t) => {
    const [h, m] = (t || "08:00").split(":").map(Number);
    return h * 60 + m;
};

const Registration = () => {
    const navigate = useNavigate();

    // Step: "idle" → "select" → "review"
    const [step, setStep] = useState("idle");

    // Data
    const [courses, setCourses] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState("");

    // Loading states
    const [fetching, setFetching] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    // ─── Derived State ──────────────────────────────────────────────────
    const selectedCourses = courses.filter((c) => selectedIds.has(c._id));
    const totalCredits = selectedCourses.reduce(
        (sum, c) => sum + (c.course?.credits || 0),
        0
    );
    const totalCost = totalCredits * COST_PER_CREDIT;

    // ─── Fetch Courses ──────────────────────────────────────────────────
    const handleFetchCourses = useCallback(async () => {
        try {
            setFetching(true);
            const { data: response } = await api.get("/student-registration/available");
            if (response.success) {
                const offerings = response.data || [];
                setCourses(offerings);

                // Pre-select courses that student is already enrolled in
                const preSelected = new Set(
                    offerings.filter((c) => c.isEnrolled).map((c) => c._id)
                );
                setSelectedIds(preSelected);
                setStep("select");
            }
        } catch (err) {
            console.error("Error:", err);
            toast.error(err.response?.data?.message || "ไม่สามารถดึงข้อมูลวิชาได้");
        } finally {
            setFetching(false);
        }
    }, []);

    // ─── Toggle Selection ───────────────────────────────────────────────
    const handleToggle = (course) => {
        const id = course._id;
        const credits = course.course?.credits || 0;

        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                // Check credit limit
                const currentCredits = courses
                    .filter((c) => prev.has(c._id))
                    .reduce((s, c) => s + (c.course?.credits || 0), 0);
                if (currentCredits + credits > MAX_CREDITS) {
                    toast.error(
                        `ไม่สามารถเลือกได้ — เกินจำนวนหน่วยกิตสูงสุด (${MAX_CREDITS} หน่วยกิต)`
                    );
                    return prev;
                }
                next.add(id);
            }
            return next;
        });
    };

    // ─── Check if adding a course would exceed limit ────────────────────
    const wouldExceedLimit = (course) => {
        if (selectedIds.has(course._id)) return false; // already selected
        const credits = course.course?.credits || 0;
        return totalCredits + credits > MAX_CREDITS;
    };

    // ─── Confirm Registration ───────────────────────────────────────────
    const handleConfirmRegistration = async () => {
        if (selectedCourses.length === 0) {
            toast.error("กรุณาเลือกอย่างน้อย 1 วิชา");
            return;
        }

        try {
            setEnrolling(true);

            // Enroll each selected course that isn't already enrolled
            const toEnroll = selectedCourses.filter((c) => !c.isEnrolled);
            // Drop courses that were pre-selected but now deselected
            const toDrop = courses.filter(
                (c) => c.isEnrolled && !selectedIds.has(c._id)
            );

            const enrollPromises = toEnroll.map((c) =>
                api.post("/student-registration/enroll", { offeringId: c._id })
                    .catch((err) => ({
                        error: true,
                        name: c.course?.courseNameTH || c.course?.courseCode,
                        message: err.response?.data?.message,
                    }))
            );
            const dropPromises = toDrop.map((c) =>
                api.delete(`/student-registration/drop/${c._id}`)
                    .catch((err) => ({
                        error: true,
                        name: c.course?.courseNameTH || c.course?.courseCode,
                        message: err.response?.data?.message,
                    }))
            );

            const results = await Promise.all([...enrollPromises, ...dropPromises]);
            const errors = results.filter((r) => r?.error);

            if (errors.length > 0) {
                errors.forEach((e) => toast.error(`${e.name}: ${e.message}`));
                if (errors.length < results.length) {
                    toast.success("ลงทะเบียนบางวิชาสำเร็จ");
                }
            } else {
                toast.success("ลงทะเบียนสำเร็จทุกวิชา! 🎉");
                setTimeout(() => navigate("/student/my-classes"), 1500);
            }
        } catch (err) {
            console.error("Error:", err);
            toast.error("เกิดข้อผิดพลาดในการลงทะเบียน");
        } finally {
            setEnrolling(false);
        }
    };

    // ─── Filtered Courses ───────────────────────────────────────────────
    const filteredCourses = courses.filter((c) => {
        const code = c.course?.courseCode || "";
        const nameTH = c.course?.courseNameTH || "";
        const nameEN = c.course?.courseNameEN || "";
        const q = searchTerm.toLowerCase();
        return (
            code.toLowerCase().includes(q) ||
            nameTH.toLowerCase().includes(q) ||
            nameEN.toLowerCase().includes(q)
        );
    });

    // ─── STEP: IDLE ─────────────────────────────────────────────────────
    if (step === "idle") {
        return (
            <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center max-w-md">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-xl shadow-red-500/20">
                            <GraduationCap className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                            ลงทะเบียนเรียน
                        </h1>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            ดึงรายวิชาที่ทะเบียนจัดไว้สำหรับคุณ<br />
                            เลือกวิชาที่ต้องการ → ตรวจสอบ → ยืนยัน
                        </p>

                        {/* Progress Steps */}
                        <div className="flex items-center justify-center gap-3 mb-8">
                            {["ดึงวิชา", "เลือกวิชา", "ตรวจสอบ", "ยืนยัน"].map((label, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                                        {i + 1}
                                    </div>
                                    <span className={`text-xs font-medium hidden sm:block ${i === 0 ? "text-gray-800" : "text-gray-400"}`}>{label}</span>
                                    {i < 3 && <div className="w-6 h-px bg-gray-300 hidden sm:block" />}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleFetchCourses}
                            disabled={fetching}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-lg font-bold rounded-2xl hover:from-red-600 hover:to-orange-600 transition-all shadow-xl shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                        >
                            {fetching ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <Download className="w-6 h-6" />
                            )}
                            {fetching ? "กำลังดึงข้อมูล..." : "ดึงรายวิชา"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── STEP: SELECT ───────────────────────────────────────────────────
    if (step === "select") {
        return (
            <div className="flex flex-col h-full bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setStep("idle")}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">เลือกรายวิชา</h1>
                                <p className="text-sm text-gray-500">
                                    ทิกเลือกวิชาที่ต้องการลงทะเบียน
                                </p>
                            </div>
                        </div>

                        {/* Progress Steps */}
                        <div className="hidden md:flex items-center gap-2">
                            {["ดึงวิชา", "เลือกวิชา", "ตรวจสอบ", "ยืนยัน"].map((label, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= 1 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                                        {i < 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                    </div>
                                    <span className={`text-xs font-medium ${i <= 1 ? "text-gray-800" : "text-gray-400"}`}>{label}</span>
                                    {i < 3 && <div className="w-4 h-px bg-gray-300" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Credit Summary Bar */}
                <div className="bg-white border-b border-gray-200 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-red-500" />
                                <span className="font-semibold text-gray-800">
                                    เลือกแล้ว {selectedIds.size} วิชา
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm text-gray-500">หน่วยกิต:</span>
                                    <span className={`font-bold text-lg ${totalCredits > MAX_CREDITS ? "text-red-600" : totalCredits > 0 ? "text-green-600" : "text-gray-400"}`}>
                                        {totalCredits}
                                    </span>
                                    <span className="text-sm text-gray-400">/ {MAX_CREDITS}</span>
                                </div>
                            </div>
                        </div>

                        {/* Credit Progress Bar */}
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${totalCredits > MAX_CREDITS ? "bg-red-500" : totalCredits >= 18 ? "bg-orange-500" : "bg-green-500"}`}
                                    style={{ width: `${Math.min((totalCredits / MAX_CREDITS) * 100, 100)}%` }}
                                />
                            </div>
                            <button
                                onClick={() => setStep("review")}
                                disabled={selectedIds.size === 0}
                                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                ตรวจสอบ
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="px-6 pt-4 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ค้นหารหัสวิชา หรือชื่อวิชา..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                    </div>
                </div>

                {/* Course List */}
                <div className="flex-1 px-6 py-3 overflow-auto">
                    {filteredCourses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <BookOpen className="w-16 h-16 mb-4 text-gray-300" />
                            <p className="text-lg font-medium">ไม่พบวิชา</p>
                        </div>
                    ) : (
                        <div className="space-y-3 pb-20">
                            {filteredCourses.map((c) => {
                                const isSelected = selectedIds.has(c._id);
                                const exceedsLimit = wouldExceedLimit(c);
                                const isFull = c.isFull && !c.isEnrolled;
                                const isDisabled = (!isSelected && exceedsLimit) || isFull;

                                return (
                                    <label
                                        key={c._id}
                                        className={`flex items-start gap-4 p-4 bg-white rounded-xl border-2 cursor-pointer transition-all ${
                                            isSelected
                                                ? "border-red-500 bg-red-50/30 shadow-sm"
                                                : isDisabled
                                                    ? "border-gray-200 opacity-50 cursor-not-allowed"
                                                    : "border-gray-200 hover:border-red-300 hover:shadow-sm"
                                        }`}
                                    >
                                        {/* Checkbox */}
                                        <div className="pt-1">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                disabled={isDisabled}
                                                onChange={() => handleToggle(c)}
                                                className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500 disabled:opacity-40"
                                            />
                                        </div>

                                        {/* Course Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                                            {c.course?.courseCode}
                                                        </span>
                                                        <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                                                            {c.course?.credits || 0} หน่วยกิต
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            Sec {c.section}
                                                        </span>
                                                        {c.isEnrolled && (
                                                            <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                                ลงทะเบียนแล้ว
                                                            </span>
                                                        )}
                                                        {isFull && (
                                                            <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded">
                                                                เต็ม
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="font-semibold text-gray-900 mt-1">
                                                        {c.course?.courseNameTH || c.course?.courseNameEN}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                                                {c.instructor && (
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3.5 h-3.5" />
                                                        อ.{c.instructor.firstName} {c.instructor.lastName}
                                                    </span>
                                                )}
                                                {c.schedule?.map((s, i) => (
                                                    <span key={i} className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {getDayLabel(s.day)} {s.startTime}-{s.endTime}
                                                    </span>
                                                ))}
                                                {c.schedule?.[0]?.room && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        ห้อง {c.schedule[0].room}
                                                    </span>
                                                )}
                                                <span className="text-gray-400">
                                                    {c.students?.length || 0}/{c.maxStudents} คน
                                                </span>
                                            </div>

                                            {/* Warning for credit limit */}
                                            {!isSelected && exceedsLimit && (
                                                <div className="flex items-center gap-1.5 mt-2 text-xs text-orange-600">
                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                    เลือกไม่ได้ — เกิน {MAX_CREDITS} หน่วยกิต
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Mobile Bottom Bar */}
                <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 z-20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">
                            {selectedIds.size} วิชา • {totalCredits}/{MAX_CREDITS} หน่วยกิต
                        </span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${totalCredits > MAX_CREDITS ? "bg-red-500" : "bg-green-500"}`}
                                style={{ width: `${Math.min((totalCredits / MAX_CREDITS) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => setStep("review")}
                        disabled={selectedIds.size === 0}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl disabled:opacity-40"
                    >
                        ตรวจสอบรายวิชา
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    // ─── STEP: REVIEW ───────────────────────────────────────────────────
    if (step === "review") {
        // Build timetable data
        const timetableSlots = [];
        selectedCourses.forEach((c, idx) => {
            c.schedule?.forEach((s) => {
                timetableSlots.push({
                    day: normalizeDay(s.day),
                    startTime: s.startTime,
                    endTime: s.endTime,
                    room: s.room,
                    code: c.course?.courseCode,
                    name: c.course?.courseNameTH || c.course?.courseNameEN,
                    colorClass: TIMETABLE_COLORS[idx % TIMETABLE_COLORS.length],
                });
            });
        });

        // Time range for timetable (8:00 - 18:00)
        const timeSlots = [];
        for (let h = 8; h <= 18; h++) {
            timeSlots.push(`${String(h).padStart(2, "0")}:00`);
        }

        return (
            <div className="flex flex-col h-full bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setStep("select")}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">ตรวจสอบการลงทะเบียน</h1>
                                <p className="text-sm text-gray-500">ตรวจสอบตารางเรียน และค่าใช้จ่ายก่อนยืนยัน</p>
                            </div>
                        </div>

                        {/* Progress Steps */}
                        <div className="hidden md:flex items-center gap-2">
                            {["ดึงวิชา", "เลือกวิชา", "ตรวจสอบ", "ยืนยัน"].map((label, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= 2 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                                        {i < 2 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                    </div>
                                    <span className={`text-xs font-medium ${i <= 2 ? "text-gray-800" : "text-gray-400"}`}>{label}</span>
                                    {i < 3 && <div className="w-4 h-px bg-gray-300" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-6 overflow-auto space-y-6 pb-32">
                    {/* 1) Selected Courses Summary */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-red-500" />
                            <h2 className="font-bold text-gray-900">รายวิชาที่เลือก ({selectedCourses.length} วิชา)</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {selectedCourses.map((c, idx) => (
                                <div key={c._id} className="px-5 py-3 flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${TIMETABLE_COLORS[idx % TIMETABLE_COLORS.length].split(" ")[0]}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-500">{c.course?.courseCode}</span>
                                            <span className="text-sm font-medium text-gray-900 truncate">
                                                {c.course?.courseNameTH || c.course?.courseNameEN}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Sec {c.section}
                                            {c.schedule?.map((s, i) => ` • ${getDayLabel(s.day)} ${s.startTime}-${s.endTime}`)}
                                        </p>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">
                                        {c.course?.credits || 0} <span className="text-xs font-normal text-gray-400">หน่วยกิต</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2) Visual Timetable */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-purple-500" />
                            <h2 className="font-bold text-gray-900">ตารางเรียน</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <div className="min-w-[700px]">
                                {/* Day Headers */}
                                <div className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-gray-100">
                                    <div className="p-2 text-xs font-medium text-gray-400 text-center">เวลา</div>
                                    {DAY_ORDER.slice(0, 6).map((day) => (
                                        <div key={day} className="p-2 text-xs font-bold text-gray-700 text-center border-l border-gray-100">
                                            {getDayLabel(day)}
                                        </div>
                                    ))}
                                </div>

                                {/* Time Rows */}
                                {timeSlots.map((time) => {
                                    const timeMinutes = parseTime(time);
                                    return (
                                        <div key={time} className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-gray-50 min-h-[50px]">
                                            <div className="p-2 text-xs text-gray-400 text-right pr-3 border-r border-gray-100">{time}</div>
                                            {DAY_ORDER.slice(0, 6).map((day) => {
                                                const slot = timetableSlots.find((s) => {
                                                    const start = parseTime(s.startTime);
                                                    return s.day === day && start >= timeMinutes && start < timeMinutes + 60;
                                                });

                                                return (
                                                    <div key={day} className="border-l border-gray-50 p-0.5 relative">
                                                        {slot && (
                                                            <div className={`rounded-lg p-1.5 text-xs border ${slot.colorClass} h-full`}>
                                                                <p className="font-bold leading-tight">{slot.code}</p>
                                                                <p className="text-[10px] opacity-70 truncate">{slot.startTime}-{slot.endTime}</p>
                                                                {slot.room && (
                                                                    <p className="text-[10px] opacity-60">{slot.room}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 3) Cost Summary */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-green-500" />
                            <h2 className="font-bold text-gray-900">สรุปค่าใช้จ่าย</h2>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">จำนวนหน่วยกิต</span>
                                <span className="font-medium text-gray-900">{totalCredits} หน่วยกิต</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">ค่าหน่วยกิต (ต่อหน่วยกิต)</span>
                                <span className="font-medium text-gray-900">{COST_PER_CREDIT.toLocaleString()} บาท</span>
                            </div>
                            <div className="border-t border-dashed border-gray-200 pt-3 flex items-center justify-between">
                                <span className="text-gray-800 font-bold">ค่าลงทะเบียนรวม</span>
                                <span className="text-2xl font-extrabold text-red-600">
                                    ฿{totalCost.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-start gap-2 mt-2 bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>ค่าลงทะเบียนเป็นค่าประมาณเบื้องต้น อาจมีค่าธรรมเนียมเพิ่มเติม กรุณาตรวจสอบกับทะเบียนอีกครั้ง</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Bottom Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
                        <div>
                            <p className="text-sm text-gray-500">ทั้งหมด {selectedCourses.length} วิชา • {totalCredits} หน่วยกิต</p>
                            <p className="text-lg font-extrabold text-gray-900">฿{totalCost.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setStep("select")}
                                className="flex items-center gap-2 px-5 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                แก้ไขวิชา
                            </button>
                            <button
                                onClick={handleConfirmRegistration}
                                disabled={enrolling}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            >
                                {enrolling ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5" />
                                )}
                                {enrolling ? "กำลังลงทะเบียน..." : "ยืนยันลงทะเบียน"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default Registration;
