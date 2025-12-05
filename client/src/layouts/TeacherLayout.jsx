import React from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "@/components/navbar/NavbarTeacher/TeacherSidebar";

const TeacherLayout = () => {
    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar ฝั่งซ้าย */}
            <TeacherSidebar />

            {/* เนื้อหาฝั่งขวา */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default TeacherLayout;
