import React from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "@/components/navbar/NavberStudent/StudentSidebar";
import { useSidebar } from "@/hooks/useSidebar";
import SidebarOverlay from "@/components/navbar/SidebarOverlay";
import MobileHeader from "@/components/navbar/MobileHeader";

const StudentLayout = () => {
  const { isMobile, isOpen, toggle, close } = useSidebar();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#e5e5e5]">
      {/* Mobile Header */}
      <MobileHeader
        onMenuClick={toggle}
        title="RMUTR"
        subtitle="Student Portal"
        accentColor="text-red-600"
        gradientFrom="from-red-500"
        gradientTo="to-red-600"
        iconElement={
          <img src="/LOGO-RMUTR.png" alt="RMUTR" className="h-8 object-contain" />
        }
      />

      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <>
          <SidebarOverlay isOpen={isOpen} onClose={close} />
          <div className={`sidebar-panel ${isOpen ? "sidebar-panel-visible" : "sidebar-panel-hidden"}`}>
            <StudentSidebar onNavClick={close} />
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <StudentSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
