
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
import GuestRoute from "@/components/GuestRoute";

import AdminLayout from "@/layouts/AdminLayout";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/Dashboard";
import Manage from "@/pages/admin/Manage";
import UserManagement from "@/pages/admin/UserManagement";
import AdminProfile from "@/pages/admin/AdminProfile";

import StudentLayout from "@/layouts/StudentLayout";
import HomeworkList from "@/pages/student/HomeworkList";
import HomeworkDetail from "@/pages/student/HomeworkDetail";
import ClassHomework from "@/pages/student/ClassHomework";
import StudentCalendar from "@/pages/student/Calendar";
import Schedule from "@/pages/student/Schedule";
import Profile from "@/pages/student/Profile";
import ProfileEdit from "@/pages/student/ProfileEdit";
import Registration from "@/pages/student/Registration";
import MyClasses from "@/pages/student/MyClasses";

import TeacherLayout from "@/layouts/TeacherLayout";
import TeacherDashboard from "@/pages/teacher/Dashboard";
import TeacherClasses from "@/pages/teacher/Classes";
import ClassDetail from "@/pages/teacher/ClassDetail";
import StartAttendance from "@/pages/teacher/StartAttendance";
import TeacherProfile from "@/pages/teacher/Profile";
import HomeworkManage from "@/pages/teacher/HomeworkManage";
import HomeworkSubmissions from "@/pages/teacher/HomeworkSubmissions";
import TeacherCalendar from "@/pages/teacher/Calendar";

import ParentLayout from "@/layouts/ParentLayout";
import ParentLogin from "@/pages/parent/ParentLogin";
import ParentDashboard from "@/pages/parent/Dashboard";

import RegistrarLogin from "@/pages/registrar/RegistrarLogin";
import RegistrarLayout from "@/layouts/RegistrarLayout";
import RegistrarDashboard from "@/pages/registrar/Dashboard";

import DeptHeadLogin from "@/pages/depthead/DeptHeadLogin";
import DeptHeadLayout from "@/layouts/DeptHeadLayout";
import DeptHeadDashboard from "@/pages/depthead/Dashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        { }
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Guest routes - redirect to dashboard if already logged in */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-email" element={<ResetEmail />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/registrar/login" element={<RegistrarLogin />} />
          <Route path="/depthead/login" element={<DeptHeadLogin />} />
          <Route path="/parent/login" element={<ParentLogin />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />

        { }
        <Route element={<ProtectedRoute />}>
          { }
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
              <Route path="myclasses" element={<MyClasses />} />
            </Route>
          </Route>

          { }
          <Route element={<ProtectedRoute roles={["instructor"]} />}>
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

          { }
          <Route element={<ProtectedRoute roles={["admin", "superadmin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="manage" element={<Manage />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>
          </Route>
        </Route>

        {/* Registrar Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedRoute roles={["central_registrar", "faculty_registrar"]} />}>
            <Route path="/registrar" element={<RegistrarLayout />}>
              <Route index element={<RegistrarDashboard />} />
              <Route path="dashboard" element={<RegistrarDashboard />} />
            </Route>
          </Route>
        </Route>

        {/* Dept Head Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedRoute roles={["dept_head"]} />}>
            <Route path="/depthead" element={<DeptHeadLayout />}>
              <Route index element={<DeptHeadDashboard />} />
              <Route path="dashboard" element={<DeptHeadDashboard />} />
            </Route>
          </Route>
        </Route>

        {/* Parent Routes - now uses standard auth */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedRoute roles={["parent"]} />}>
            <Route path="/parent" element={<ParentLayout />}>
              <Route index element={<ParentDashboard />} />
              <Route path="dashboard" element={<ParentDashboard />} />
            </Route>
          </Route>
        </Route>

        { }
        <Route path="*" element={<Notfound />} />
      </Routes>
    </BrowserRouter>
  );
}

