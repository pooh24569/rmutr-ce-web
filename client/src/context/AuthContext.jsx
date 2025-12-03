// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

const AuthContext = createContext(null);

const getInitialAuth = () => {
  if (typeof window === "undefined") {
    return { user: null, token: null };
  }

  const saved = localStorage.getItem("auth");
  if (!saved) return { user: null, token: null };

  try {
    const parsed = JSON.parse(saved);
    return {
      user: parsed.user || null,
      token: parsed.token || null,
    };
  } catch {
    return { user: null, token: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(getInitialAuth);
  const [loading, setLoading] = useState(true); // ✨ เพิ่ม loading

  // ✨ Check auth on mount
  useEffect(() => {
    // Simulate checking token validity
    const checkAuth = async () => {
      try {
        // ถ้ามี token อาจจะ verify กับ backend
        // const response = await api.get("/api/auth/verify");
        // if (!response.data.success) {
        //   logout();
        // }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = ({ user, token }) => {
    const next = { user, token };
    setAuth(next);
    localStorage.setItem("auth", JSON.stringify(next));
  };

  const logout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem("auth");
  };

  const hasPermission = (permission) =>
    auth.user?.permissions?.includes(permission) || false;

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      loading, // ✨ export loading
      login,
      logout,
      hasPermission,
    }),
    [auth, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export default AuthContext;