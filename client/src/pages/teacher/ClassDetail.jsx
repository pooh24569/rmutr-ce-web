
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Users,
    Clock,
    MapPin,
    Play,
    Fingerprint,
    CheckCircle2,
} from "lucide-react";
import api from "@/lib/api";

const ClassDetail = () => {
    const { classId: offeringId } = useParams();
    const navigate = useNavigate();

    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fingerprint enrollment status
    const [enrolledStudents, setEnrolledStudents] = useState(new Set());

    useEffect(() => {
        fetchOfferingDetail();
    }, [offeringId]);

    const fetchOfferingDetail = async () => {
        try {
            setLoading(true);
            const { data: response } = await api.get(`/courses/offerings/${offeringId}`);
            if (response.success) {
                setClassData(response.data);

                // ตรวจสอบสถานะ enrollment ลายนิ้วมือ
                if (response.data.students?.length > 0) {
                    checkFingerprintStatus(response.data.students);
                }
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const checkFingerprintStatus = async (students) => {
        try {
            const studentIds = students.map((s) => s._id);
            const { data: response } = await api.post(
                "/fingerprint/status/bulk",
                { studentIds },
            );
            if (response.success) {
                const enrolled = new Set(
                    response.data.students
                        .filter((s) => s.enrolled)
                        .map((s) => s.studentId),
                );
                setEnrolledStudents(enrolled);
            }
        } catch (error) {
            // ฝั่ง fingerprint service อาจยังไม่พร้อม — ไม่ต้องแสดง error
            console.log("Fingerprint status check skipped:", error.message);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="p-6 text-center text-gray-500">
                ไม่พบข้อมูลวิชา
            </div>
        );
    }

    const enrolledCount = classData.students?.filter((s) =>
        enrolledStudents.has(s._id),
    ).length || 0;

    return (
        <div className="p-6 space-y-6">
            {}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/teacher/classes")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{classData.course?.courseCode}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">Section {classData.section}</span>
                        {classData.course?.credits && (
                            <>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-gray-500">{classData.course.credits} หน่วยกิต</span>
                            </>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {classData.course?.courseNameTH || classData.course?.courseNameEN}
                    </h1>
                </div>
                <button
                    onClick={() => navigate(`/teacher/attendance/start/${offeringId}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/25"
                >
                    <Play className="w-5 h-5" />
                    <span>เริ่มเช็คชื่อ</span>
                </button>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">นักศึกษา</p>
                            <p className="text-xl font-bold text-gray-800">
                                {classData.students?.length || 0} คน
                            </p>
                        </div>
                    </div>
                </div>

                {}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">ตารางเรียน</p>
                            <p className="text-sm font-medium text-gray-800">
                                {classData.schedule?.length > 0
                                    ? `${getDayLabel(classData.schedule[0].day)} ${classData.schedule[0].startTime}-${classData.schedule[0].endTime}`
                                    : "-"}
                            </p>
                        </div>
                    </div>
                </div>

                {}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">ห้องเรียน</p>
                            <p className="text-xl font-bold text-gray-800">
                                {classData.schedule?.[0]?.room || "-"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 🔷 Fingerprint Enrollment Status Card */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <Fingerprint className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">ลงทะเบียนนิ้ว</p>
                            <p className="text-xl font-bold text-gray-800">
                                {enrolledCount}/{classData.students?.length || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">รายชื่อนักศึกษา</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        กดปุ่ม 👆 เพื่อลงทะเบียนลายนิ้วมือ
                    </p>
                </div>

                {classData.students?.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>ยังไม่มีนักศึกษาในวิชานี้</p>
                        <p className="text-sm mt-1">ติดต่อทะเบียนคณะเพื่อลงทะเบียนนักศึกษา</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {classData.students.map((student, index) => {
                            const isEnrolled = enrolledStudents.has(student._id);

                            return (
                                <div
                                    key={student._id}
                                    className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 text-center text-sm text-gray-400">
                                            {index + 1}
                                        </span>
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {student.firstName?.charAt(0) || student.username?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {student.firstName} {student.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500">{student.username}</p>
                                        </div>
                                    </div>

                                    {/* 🔷 Fingerprint Enroll Button */}
                                    {isEnrolled ? (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span className="text-xs font-medium text-emerald-600">
                                                ลงทะเบียนแล้ว
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                                            <Fingerprint className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs font-medium text-gray-400">
                                                ยังไม่ลงทะเบียน
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassDetail;
