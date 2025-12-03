// frontend/src/routes/AppRoutes.jsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ResetEmail from "@/pages/ResetEmail";
import ResetPassword from "@/pages/ResetPassword";
import VerifyOtp from "@/pages/VerifyOtp";
import Notfound from "@/pages/Notfound";
import Unauthorized from "@/pages/Unauthorized"; // ✨ เพิ่ม

import ProtectedRoute from "@/components/ProtectedRoute"; // ✨ เพิ่ม

import AdminLayout from "@/layouts/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import Manage from "@/pages/admin/Manage";
import Camping from "@/pages/admin/Camping";

import StudentLayout from "@/layouts/StudentLayout";
import HomeworkList from "@/pages/student/HomeworkList";
import Calendar from "@/pages/student/Calendar";
import Schedule from "@/pages/student/Schedule";

/**
 * ✅ ดีกว่าเดิมยังไง:
 * - ใช้ ProtectedRoute component (cleaner)
 * - มี loading state
 * - มี unauthorized page
 * - แยก logic ออกจาก routes
 */
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-email" element={<ResetEmail />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} /> {/* ✨ เพิ่ม */}

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* 🎓 Student Portal */}
          <Route
            element={<ProtectedRoute roles={["student"]} />}
          >
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="/student/homework" replace />} />
              <Route path="homework" element={<HomeworkList />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="schedule" element={<Schedule />} />
            </Route>
          </Route>

          {/* 🛠 Admin Portal */}
          <Route
            element={<ProtectedRoute roles={["admin", "superadmin"]} />}
          >
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="manage" element={<Manage />} />
              <Route path="camping" element={<Camping />} />
            </Route>
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Notfound />} />
      </Routes>
    </BrowserRouter>
  );
}