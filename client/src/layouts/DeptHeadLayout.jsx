import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    HomeIcon,
    UserGroupIcon,
    AcademicCapIcon,
    ChartBarIcon,
    ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useSidebar } from "@/hooks/useSidebar";
import SidebarOverlay from "@/components/navbar/SidebarOverlay";
import MobileHeader from "@/components/navbar/MobileHeader";

const navItems = [
    { to: "/depthead", icon: HomeIcon, label: "Dashboard", end: true },
    { to: "/depthead/students", icon: UserGroupIcon, label: "นักศึกษาในสาขา" },
    { to: "/depthead/instructors", icon: AcademicCapIcon, label: "อาจารย์ในสาขา" },
    { to: "/depthead/reports", icon: ChartBarIcon, label: "รายงาน" },
];

const DeptHeadLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { isMobile, isOpen, toggle, close } = useSidebar();

    const handleLogout = () => {
        logout();
        navigate("/depthead/login", { replace: true });
    };

    const sidebarContent = (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 h-full">
            {/* Logo */}
            <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <AcademicCapIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-sm">
                            RMUTR
                        </p>
                        <p className="text-xs text-slate-400">
                            หัวหน้าสาขา
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
                                ? "bg-emerald-50 text-emerald-700"
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
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                            user?.username?.charAt(0).toUpperCase() || "D"
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                            {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.username}
                        </p>
                        <p className="text-xs text-emerald-600 truncate">
                            หัวหน้าสาขา
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
    );

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
            {/* Mobile Header */}
            <MobileHeader
                onMenuClick={toggle}
                title="RMUTR"
                subtitle="หัวหน้าสาขา"
                accentColor="text-emerald-600"
                gradientFrom="from-emerald-500"
                gradientTo="to-teal-600"
                icon={AcademicCapIcon}
            />

            {/* Mobile Sidebar Overlay */}
            {isMobile && (
                <>
                    <SidebarOverlay isOpen={isOpen} onClose={close} />
                    <div className={`sidebar-panel ${isOpen ? "sidebar-panel-visible" : "sidebar-panel-hidden"}`}>
                        {sidebarContent}
                    </div>
                </>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex">
                {sidebarContent}
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default DeptHeadLayout;
