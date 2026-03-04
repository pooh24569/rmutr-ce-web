
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/Loading";

function getDefaultPath(role) {
  if (role === "student") return "/student/homework";
  if (role === "instructor") return "/teacher/dashboard";
  if (role === "parent") return "/parent/dashboard";
  if (["central_registrar", "faculty_registrar"].includes(role)) return "/registrar";
  if (role === "dept_head") return "/depthead";
  if (["admin", "superadmin"].includes(role)) return "/admin/dashboard";
  return "/";
}

export default function GuestRoute() {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="Loading..." />;
  }

  // If already logged in, redirect to their dashboard
  if (user && token) {
    return <Navigate to={getDefaultPath(user.role)} replace />;
  }

  return <Outlet />;
}
