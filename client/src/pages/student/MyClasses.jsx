
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RefreshCw, BookOpen, User, MapPin, Clock, Users, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import StudentHeader from "@/components/student/StudentHeader";
import RegistrationSuccess from "@/components/student/RegistrationSuccess";

const MyClasses = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [classes, setClasses] = useState([]);
    const [totalCredits, setTotalCredits] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchMyClasses();

        // Show full-screen success page if redirected from Registration
        if (searchParams.get("registered") === "true") {
            setShowSuccess(true);
            // Clean URL immediately so refresh doesn't re-trigger
            setSearchParams({}, { replace: true });
        }
    }, []);

    const handleDismissSuccess = () => {
        setShowSuccess(false);
    };

    const fetchMyClasses = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data: response } = await api.get("/student-registration/my-courses");
            if (response.success) {
                setClasses(response.data.courses || []);
                setTotalCredits(response.data.totalCredits || 0);
            }
        } catch (err) {
            console.error("Error fetching classes:", err);
            setError(err.response?.data?.message || err.message || "ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setLoading(false);
        }
    };

    const getDayLabel = (day) => {
        const days = {
            mon: "จันทร์", tue: "อังคาร", wed: "พุธ",
            thu: "พฤหัส", fri: "ศุกร์", sat: "เสาร์", sun: "อาทิตย์",
            monday: "จันทร์", tuesday: "อังคาร", wednesday: "พุธ",
            thursday: "พฤหัส", friday: "ศุกร์", saturday: "เสาร์", sunday: "อาทิตย์",
        };
        return days[day] || day;
    };

    const COLORS = [
        "from-blue-500 to-blue-600",
        "from-green-500 to-green-600",
        "from-purple-500 to-purple-600",
        "from-orange-500 to-orange-600",
        "from-pink-500 to-pink-600",
        "from-teal-500 to-teal-600",
    ];

    // ─── Loading State ───────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col h-full">
                <StudentHeader title="MY CLASSES" />
                <div className="flex-1 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">กำลังโหลด...</p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Full-screen Registration Success Page ───────────────────────────
    if (showSuccess && classes.length > 0) {
        return (
            <RegistrationSuccess
                classes={classes}
                totalCredits={totalCredits}
                onDismiss={handleDismissSuccess}
            />
        );
    }

    // ─── Normal Class List View ──────────────────────────────────────────
    return (
        <div className="flex flex-col h-full">
            <StudentHeader title="MY CLASSES" />

            <section className="flex-1 px-4 sm:px-6 py-4 sm:py-6 bg-gray-100 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">รายวิชาที่ลงทะเบียน</h2>
                        <p className="text-sm text-gray-500">
                            ลงทะเบียนแล้ว {classes.length} วิชา • {totalCredits} หน่วยกิต
                        </p>
                    </div>
                    <button
                        onClick={fetchMyClasses}
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
                        <p className="text-gray-500 mb-4">คุณยังไม่ได้ลงทะเบียนวิชาใดๆ</p>
                        <button
                            onClick={() => navigate("/student/registration")}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            ไปลงทะเบียน
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classes.map((cls, index) => (
                            <div
                                key={cls._id}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-100 group"
                                onClick={() => navigate(`/student/homework/class/${cls._id}`)}
                            >
                                <div className={`bg-gradient-to-r ${COLORS[index % COLORS.length]} p-5 relative`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                            <BookOpen className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-white">
                                            <h3 className="font-extrabold text-lg">
                                                {cls.course?.courseCode || cls.classCode}
                                            </h3>
                                            <p className="text-white/100 text-sm truncate max-w-[200px]">
                                                {cls.course?.courseNameTH || cls.className}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>

                                <div className="p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm">
                                            {cls.instructor?.firstName || cls.teacher?.firstName || ""}{" "}
                                            {cls.instructor?.lastName || cls.teacher?.lastName || "ไม่ระบุ"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm">{cls.students?.length || 0} คน</span>
                                    </div>

                                    {cls.schedule && cls.schedule.length > 0 && (
                                        <div className="pt-2 border-t border-gray-100">
                                            <p className="text-xs text-gray-500 mb-1">ตารางเรียน:</p>
                                            {cls.schedule.map((sch, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                                                        {getDayLabel(sch.day)}
                                                    </span>
                                                    <span>{sch.startTime} - {sch.endTime}</span>
                                                    {sch.room && (
                                                        <>
                                                            <MapPin className="w-3 h-3 text-gray-400 ml-1" />
                                                            <span>ห้อง {sch.room}</span>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default MyClasses;

