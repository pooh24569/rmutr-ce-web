// src/pages/teacher/Dashboard.jsx
import React from "react";
import { BookOpen, Users, ClipboardCheck, AlertCircle } from "lucide-react";

const Dashboard = () => {
    // TODO: ดึงข้อมูลจริงจาก API
    const stats = [
        {
            label: "My Classes",
            value: "5",
            icon: BookOpen,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            label: "Total Students",
            value: "156",
            icon: Users,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-50",
        },
        {
            label: "Today's Attendance",
            value: "89%",
            icon: ClipboardCheck,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            label: "Pending Homework",
            value: "12",
            icon: AlertCircle,
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-orange-50",
        },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
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
                                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                                    <Icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                                        style={{
                                            color: stat.color.includes('blue') ? '#3b82f6' :
                                                stat.color.includes('green') ? '#22c55e' :
                                                    stat.color.includes('purple') ? '#a855f7' : '#f97316'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Today's Classes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Classes</h2>
                <div className="space-y-3">
                    {[].map((classItem, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                                <div>
                                    <p className="font-medium text-gray-800">{classItem.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {classItem.time} • Room {classItem.room}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{classItem.students} students</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25">
                    <ClipboardCheck className="w-6 h-6 mb-2" />
                    <span className="font-medium">Start Attendance</span>
                </button>
                <button className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25">
                    <BookOpen className="w-6 h-6 mb-2" />
                    <span className="font-medium">Create Class</span>
                </button>
                <button className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/25">
                    <AlertCircle className="w-6 h-6 mb-2" />
                    <span className="font-medium">Assign Homework</span>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
