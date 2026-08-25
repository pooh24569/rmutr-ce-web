import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import {
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowTrendingUpIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ total: 0, admins: 0, instructors: 0, students: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:7001/api"}/user-admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const users = await res.json();
          setStats({
            total: users.length,
            admins: users.filter((u) => ["admin", "superadmin"].includes(u.role)).length,
            instructors: users.filter((u) => u.role === "instructor").length,
            students: users.filter((u) => u.role === "student").length,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, [token]);

  const cards = [
    { label: "Total Users", value: stats.total, icon: UserGroupIcon, color: "from-blue-500 to-blue-600", bg: "bg-blue-50" },
    { label: "Admins", value: stats.admins, icon: Cog6ToothIcon, color: "from-purple-500 to-purple-600", bg: "bg-purple-50" },
    { label: "Instructors", value: stats.instructors, icon: ArrowTrendingUpIcon, color: "from-green-500 to-green-600", bg: "bg-green-50" },
    { label: "Students", value: stats.students, icon: AcademicCapIcon, color: "from-amber-500 to-amber-600", bg: "bg-amber-50" },
  ];

  const quickLinks = [
    { to: "/admin/users", label: "Manage Users", icon: UserGroupIcon, desc: "Add, edit, or remove users" },
    { to: "/admin/manage", label: "Settings", icon: Cog6ToothIcon, desc: "System configuration" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, <span className="text-amber-600">{user?.username}</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening in your system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center`}>
                <c.icon className={`w-5 h-5 bg-gradient-to-r ${c.color} bg-clip-text`} style={{ color: 'currentColor' }} />
              </div>
            </div>
            <p className={`text-3xl font-bold bg-gradient-to-r ${c.color} bg-clip-text text-transparent`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-amber-200 transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <link.icon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">{link.label}</p>
                <p className="text-xs text-gray-400">{link.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
