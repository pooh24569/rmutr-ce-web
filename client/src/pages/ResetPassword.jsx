// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import api from "@/lib/api";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");
  const otp = searchParams.get("otp");

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErr("");
    setSuccess("");

    if (values.password !== values.confirmPassword) {
      setErr("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (!email || !otp) {
      setErr("ลิงก์ไม่ถูกต้องหรือหมดอายุ");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/api/auth/reset-password`, {
        email,
        otp,
        newPassword: values.password,
      });

      if (!data?.success) {
        setErr(data?.message || "รีเซ็ตรหัสผ่านไม่สำเร็จ");
        return;
      }

      setSuccess("รีเซ็ตรหัสผ่านเรียบร้อย กำลังไปหน้าเข้าสู่ระบบ...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (e) {
      setErr(e?.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  if (!email || !otp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="relative w-[92vw] max-w-sm sm:max-w-md rounded-3xl bg-white/30 backdrop-blur-xl shadow-xl ring-1 ring-white/60 p-6 sm:p-8">
          <p className="text-center text-sm text-neutral-600 mb-6 font-bold">
            ลิงก์ไม่ถูกต้องหรือหมดอายุ กรุณาขอใหม่อีกครั้ง
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="relative w-[92vw] max-w-sm sm:max-w-md rounded-3xl bg-white/30 backdrop-blur-xl shadow-xl ring-1 ring-white/60 p-6 sm:p-8">
        <div className="flex justify-center mb-4">
          <img
            src="/LOGO-RMUTR.png"
            alt="RMUTR Logo"
            className="h-14 sm:h-20 w-auto object-contain"
          />
        </div>

        <p className="text-center text-sm text-neutral-600 mb-6 font-bold">
          ตั้งรหัสผ่านใหม่
        </p>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {err && (
            <div className="text-red-700 text-sm border border-red-200 bg-red-50 p-2 rounded-md">
              {err}
            </div>
          )}
          {success && (
            <div className="text-green-700 text-sm border border-green-200 bg-green-50 p-2 rounded-md">
              {success}
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm text-neutral-700 mb-1"
            >
              รหัสผ่านใหม่
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={values.password}
              onChange={onChange}
              required
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm text-neutral-700 mb-1"
            >
              ยืนยันรหัสผ่าน
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={values.confirmPassword}
              onChange={onChange}
              required
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !values.password || !values.confirmPassword}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "กำลังรีเซ็ต…" : "รีเซ็ตรหัสผ่าน"}
          </button>
        </form>
      </div>
    </div>
  );
}