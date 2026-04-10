import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    HomeIcon,
    AcademicCapIcon,
    DocumentTextIcon,
    UserGroupIcon,
    CalendarDaysIcon,
    ArrowRightOnRectangleIcon,
    ShieldCheckIcon,
    RectangleStackIcon,
    FingerPrintIcon,
} from "@heroicons/react/24/outline";


const centralNav = [
    {
        to: "/registrar",
        icon: HomeIcon,
        label: "Dashboard",
        end: true,
    },
    {
        to: "/registrar/courses",
        icon: AcademicCapIcon,
        label: "จัดการรายวิชา",
    },
    {
        to: "/registrar/offerings",
        icon: RectangleStackIcon,
        label: "กลุ่มเรียน",
    },
];

const facultyNav = [
    {
        to: "/registrar",
        icon: HomeIcon,
        label: "Dashboard",
        end: true,
    },
    {
        to: "/registrar/enrollments",
        icon: UserGroupIcon,
        label: "ลงทะเบียนนักศึกษา",
    },
    {
        to: "/registrar/schedule",
        icon: CalendarDaysIcon,
        label: "จัดตารางเรียน",
    },
    {
        to: "/registrar/fingerprint",
        icon: FingerPrintIcon,
        label: "ลงทะเบียนลายนิ้วมือ",
    },
];

const ROLE_LABELS = {
    central_registrar: "ทะเบียนกลาง",
    faculty_registrar: "ทะเบียนคณะ",
};

const RegistrarLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/registrar/login", { replace: true });
    };

    const roleLabel = ROLE_LABELS[user?.role] || user?.role;
    const navItems =
        user?.role === "central_registrar" ? centralNav : facultyNav;

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
                {/* Logo */}
                <div className="p-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <ShieldCheckIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">
                                RMUTR Registrar
                            </p>
                            <p className="text-xs text-slate-400">
                                ระบบงานทะเบียน
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-blue-50 text-blue-700 shadow-sm"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User Info & Logout */}
                <div className="p-3 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                            {user?.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                user?.username?.charAt(0).toUpperCase() || "R"
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                                {user?.firstName
                                    ? `${user.firstName} ${user.lastName || ""}`
                                    : user?.username}
                            </p>
                            <p className="text-xs text-blue-600 truncate">
                                {roleLabel}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        ออกจากระบบ
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default RegistrarLayout;
