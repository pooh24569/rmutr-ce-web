import React, { useState } from "react";
import axios from "axios";

export default function ResetEmail() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const baseURL = import.meta.env.VITE_API_BASE || "http://localhost:7001";

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErr("");
    setSuccess("");

    if (!email.trim()) {
      setErr("กรุณากรอกอีเมล");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${baseURL}/api/auth/reset-password`, { email: email.trim() });
      setSuccess("ส่งลิงก์รีเซ็ตรหัสผ่านเรียบร้อย กรุณาเช็คอีเมล");
    } catch (e) {
      setErr(e?.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="relative w-[92vw] max-w-sm sm:max-w-md rounded-3xl bg-white/30 backdrop-blur-xl shadow-xl ring-1 ring-white/60 p-6 sm:p-8">
        <div className="flex justify-center mb-4">
          <img src="/LOGO-RMUTR.png" alt="RMUTR Logo" className="h-14 sm:h-20 w-auto object-contain" />
        </div>

        <p className="text-center text-sm text-neutral-600 mb-6 font-bold">Reset Password</p>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {err && <div className="text-red-700 text-sm border border-red-200 bg-red-50 p-2 rounded-md">{err}</div>}
          {success && <div className="text-green-700 text-sm border border-green-200 bg-green-50 p-2 rounded-md">{success}</div>}

          <div>
            <label htmlFor="email" className="block text-sm text-neutral-700 mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "กำลังส่ง…" : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
