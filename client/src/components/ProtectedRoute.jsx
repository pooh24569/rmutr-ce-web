// frontend/src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/Loading";

export default function ProtectedRoute({ roles = [] }) {
    const { user, token, loading } = useAuth();
    const location = useLocation();

    // Show loading while checking auth
    if (loading) {
        return <Loading fullScreen message="Checking authentication..." />;
    }

    // Not logged in -> redirect to login
    if (!token) {
        return (
            <Navigate
                to="/login"
                state={{ from: location.pathname }}
                replace
            />
        );
    }

    // Logged in but wrong role -> show unauthorized
    if (roles.length > 0 && !roles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // All checks passed -> show content
    return <Outlet />;
}