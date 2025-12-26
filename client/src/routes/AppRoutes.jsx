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
import Unauthorized from "@/pages/Unauthorized";

import ProtectedRoute from "@/components/ProtectedRoute";

import AdminLayout from "@/layouts/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import Manage from "@/pages/admin/Manage";
import Camping from "@/pages/admin/Camping";

import StudentLayout from "@/layouts/StudentLayout";
import HomeworkList from "@/pages/student/HomeworkList";
import HomeworkDetail from "@/pages/student/HomeworkDetail";
import ClassHomework from "@/pages/student/ClassHomework";
import StudentCalendar from "@/pages/student/Calendar";
import Schedule from "@/pages/student/Schedule";
import Profile from "@/pages/student/Profile";
import ProfileEdit from "@/pages/student/ProfileEdit";
import Registration from "@/pages/student/Registration";

// Teacher Portal
import TeacherLayout from "@/layouts/TeacherLayout";
import TeacherDashboard from "@/pages/teacher/Dashboard";
import TeacherClasses from "@/pages/teacher/Classes";
import ClassDetail from "@/pages/teacher/ClassDetail";
import StartAttendance from "@/pages/teacher/StartAttendance";
import TeacherProfile from "@/pages/teacher/Profile";
import HomeworkManage from "@/pages/teacher/HomeworkManage";
import HomeworkSubmissions from "@/pages/teacher/HomeworkSubmissions";
import TeacherCalendar from "@/pages/teacher/Calendar";

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
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* 🎓 Student Portal */}
          <Route element={<ProtectedRoute roles={["student"]} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="/student/homework" replace />} />
              <Route path="homework" element={<HomeworkList />} />
              <Route path="homework/class/:classId" element={<ClassHomework />} />
              <Route path="homework/:homeworkId" element={<HomeworkDetail />} />
              <Route path="calendar" element={<StudentCalendar />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/edit" element={<ProfileEdit />} />
              <Route path="registration" element={<Registration />} />
            </Route>
          </Route>

          {/* 👨‍🏫 Teacher Portal */}
          <Route element={<ProtectedRoute roles={["teacher"]} />}>
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route index element={<Navigate to="/teacher/dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="classes" element={<TeacherClasses />} />
              <Route path="classes/:classId" element={<ClassDetail />} />
              <Route path="attendance/start/:classId" element={<StartAttendance />} />
              <Route path="attendance" element={<div className="p-6"><h1 className="text-2xl font-bold">Attendance</h1><p className="text-gray-500">Coming soon...</p></div>} />
              <Route path="homework" element={<HomeworkManage />} />
              <Route path="homework/:homeworkId/submissions" element={<HomeworkSubmissions />} />
              <Route path="calendar" element={<TeacherCalendar />} />
              <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p className="text-gray-500">Coming soon...</p></div>} />
              <Route path="profile" element={<TeacherProfile />} />
            </Route>
          </Route>

          {/* 🛠 Admin Portal */}
          <Route element={<ProtectedRoute roles={["admin", "superadmin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
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

