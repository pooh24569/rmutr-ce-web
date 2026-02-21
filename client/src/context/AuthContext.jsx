
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const checkAuth = async () => {
      try {

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

  const updateUser = (updates) => {
    setAuth((prev) => {
      const next = { ...prev, user: { ...prev.user, ...updates } };
      localStorage.setItem("auth", JSON.stringify(next));
      return next;
    });
  };

  const hasPermission = (permission) =>
    auth.user?.permissions?.includes(permission) || false;

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      loading,
      login,
      logout,
      updateUser,
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