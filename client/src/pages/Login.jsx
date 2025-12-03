// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuthForm } from "@/hooks/useAuthForm";
import AuthCard from "@/components/auth/AuthCard";
import { EyeIcon, EyeSlashIcon, UserIcon } from "@heroicons/react/24/outline";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();  // ⭐ ใช้ตรงนี้
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    values,
    error,
    loading,
    setError,
    setLoading,
    onChange,
    handleError,
  } = useAuthForm({ username: "", password: "" });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/auth/login", {
        username: values.username.trim(),
        password: values.password,
      });

      // save auth
      login({ user: data.user, token: data.token });

      // ⭐ ถ้ามาจากหน้า protected → กลับไปหน้าเดิมได้เลย
      const from = location.state?.from || getDefaultPath(data.user.role);

      navigate(from, { replace: true });

    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ ฟังก์ชันช่วยเลือกว่า role ไหนควรไปหน้าไหน
  const getDefaultPath = (role) => {
    if (role === "student") return "/student/homework";
    if (["admin", "superadmin"].includes(role)) return "/admin";
    return "/";
  };

  return (
    <AuthCard title="Get Started">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && (
          <div
            className="text-red-700 text-sm border border-red-200 bg-red-50 p-2 rounded-md"
            role="alert"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="username"
            className="mb-1 block text-sm text-neutral-700"
          >
            Username
          </label>
          <div className="relative">
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Student ID"
              value={values.username}
              onChange={onChange}
              required
              className="w-full rounded-xl border border-neutral-300/80 bg-white/80 px-3 py-2 pr-9 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-500 focus:bg-white"
            />
            <UserIcon
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm text-neutral-700"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={values.password}
              onChange={onChange}
              required
              className="w-full rounded-xl border border-neutral-300/80 bg-white/80 px-3 py-2 pr-10 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-500 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-600 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
              aria-label={showPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            >
              {showPw ? (
                <EyeSlashIcon className="h-5 w-5 text-neutral-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-neutral-600" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-600">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-neutral-300 text-rose-600 focus:ring-rose-400"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me</span>
          </label>

          <Link
            to="/reset-email"
            className="font-medium text-rose-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading || !values.username || !values.password}
          className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? "กำลังเข้าสู่ระบบ…" : "Log in"}
        </button>

        <p className="text-center text-xs text-neutral-500">
          Don&apos;t have an account{" "}
          <Link
            to="/register"
            className="font-medium text-rose-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
