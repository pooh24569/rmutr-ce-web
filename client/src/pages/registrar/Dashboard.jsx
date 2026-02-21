import React from "react";
import { useAuth } from "@/context/AuthContext";
import {
    AcademicCapIcon,
    UserGroupIcon,
    DocumentTextIcon,
    CalendarDaysIcon,
    ClipboardDocumentListIcon,
    ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

const ROLE_LABELS = {
    central_registrar: "ทะเบียนกลาง",
    faculty_registrar: "ทะเบียนคณะ",
};

const Dashboard = () => {
    const { user } = useAuth();
    const roleLabel = ROLE_LABELS[user?.role] || user?.role;

    const stats = [
        {
            label: "รายวิชาทั้งหมด",
            value: "—",
            icon: AcademicCapIcon,
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            label: "นักศึกษาลงทะเบียน",
            value: "—",
            icon: UserGroupIcon,
            bgColor: "bg-green-50",
            iconColor: "text-green-600",
        },
        {
            label: "คำร้องรอดำเนินการ",
            value: "—",
            icon: DocumentTextIcon,
            bgColor: "bg-amber-50",
            iconColor: "text-amber-600",
        },
        {
            label: "ภาคการศึกษาปัจจุบัน",
            value: "—",
            icon: CalendarDaysIcon,
            bgColor: "bg-purple-50",
            iconColor: "text-purple-600",
        },
    ];

    return (
        <div className="p-6 space-y-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">
                                        {stat.label}
                                    </p>
                                    <p className="text-3xl font-bold text-slate-800">
                                        {stat.value}
                                    </p>
                                </div>
                                <div
                                    className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer">
                        <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600 mb-2" />
                        <p className="font-medium text-slate-800">
                            จัดการรายวิชา
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            เพิ่ม แก้ไข ลบรายวิชา
                        </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors cursor-pointer">
                        <UserGroupIcon className="w-8 h-8 text-green-600 mb-2" />
                        <p className="font-medium text-slate-800">
                            ข้อมูลนักศึกษา
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            ค้นหาและจัดการข้อมูล
                        </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors cursor-pointer">
                        <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600 mb-2" />
                        <p className="font-medium text-slate-800">
                            รายงานสถิติ
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            ดูรายงานการลงทะเบียน
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
