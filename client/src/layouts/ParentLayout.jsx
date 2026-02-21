import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import {
    Users,
    LayoutDashboard,
    LogOut,
    GraduationCap,
} from "lucide-react";

const ParentLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [parentData, setParentData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("parentToken");
        const data = localStorage.getItem("parentData");

        if (!token) {
            navigate("/parent/login");
            return;
        }

        if (data) {
            setParentData(JSON.parse(data));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("parentToken");
        localStorage.removeItem("parentData");
        navigate("/parent/login");
    };

    const menuItems = [
        { path: "/parent", label: "Dashboard", icon: LayoutDashboard },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            <aside className="w-64 bg-gradient-to-b from-[#0d6e5e] to-[#0a5c4f] text-white flex flex-col">
                <div className="h-20 flex items-center px-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">RMUTR</h1>
                            <p className="text-xs text-gray-300">Parent Portal</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">
                                {parentData?.studentName || "ผู้ปกครอง"}
                            </p>
                            <p className="text-xs text-gray-300">
                                รหัส: {parentData?.studentId || "-"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 pt-6 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Main Menu
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    {menuItems.map((item) => {
                        const active = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={[
                                    "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all duration-200",
                                    active
                                        ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg"
                                        : "text-gray-300 hover:bg-white/10 hover:text-white",
                                ].join(" ")}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-gray-300 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>ออกจากระบบ</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default ParentLayout;
