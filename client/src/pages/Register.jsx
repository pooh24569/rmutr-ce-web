// frontend/src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuthForm } from "@/hooks/useAuthForm";
import AuthCard from "@/components/auth/AuthCard";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";


export default function Register() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const { values, error, loading, setError, setLoading, onChange, handleError } =
    useAuthForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");

    // Client-side validation
    if (!values.username.trim() || !values.email.trim() || values.password.length < 6) {
      setError("กรุณากรอกข้อมูลให้ครบและรหัสผ่านอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (values.password !== values.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/register", {
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      });

      navigate("/login", { replace: true });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create an Account">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="text-red-700 text-sm border border-red-200 bg-red-50 p-2 rounded-md">
            {error}
          </div>
        )}

        {/* Username */}
        <div>
          <label htmlFor="username" className="mb-1 block text-sm text-neutral-700">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Student ID"
            value={values.username}
            onChange={onChange}
            required
            className="w-full rounded-xl border border-neutral-300/80 bg-white/80 px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-500 focus:bg-white"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-neutral-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="example@email.com"
            value={values.email}
            onChange={onChange}
            required
            className="w-full rounded-xl border border-neutral-300/80 bg-white/80 px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-500 focus:bg-white"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-neutral-700">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="Enter password"
              value={values.password}
              onChange={onChange}
              required
              className="w-full rounded-xl border border-neutral-300/80 bg-white/80 px-3 py-2 pr-10 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-500 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-600 hover:bg-neutral-100"
            >
              {showPw ? (
                <EyeSlashIcon className="h-5 w-5 text-neutral-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-neutral-600" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm text-neutral-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            value={values.confirmPassword}
            onChange={onChange}
            required
            className="w-full rounded-xl border border-neutral-300/80 bg-white/80 px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-500 focus:bg-white"
          />
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="mb-1 block text-sm text-neutral-700">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={values.role}
            onChange={onChange}
            className="w-full rounded-xl border border-neutral-300/80 bg-white/80 px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:bg-white"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="parent">Parent</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !values.username || !values.email || !values.password}
          className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "กำลังสมัคร…" : "Register"}
        </button>

        <p className="text-center text-xs text-neutral-500">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-rose-600 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </AuthCard>
  );
}