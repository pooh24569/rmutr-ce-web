// src/pages/student/Registration.jsx
import React, { useState, useEffect } from "react";
import { enrollmentService } from "@/services/enrollmentService";
import { toast } from "sonner";
import { BookOpen, Plus, Minus, Clock, MapPin, User, Search, RefreshCw } from "lucide-react";

const Registration = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [enrollingId, setEnrollingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await enrollmentService.getAvailableClasses();
            if (response.success) {
                setClasses(response.data);
            }
        } catch (err) {
            console.error("Error fetching classes:", err);
            setError(err.response?.data?.message || "ไม่สามารถดึงข้อมูลวิชาได้");
            toast.error("ไม่สามารถดึงข้อมูลวิชาได้");
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (classId) => {
        try {
            setEnrollingId(classId);
            const response = await enrollmentService.enrollClass(classId);
            if (response.success) {
                toast.success("ลงทะเบียนสำเร็จ!");
                // อัพเดท state
                setClasses(
                    classes.map((c) =>
                        c._id === classId ? { ...c, isEnrolled: true } : c
                    )
                );
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "ไม่สามารถลงทะเบียนได้");
        } finally {
            setEnrollingId(null);
        }
    };

    const handleDrop = async (classId) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ที่จะยกเลิกลงทะเบียนวิชานี้?")) return;

        try {
            setEnrollingId(classId);
            const response = await enrollmentService.dropClass(classId);
            if (response.success) {
                toast.success("ยกเลิกลงทะเบียนสำเร็จ");
                // อัพเดท state
                setClasses(
                    classes.map((c) =>
                        c._id === classId ? { ...c, isEnrolled: false } : c
                    )
                );
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "ไม่สามารถยกเลิกได้");
        } finally {
            setEnrollingId(null);
        }
    };

    const getDayLabel = (day) => {
        const days = {
            monday: "จันทร์",
            tuesday: "อังคาร",
            wednesday: "พุธ",
            thursday: "พฤหัส",
            friday: "ศุกร์",
            saturday: "เสาร์",
            sunday: "อาทิตย์",
        };
        return days[day] || day;
    };

    const filteredClasses = classes.filter(
        (c) =>
            c.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.classCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const enrolledCount = classes.filter((c) => c.isEnrolled).length;

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <header className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-white">ลงทะเบียนวิชา</h1>
                        <p className="text-white/80 text-sm">
                            เลือกวิชาที่ต้องการลงทะเบียน • ลงทะเบียนแล้ว {enrolledCount} วิชา
                        </p>
                    </div>
                    <button
                        onClick={fetchClasses}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        รีเฟรช
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto bg-gray-50">
                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาวิชาโดยชื่อหรือรหัส..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={fetchClasses}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            ลองใหม่
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500">กำลังโหลดวิชา...</p>
                        </div>
                    </div>
                ) : filteredClasses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <BookOpen className="w-16 h-16 mb-4 text-gray-300" />
                        <p className="text-lg font-medium">ไม่พบวิชาที่เปิดลงทะเบียน</p>
                        <p className="text-sm">ลองค้นหาด้วยคำอื่น หรือติดต่ออาจารย์</p>
                    </div>
                ) : (
                    /* Classes Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredClasses.map((classItem) => (
                            <div
                                key={classItem._id}
                                className={`bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg ${classItem.isEnrolled
                                        ? "border-green-500 bg-green-50"
                                        : "border-gray-200 hover:border-red-300"
                                    }`}
                            >
                                {/* Header */}
                                <div
                                    className={`p-4 ${classItem.isEnrolled
                                            ? "bg-green-500"
                                            : "bg-gradient-to-r from-red-500 to-orange-500"
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-medium bg-white/20 text-white px-2 py-1 rounded">
                                                {classItem.classCode}
                                            </span>
                                            <h3 className="text-white font-bold mt-2 text-lg">
                                                {classItem.className}
                                            </h3>
                                        </div>
                                        {classItem.isEnrolled && (
                                            <span className="text-xs bg-white text-green-600 px-2 py-1 rounded font-medium">
                                                ✓ ลงทะเบียนแล้ว
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User className="w-4 h-4" />
                                        <span>Section {classItem.section}</span>
                                    </div>

                                    {classItem.teacher && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User className="w-4 h-4 text-blue-500" />
                                            <span>
                                                อ.{classItem.teacher.firstName}{" "}
                                                {classItem.teacher.lastName}
                                            </span>
                                        </div>
                                    )}

                                    {classItem.schedule?.length > 0 && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span>
                                                {classItem.schedule.map((s, i) => (
                                                    <span key={i}>
                                                        {getDayLabel(s.day)} {s.startTime}-{s.endTime}
                                                        {i < classItem.schedule.length - 1 && ", "}
                                                    </span>
                                                ))}
                                            </span>
                                        </div>
                                    )}

                                    {classItem.schedule?.[0]?.room && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>ห้อง {classItem.schedule[0].room}</span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="pt-3 border-t">
                                        {classItem.isEnrolled ? (
                                            <button
                                                onClick={() => handleDrop(classItem._id)}
                                                disabled={enrollingId === classItem._id}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                                            >
                                                {enrollingId === classItem._id ? (
                                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Minus className="w-4 h-4" />
                                                )}
                                                ยกเลิกลงทะเบียน
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEnroll(classItem._id)}
                                                disabled={enrollingId === classItem._id}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition disabled:opacity-50"
                                            >
                                                {enrollingId === classItem._id ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Plus className="w-4 h-4" />
                                                )}
                                                ลงทะเบียน
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Registration;
