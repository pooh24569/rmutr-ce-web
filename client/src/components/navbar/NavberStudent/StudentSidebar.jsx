// src/components/navbar/NavberStudent/StudentSidebar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";

const studentLinks = [
  { href: "/student/homework", label: "HOMEWORK LIST" },
  { href: "/student/calendar", label: "CALENDAR" },
  { href: "/student/schedule", label: "SCHEDULE" },          // ตารางเรียน
  { href: "/student/registration", label: "REGISTRATION" },  // ลงทะเบียน
  { href: "/student/attendance", label: "CHECK ATTENDANCE" },
  { href: "/student/profile", label: "PROFILE" },
];

const StudentSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleLogoutConfirm = () => {
    logout();
    window.location.assign("/login");
  };

  return (
    <aside className="w-60 bg-[#f5f5f5] border-r border-[#dddddd] flex flex-col">
      {/* Logo */}
      <div className="h-20 flex items-center px-6">
        <img
          src="/LOGO-RMUTR.png"
          alt="RMUTR"
          className="h-20 object-contain"
        />
      </div>

      {/* Menu items */}
      <nav className="flex-1 px-2 space-y-1 py-0">
        {studentLinks.map((item) => {
          const active = location.pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={[
                "flex items-center gap-3 px-4 py-2.5 text-sm rounded-md transition-colors",
                active
                  ? "bg-[#ffffff] text-[#e62b2b] border-l-4 border-[#e62b2b]"
                  : "text-[#444] hover:bg-[#ffffff] hover:text-[#e62b2b]",
              ].join(" ")}
            >
              <span className="uppercase text-[11px] tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Sign out button */}
      <button
        type="button"
        onClick={() => setOpenConfirm(true)}
        className="m-4 mt-auto flex items-center gap-2 px-4 py-2 text-[11px] uppercase tracking-wide text-[#666] rounded-md hover:bg-white transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign out</span>
      </button>

      {/* Confirm dialog */}
      <ConfirmDialog
        show={openConfirm}
        onCancel={() => setOpenConfirm(false)}
        onConfirm={handleLogoutConfirm}
      />
    </aside>
  );
};

export default StudentSidebar;
