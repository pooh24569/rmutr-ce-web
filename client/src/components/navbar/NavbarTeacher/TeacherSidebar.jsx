
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import {
    LogOut,
    LayoutDashboard,
    BookOpen,
    Users,
    CalendarDays,
    ClipboardList,
    FileText,
    BarChart3,
    User
} from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";

const teacherLinks = [
    {
        href: "/teacher/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard
    },
    {
        href: "/teacher/classes",
        label: "My Classes",
        icon: BookOpen
    },
    {
        href: "/teacher/attendance",
        label: "Attendance",
        icon: ClipboardList
    },
    {
        href: "/teacher/homework",
        label: "Homework",
        icon: FileText
    },
    {
        href: "/teacher/calendar",
        label: "Calendar",
        icon: CalendarDays
    },
    {
        href: "/teacher/reports",
        label: "Reports",
        icon: BarChart3
    },
];

const TeacherSidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const { profile, fetchProfile } = useProfile();
    const [openConfirm, setOpenConfirm] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [location.pathname]);

    const handleLogoutConfirm = () => {
        logout();
        window.location.assign("/login");
    };

    const displayName = profile?.firstName || user?.firstName || "";
    const displayLastName = profile?.lastName || user?.lastName || "";
    const displayImage = profile?.profileImage;
    const initial = displayName?.charAt(0) || user?.username?.charAt(0) || "T";

    return (
        <aside className="w-64 bg-gradient-to-b from-[#1a1a2e] to-[#16213e] text-white flex flex-col min-h-screen">
            {}
            <div className="h-20 flex items-center px-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">RMUTR</h1>
                        <p className="text-xs text-gray-400">Teacher Portal</p>
                    </div>
                </div>
            </div>

            {}
            <Link
                to="/teacher/profile"
                className="block px-6 py-4 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                        {displayImage ? (
                            <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                                {initial}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-sm">
                            {displayName} {displayLastName}
                        </p>

                    </div>
                </div>
            </Link>

            {}
            <div className="px-6 pt-6 pb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Main Menu
            </div>

            {}
            <nav className="flex-1 px-3 space-y-1">
                {teacherLinks.map((item) => {
                    const active = location.pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={[
                                "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all duration-200",
                                active
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                                    : "text-gray-300 hover:bg-white/10 hover:text-white",
                            ].join(" ")}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {}
            <div className="p-4 border-t border-white/10">
                <button
                    type="button"
                    onClick={() => setOpenConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-gray-300 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>

            {}
            <ConfirmDialog
                show={openConfirm}
                onCancel={() => setOpenConfirm(false)}
                onConfirm={handleLogoutConfirm}
            />
        </aside>
    );
};

export default TeacherSidebar;
