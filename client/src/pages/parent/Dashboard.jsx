import React, { useState, useEffect } from "react";
import {
    User,
    BookOpen,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    GraduationCap,
    MapPin,
    Phone,
    Mail,
    Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import parentService from "@/services/parentService";

const ParentDashboard = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [infoRes, attendanceRes, scheduleRes] = await Promise.all([
                parentService.getStudentInfo(token),
                parentService.getAttendance(token),
                parentService.getSchedule(token),
            ]);

            if (infoRes.success) setStudents(infoRes.data);
            if (attendanceRes.success) setAttendance(attendanceRes.data);
            if (scheduleRes.success) setSchedules(scheduleRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    const currentStudent = students[activeTab];
    const currentAttendance = attendance[activeTab];
    const currentSchedule = schedules[activeTab];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        ข้อมูลนักศึกษา
                    </h1>
                    <p className="text-gray-500">ดูข้อมูลการเรียนของบุตรหลาน</p>
                </div>
            </div>

            {/* Student tabs (if multiple children) */}
            {students.length > 1 && (
                <div className="flex gap-2">
                    {students.map((student, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveTab(idx)}
                            className={[
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                                activeTab === idx
                                    ? "bg-green-500 text-white shadow-lg"
                                    : "bg-white text-gray-600 hover:bg-gray-100 border",
                            ].join(" ")}
                        >
                            <Users className="w-4 h-4" />
                            {student.profile?.firstNameTH || student.user?.firstName || `นักศึกษา ${idx + 1}`}
                        </button>
                    ))}
                </div>
            )}

            {currentStudent && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Student Info */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-green-500" />
                                ข้อมูลส่วนตัว
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <GraduationCap className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">รหัสนักศึกษา</p>
                                        <p className="font-semibold">{currentStudent.profile?.studentId}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">ชื่อ-นามสกุล</p>
                                        <p className="font-semibold">
                                            {currentStudent.profile?.firstNameTH || currentStudent.user?.firstName}{" "}
                                            {currentStudent.profile?.lastNameTH || currentStudent.user?.lastName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">คณะ/สาขา</p>
                                        <p className="font-semibold">
                                            {currentStudent.profile?.education?.faculty || "-"} /{" "}
                                            {currentStudent.profile?.education?.department || "-"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <GraduationCap className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">GPA</p>
                                        <p className="font-semibold text-xl">
                                            {currentStudent.profile?.education?.gpa?.toFixed(2) || "-"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-pink-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">อีเมล</p>
                                        <p className="font-semibold">{currentStudent.user?.email || "-"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">เบอร์โทร</p>
                                        <p className="font-semibold">{currentStudent.user?.phoneNumber || "-"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                ตารางเรียน
                            </h2>
                            {currentSchedule?.classes?.length > 0 ? (
                                <div className="space-y-3">
                                    {currentSchedule.classes.map((cls) => (
                                        <div key={cls._id} className="p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-gray-800">{cls.classCode}</span>
                                                <span className="text-sm text-gray-500">Section {cls.section}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{cls.className}</p>
                                            {cls.schedule?.map((sch, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{getDayLabel(sch.day)}</span>
                                                    <span>{sch.startTime} - {sch.endTime}</span>
                                                    {sch.room && (
                                                        <>
                                                            <MapPin className="w-4 h-4 ml-2" />
                                                            <span>ห้อง {sch.room}</span>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">ยังไม่มีตารางเรียน</p>
                            )}
                        </div>
                    </div>

                    {/* Attendance sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                สรุปการเข้าเรียน
                            </h2>
                            {currentAttendance && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                            <span className="text-gray-700">มาเรียน</span>
                                        </div>
                                        <span className="text-xl font-bold text-green-600">
                                            {currentAttendance.summary?.present || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-yellow-500" />
                                            <span className="text-gray-700">มาสาย</span>
                                        </div>
                                        <span className="text-xl font-bold text-yellow-600">
                                            {currentAttendance.summary?.late || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="w-5 h-5 text-red-500" />
                                            <span className="text-gray-700">ขาดเรียน</span>
                                        </div>
                                        <span className="text-xl font-bold text-red-600">
                                            {currentAttendance.summary?.absent || 0}
                                        </span>
                                    </div>
                                    <div className="pt-3 border-t">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">รวมทั้งหมด</span>
                                            <span className="text-lg font-bold text-gray-800">
                                                {currentAttendance.summary?.total || 0} ครั้ง
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-sm p-6 text-white">
                            <h3 className="font-bold mb-2">ต้องการความช่วยเหลือ?</h3>
                            <p className="text-sm text-white/80 mb-4">
                                หากมีข้อสงสัยเกี่ยวกับข้อมูลนักศึกษา กรุณาติดต่อฝ่ายทะเบียน
                            </p>
                            <p className="text-sm">
                                📞 02-xxx-xxxx
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {!currentStudent && (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">ไม่พบข้อมูลนักศึกษาที่เชื่อมกับบัญชีนี้</p>
                </div>
            )}
        </div>
    );
};

export default ParentDashboard;
