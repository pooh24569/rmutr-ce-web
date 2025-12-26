// src/pages/teacher/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    Users,
    ClipboardCheck,
    Calendar,
    Clock,
    MapPin,
    RefreshCw,
    Plus,
    Play,
} from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { toast } from "sonner";

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        stats: {
            totalClasses: 0,
            totalStudents: 0,
            attendanceRate: "0%",
            todayClasses: 0,
        },
        todayClasses: [],
        recentSessions: [],
    });

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await dashboardService.getTeacherDashboard();
            if (response.success) {
                setData(response.data);
            }
        } catch (err) {
            console.error("Error fetching dashboard:", err);
            setError("ไม่สามารถโหลดข้อมูล Dashboard ได้");
            toast.error("ไม่สามารถโหลดข้อมูล Dashboard ได้");
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: "My Classes",
            value: data.stats.totalClasses,
            icon: BookOpen,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            iconColor: "#3b82f6",
        },
        {
            label: "Total Students",
            value: data.stats.totalStudents,
            icon: Users,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-50",
            iconColor: "#22c55e",
        },
        {
            label: "Today's Attendance",
            value: data.stats.attendanceRate,
            icon: ClipboardCheck,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-50",
            iconColor: "#a855f7",
        },
        {
            label: "Today's Classes",
            value: data.stats.todayClasses,
            icon: Calendar,
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-orange-50",
            iconColor: "#f97316",
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">กำลังโหลด Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchDashboard}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                        ลองใหม่
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500">
                        Welcome back! Here's what's happening today.
                    </p>
                </div>
                <button
                    onClick={fetchDashboard}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-800">
                                        {stat.value}
                                    </p>
                                </div>
                                <div
                                    className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}
                                >
                                    <Icon
                                        className="w-6 h-6"
                                        style={{ color: stat.iconColor }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Today's Classes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Today's Classes
                </h2>
                {data.todayClasses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>ไม่มีคลาสเรียนในวันนี้</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.todayClasses.map((classItem, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(`/teacher/classes/${classItem._id}`)}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {classItem.classCode} - {classItem.className}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {classItem.time}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {classItem.room}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span>{classItem.students} students</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/teacher/attendance/${classItem._id}`);
                                        }}
                                        className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                                    >
                                        <Play className="w-3 h-3" />
                                        Start
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => navigate("/teacher/classes")}
                    className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 flex flex-col items-start"
                >
                    <BookOpen className="w-6 h-6 mb-2" />
                    <span className="font-medium">My Classes</span>
                    <span className="text-sm text-blue-100">View all your classes</span>
                </button>
                <button
                    onClick={() => navigate("/teacher/classes/new")}
                    className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25 flex flex-col items-start"
                >
                    <Plus className="w-6 h-6 mb-2" />
                    <span className="font-medium">Create Class</span>
                    <span className="text-sm text-purple-100">Start a new class</span>
                </button>
                <button
                    onClick={() => navigate("/teacher/profile")}
                    className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/25 flex flex-col items-start"
                >
                    <Users className="w-6 h-6 mb-2" />
                    <span className="font-medium">My Profile</span>
                    <span className="text-sm text-green-100">Update your info</span>
                </button>
            </div>

            {/* Recent Sessions */}
            {data.recentSessions.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Recent Attendance Sessions
                    </h2>
                    <div className="space-y-2">
                        {data.recentSessions.map((session, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium text-gray-800">
                                        {session.classCode} - {session.className}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(session.date).toLocaleDateString("th-TH", {
                                            weekday: "short",
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {session.summary && (
                                        <div className="text-sm text-gray-600">
                                            <span className="text-green-600">
                                                ✓ {session.summary.present || 0}
                                            </span>
                                            {" / "}
                                            <span className="text-yellow-600">
                                                ⏰ {session.summary.late || 0}
                                            </span>
                                            {" / "}
                                            <span className="text-red-600">
                                                ✗ {session.summary.absent || 0}
                                            </span>
                                        </div>
                                    )}
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${session.status === "CLOSED"
                                                ? "bg-gray-100 text-gray-600"
                                                : "bg-green-100 text-green-600"
                                            }`}
                                    >
                                        {session.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
