import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const baseURL = import.meta.env.VITE_API_BASE || "http://localhost:7001";

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErr("");

    if (!values.username.trim() || !values.email.trim() || values.password.length < 6) {
      setErr("กรุณากรอกข้อมูลให้ครบและรหัสผ่านอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (values.password !== values.confirmPassword) {
      setErr("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${baseURL}/api/auth/register`, {
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      });

      localStorage.setItem(
        "auth",
        JSON.stringify({ token: data.token, user: data.user })
      );
      window.location.assign("/admin");
    } catch (e) {
      setErr(e?.response?.data?.message || "สมัครไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="relative">
        {/* Background blur / gradient */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute -top-10 -left-12 h-44 w-44 sm:h-56 sm:w-56 md:h-72 md:w-72 rounded-full blur-2xl opacity-100 bg-gradient-to-br from-rose-300 via-orange-200 to-amber-200" />
          <div className="absolute -top-14 right-[-2.5rem] h-40 w-40 sm:h-52 sm:w-52 md:h-64 md:w-64 rounded-full blur-2xl opacity-40 bg-gradient-to-br from-sky-200 via-sky-300 to-sky-200" />
          <div className="absolute bottom-[-2rem] right-[-3rem] h-64 w-64 sm:h-72 sm:w-72 md:h-96 md:w-96 rounded-full blur-[100px] opacity-50 bg-gradient-to-br from-teal-200 via-emerald-200 to-teal-300" />
          <div className="absolute -bottom-12 -left-14 h-64 w-64 sm:h-72 sm:w-72 md:h-96 md:w-96 rounded-full blur-2xl opacity-50 bg-gradient-to-br from-pink-200 via-rose-200 to-pink-300" />
        </div>

        {/* CARD */}
        <div className="relative z-10 w-[92vw] max-w-sm sm:max-w-md rounded-3xl bg-white/30 backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.25)] ring-1 ring-white/60 p-6 sm:p-8">
          
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src="/LOGO-RMUTR.png"
              alt="RMUTR Logo"
              className="h-14 sm:h-30 w-auto object-contain"
            />
          </div>

          <p className="text-center text-sm text-neutral-600 mb-6">
            <span className="font-bold">Create an Account</span>
          </p>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {err && (
              <div className="text-red-700 text-sm border border-red-200 bg-red-50 p-2 rounded-md" role="alert">
                {err}
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-600 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  aria-label={showPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPw ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 3l18 18" />
                      <path d="M10.58 10.58a2 2 0 0 0 2.84 2.84" />
                      <path d="M16.1 16.1A9.77 9.77 0 0 1 12 18c-5 0-9-6-9-6a16.92 16.92 0 0 1 4.66-4.66" />
                      <path d="M14.12 5.09A10.45 10.45 0 0 1 21 12s-1 1.67-2.9 3.35" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !values.username || !values.email || !values.password || !values.confirmPassword}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
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
        </div>
      </div>
    </div>
  );
}
