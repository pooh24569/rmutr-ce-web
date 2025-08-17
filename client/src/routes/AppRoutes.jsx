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

function RequireAuth() {
  const saved = localStorage.getItem("auth");
  const token = saved ? JSON.parse(saved).token : null;
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-email" element={<ResetEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="about" element={<About />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<LayoutAdmin />}>
            <Route index element={<Dashboard />} />
            <Route path="manage" element={<Manage />} />
            <Route path="camping" element={<Camping />} />
          </Route>
        </Route>
        <Route path="*" element={<Notfound />} />
      </Routes>
    </BrowserRouter>
  );
}
