import React from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "@/components/navbar/NavberStudent/StudentSidebar";

const StudentLayout = () => {
  return (
    <div className="min-h-screen flex bg-[#e5e5e5]">
      {}
      <StudentSidebar />

      {}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
