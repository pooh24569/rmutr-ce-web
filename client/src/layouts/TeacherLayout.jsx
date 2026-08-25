import React from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "@/components/navbar/NavbarTeacher/TeacherSidebar";
import { useSidebar } from "@/hooks/useSidebar";
import SidebarOverlay from "@/components/navbar/SidebarOverlay";
import MobileHeader from "@/components/navbar/MobileHeader";
import { BookOpen } from "lucide-react";

const TeacherLayout = () => {
    const { isMobile, isOpen, toggle, close } = useSidebar();

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-gray-100">
            {/* Mobile Header */}
            <MobileHeader
                onMenuClick={toggle}
                title="RMUTR"
                subtitle="Teacher Portal"
                accentColor="text-blue-600"
                gradientFrom="from-blue-500"
                gradientTo="to-purple-600"
                icon={BookOpen}
            />

            {/* Mobile Sidebar Overlay */}
            {isMobile && (
                <>
                    <SidebarOverlay isOpen={isOpen} onClose={close} />
                    <div className={`sidebar-panel ${isOpen ? "sidebar-panel-visible" : "sidebar-panel-hidden"}`}>
                        <TeacherSidebar onNavClick={close} />
                    </div>
                </>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex">
                <TeacherSidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default TeacherLayout;
