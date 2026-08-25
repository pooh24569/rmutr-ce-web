
import React, { useState } from "react";
import api from "@/lib/api";

export default function ResetEmail() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErr("");
    setInfo("");

    if (!email.trim()) {
      setErr("กรุณากรอกอีเมล");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/auth/send-reset-otp`, {
        email: email.trim(),
      });

      if (!data?.success) {
        setErr(data?.message || "ส่ง OTP ไม่สำเร็จ");
        return;
      }

      setInfo("ส่ง OTP ไปที่อีเมลของคุณแล้ว");
      window.location.assign(
        `/verify-otp?email=${encodeURIComponent(email.trim())}`
      );
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
          <img
            src="/LOGO-RMUTR.png"
            alt="RMUTR Logo"
            className="h-14 sm:h-20 w-auto object-contain"
          />
        </div>

        <p className="text-center text-sm text-neutral-600 mb-6 font-bold">
          ขอ OTP รีเซ็ตรหัสผ่าน
        </p>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {err && (
            <div className="text-red-700 text-sm border border-red-200 bg-red-50 p-2 rounded-md">
              {err}
            </div>
          )}
          {info && (
            <div className="text-green-700 text-sm border border-green-200 bg-green-50 p-2 rounded-md">
              {info}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm text-neutral-700 mb-1"
            >
              Email
            </label>
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
            {loading ? "กำลังส่ง…" : "ส่ง OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}