
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/Loading";

export default function ProtectedRoute({ roles = [] }) {
    const { user, token, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loading fullScreen message="Checking authentication..." />;
    }

    if (!token) {
        return (
            <Navigate
                to="/login"
                state={{ from: location.pathname }}
                replace
            />
        );
    }

    if (roles.length > 0 && !roles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}