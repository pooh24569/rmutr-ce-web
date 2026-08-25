import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    AcademicCapIcon,
    UserGroupIcon,
    RectangleStackIcon,
    CalendarDaysIcon,
    ClipboardDocumentListIcon,
    ArrowTrendingUpIcon,
    ArrowRightIcon,
} from "@heroicons/react/24/outline";
import * as registrarService from "@/services/registrarService";

const ROLE_LABELS = {
    central_registrar: "ทะเบียนกลาง",
    faculty_registrar: "ทะเบียนคณะ",
};

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const roleLabel = ROLE_LABELS[user?.role] || user?.role;

    const [stats, setStats] = useState({
        courses: 0,
        offerings: 0,
        students: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [coursesRes, offeringsRes] = await Promise.all([
                    registrarService.getCourses().catch(() => ({ data: [] })),
                    registrarService
                        .getCourseOfferings()
                        .catch(() => ({ data: [] })),
                ]);

                const courses = coursesRes.data || [];
                const offerings = offeringsRes.data || [];
                const totalStudents = offerings.reduce(
                    (sum, o) => sum + (o.students?.length || 0),
                    0,
                );

                setStats({
                    courses: courses.length,
                    offerings: offerings.length,
                    students: totalStudents,
                });
            } catch (err) {
                console.error("Dashboard stats error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        {
            label: "รายวิชาทั้งหมด",
            value: stats.courses,
            icon: AcademicCapIcon,
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
            gradient: "from-blue-500 to-blue-600",
        },
        {
            label: "กลุ่มเรียนที่เปิด",
            value: stats.offerings,
            icon: RectangleStackIcon,
            bgColor: "bg-indigo-50",
            iconColor: "text-indigo-600",
            gradient: "from-indigo-500 to-indigo-600",
        },
        {
            label: "นักศึกษาลงทะเบียน",
            value: stats.students,
            icon: UserGroupIcon,
            bgColor: "bg-emerald-50",
            iconColor: "text-emerald-600",
            gradient: "from-emerald-500 to-emerald-600",
        },
    ];

    const quickActions =
        user?.role === "central_registrar"
            ? [
                  {
                      label: "จัดการรายวิชา",
                      desc: "เพิ่ม แก้ไข ลบรายวิชา",
                      icon: ClipboardDocumentListIcon,
                      to: "/registrar/courses",
                      color: "blue",
                  },
                  {
                      label: "กลุ่มเรียน",
                      desc: "เปิดกลุ่มเรียน กำหนดอาจารย์",
                      icon: RectangleStackIcon,
                      to: "/registrar/offerings",
                      color: "indigo",
                  },
              ]
            : [
                  {
                      label: "รายวิชา",
                      desc: "ดูรายวิชาในคณะ",
                      icon: AcademicCapIcon,
                      to: "/registrar/courses",
                      color: "blue",
                  },
                  {
                      label: "กลุ่มเรียน",
                      desc: "ดูกลุ่มเรียนที่เปิด",
                      icon: RectangleStackIcon,
                      to: "/registrar/offerings",
                      color: "indigo",
                  },
                  {
                      label: "ลงทะเบียนนักศึกษา",
                      desc: "จัดรายวิชาให้นักศึกษา",
                      icon: UserGroupIcon,
                      to: "/registrar/enrollments",
                      color: "green",
                  },
                  {
                      label: "จัดตารางเรียน",
                      desc: "กำหนดวัน เวลา ห้องเรียน",
                      icon: CalendarDaysIcon,
                      to: "/registrar/schedule",
                      color: "purple",
                  },
              ];

    const colorMap = {
        blue: {
            bg: "bg-blue-50",
            border: "border-blue-100",
            hover: "hover:bg-blue-100",
            icon: "text-blue-600",
            text: "text-blue-600",
        },
        indigo: {
            bg: "bg-indigo-50",
            border: "border-indigo-100",
            hover: "hover:bg-indigo-100",
            icon: "text-indigo-600",
            text: "text-indigo-600",
        },
        green: {
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            hover: "hover:bg-emerald-100",
            icon: "text-emerald-600",
            text: "text-emerald-600",
        },
        purple: {
            bg: "bg-purple-50",
            border: "border-purple-100",
            hover: "hover:bg-purple-100",
            icon: "text-purple-600",
            text: "text-purple-600",
        },
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    Dashboard
                </h1>
                <p className="text-slate-500">
                    ยินดีต้อนรับ{" "}
                    <span className="font-medium text-slate-700">
                        {user?.firstName || user?.username}
                    </span>{" "}
                    — {roleLabel}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">
                                        {stat.label}
                                    </p>
                                    <p className="text-3xl font-bold text-slate-800">
                                        {loading ? (
                                            <span className="inline-block w-12 h-8 bg-slate-100 rounded-lg animate-pulse" />
                                        ) : (
                                            stat.value.toLocaleString()
                                        )}
                                    </p>
                                </div>
                                <div
                                    className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                                >
                                    <Icon
                                        className={`w-6 h-6 ${stat.iconColor}`}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                    เมนูด่วน
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        const c = colorMap[action.color] || colorMap.blue;
                        return (
                            <button
                                key={index}
                                onClick={() => navigate(action.to)}
                                className={`p-5 ${c.bg} rounded-xl border ${c.border} ${c.hover} transition-all text-left group cursor-pointer`}
                            >
                                <div className="flex items-start justify-between">
                                    <Icon
                                        className={`w-8 h-8 ${c.icon} mb-3`}
                                    />
                                    <ArrowRightIcon
                                        className={`w-4 h-4 ${c.icon} opacity-0 group-hover:opacity-100 transition-opacity translate-x-0 group-hover:translate-x-1`}
                                    />
                                </div>
                                <p className="font-semibold text-slate-800">
                                    {action.label}
                                </p>
                                <p className="text-sm text-slate-500 mt-1">
                                    {action.desc}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
