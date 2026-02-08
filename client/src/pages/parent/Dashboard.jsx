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
} from "lucide-react";
import parentService from "@/services/parentService";

const ParentDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [studentInfo, setStudentInfo] = useState(null);
    const [attendance, setAttendance] = useState(null);
    const [schedule, setSchedule] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [infoRes, attendanceRes, scheduleRes] = await Promise.all([
                parentService.getStudentInfo(),
                parentService.getAttendance(),
                parentService.getSchedule(),
            ]);

            if (infoRes.success) setStudentInfo(infoRes.data);
            if (attendanceRes.success) setAttendance(attendanceRes.data);
            if (scheduleRes.success) setSchedule(scheduleRes.data);
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-green-500" />
                            ข้อมูลส่วนตัว
                        </h2>
                        {studentInfo && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <GraduationCap className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">รหัสนักศึกษา</p>
                                        <p className="font-semibold">{studentInfo.profile?.studentId}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">ชื่อ-นามสกุล</p>
                                        <p className="font-semibold">
                                            {studentInfo.profile?.firstNameTH || studentInfo.user?.firstName}{" "}
                                            {studentInfo.profile?.lastNameTH || studentInfo.user?.lastName}
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
                                            {studentInfo.profile?.education?.faculty || "-"} /{" "}
                                            {studentInfo.profile?.education?.department || "-"}
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
                                            {studentInfo.profile?.education?.gpa?.toFixed(2) || "-"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-pink-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">อีเมล</p>
                                        <p className="font-semibold">{studentInfo.user?.email || "-"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">เบอร์โทร</p>
                                        <p className="font-semibold">{studentInfo.user?.phoneNumber || "-"}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            ตารางเรียน
                        </h2>
                        {schedule.length > 0 ? (
                            <div className="space-y-3">
                                {schedule.map((cls) => (
                                    <div
                                        key={cls._id}
                                        className="p-4 bg-gray-50 rounded-xl"
                                    >
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

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            สรุปการเข้าเรียน
                        </h2>
                        {attendance && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span className="text-gray-700">มาเรียน</span>
                                    </div>
                                    <span className="text-xl font-bold text-green-600">
                                        {attendance.summary?.present || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-yellow-500" />
                                        <span className="text-gray-700">มาสาย</span>
                                    </div>
                                    <span className="text-xl font-bold text-yellow-600">
                                        {attendance.summary?.late || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <XCircle className="w-5 h-5 text-red-500" />
                                        <span className="text-gray-700">ขาดเรียน</span>
                                    </div>
                                    <span className="text-xl font-bold text-red-600">
                                        {attendance.summary?.absent || 0}
                                    </span>
                                </div>
                                <div className="pt-3 border-t">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">รวมทั้งหมด</span>
                                        <span className="text-lg font-bold text-gray-800">
                                            {attendance.summary?.total || 0} ครั้ง
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
        </div>
    );
};

export default ParentDashboard;
