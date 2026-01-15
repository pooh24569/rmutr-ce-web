import React from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "@/components/navbar/NavbarTeacher/TeacherSidebar";

const TeacherLayout = () => {
    return (
        <div className="min-h-screen flex bg-gray-100">
            {}
            <TeacherSidebar />

            {}
            <main className="flex-1 flex flex-col overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default TeacherLayout;
