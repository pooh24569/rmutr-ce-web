import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Layout from "@/layouts/Layout";
import LayoutAdmin from "@/layouts/LayoutAdmin";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Login from "@/pages/Login";
import Dashboard from "@/pages/admin/Dashboard";
import Manage from "@/pages/admin/Manage";
import Camping from "@/pages/admin/Camping";
import Notfound from "@/pages/Notfound";
import Register from "@/pages/Register";
import ResetEmail from "@/pages/ResetEmail";
import ResetPassword from "@/pages/ResetPassword";
import { useAuth } from "@/context/AuthContext";

// ต้องล็อกอินก่อน
function RequireAuth() {
  const { token } = useAuth();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

// ต้องมีสิทธิ์ตาม role ที่กำหนด
function RequireRole({ roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return roles.includes(user.role) ? <Outlet /> : <Navigate to="/" replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-email" element={<ResetEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="about" element={<About />} />
        </Route>

        {/* protected + role-based routes */}
        <Route element={<RequireAuth />}>
          {/* ให้เฉพาะ admin/superadmin เข้ากลุ่ม /admin */}
          <Route element={<RequireRole roles={["admin", "superadmin"]} />}>
            <Route path="/admin" element={<LayoutAdmin />}>
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
