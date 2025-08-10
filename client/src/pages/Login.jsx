import React, { useState } from "react";
import axios from "axios";

export default function Login() {
  const [showPw, setShowPw] = useState(false);
  const [values, setValues] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const baseURL = import.meta.env.VITE_API_BASE || "http://localhost:7001";

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();ฟ
    if (loading) return;
    setErr("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${baseURL}/api/auth/login`, {
        username: values.email.trim(),
        password: values.password,
      });
      localStorage.setItem("auth", JSON.stringify({ token: data.token, user: data.user }));
      window.location.assign("/admin");
    } catch (e) {
      setErr(e?.response?.data?.message || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      {/* WRAPPER: ยึดตำแหน่งฝุ่งรอบการ์ด */}
      <div className="relative">
        {/* DECOR รอบกรอบ (อยู่วงนอกของการ์ด) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
          {/* ขนาด responsive และยึดจากขอบการ์ดด้วย offset ติดลบ/บวก */}
          <div
            className="absolute -top-10 -left-12 h-44 w-44 sm:h-56 sm:w-56 md:h-72 md:w-72
                       rounded-full blur-2xl opacity-100
                       bg-gradient-to-br from-rose-300 via-orange-200 to-amber-200"
          />
          <div
            className="absolute -top-14 right-[-2.5rem] h-40 w-40 sm:h-52 sm:w-52 md:h-64 md:w-64
                       rounded-full blur-2xl opacity-40
                       bg-gradient-to-br from-sky-200 via-sky-300 to-sky-200"
          />
          <div
            className="absolute bottom-[-2rem] right-[-3rem] h-64 w-64 sm:h-72 sm:w-72 md:h-96 md:w-96
                       rounded-full blur-[100px] opacity-50
                       bg-gradient-to-br from-teal-200 via-emerald-200 to-teal-300"
          />
          <div
            className="absolute -bottom-12 -left-14 h-64 w-64 sm:h-72 sm:w-72 md:h-96 md:w-96
                       rounded-full blur-2xl opacity-50
                       bg-gradient-to-br from-pink-200 via-rose-200 to-pink-300"
          />
        </div>

        {/* CARD */}
        <div className="relative z-10 w-[92vw] max-w-sm sm:max-w-md rounded-3xl bg-white/30 backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.25)] ring-1 ring-white/60 p-6 sm:p-8">
          {/* โลโก้ */}
          <div className="flex justify-center mb-4">
            <img src="/LOGO-RMUTR.png" alt="RMUTR Logo" className="h-14 sm:h-30 w-auto object-contain" />
          </div>

          <p className="text-center text-sm text-neutral-600 mb-6">
            <span className="font-bold">Get Started</span>
          </p>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {err && (
              <div className="text-red-700 text-sm border border-red-200 bg-red-50 p-2 rounded-md" role="alert">
                {err}
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-neutral-700">
                Student email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Student ID@rmutr.ac.th"
                  value={values.email}
                  onChange={onChange}
                  required
                  className="w-full rounded-xl border border-neutral-300/80 bg-white/80 px-3 py-2 pr-9 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-500 focus:bg-white"
                />
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M4 6h16v12H4z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-neutral-700">
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

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading || !values.email || !values.password}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? "กำลังเข้าสู่ระบบ…" : "Log in"}
            </button>

            <p className="text-center text-xs text-neutral-500">
              Forgot password?{" "}
              <a href="/reset" className="font-medium text-rose-600 hover:underline">
                Reset
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
