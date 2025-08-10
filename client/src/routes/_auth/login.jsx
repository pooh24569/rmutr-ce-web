import React, { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const [serverError, setServerError] = useState("");

  const onSubmit = async (values) => {
    setServerError("");
    try {
      // ไม่ยุ่ง backend: แค่เรียกใช้ endpoint ที่มีอยู่แล้ว
      const base = import.meta.env.VITE_API_BASE || "http://localhost:7001";
      const { data } = await axios.post(`${base}/api/auth/login`, values);
      // เก็บ token + user ฝั่ง FE เอง
      localStorage.setItem(
        "auth",
        JSON.stringify({ token: data.token, user: data.user })
      );
      // ไปหน้า admin
      window.location.href = "/admin";
    } catch (err) {
      const msg = err?.response?.data?.message || "เข้าสู่ระบบไม่สำเร็จ";
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 border rounded-2xl p-6 shadow"
      >
        <h1 className="text-2xl font-semibold text-center">เข้าสู่ระบบ</h1>

        {serverError && (
          <div className="text-red-600 text-sm border border-red-200 bg-red-50 p-2 rounded">
            {serverError}
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="username" className="text-sm">
            ชื่อผู้ใช้
          </label>
          <input
            id="username"
            className="w-full border rounded px-3 py-2"
            placeholder="username"
            {...register("username", { required: true })}
          />
          {errors.username && (
            <p className="text-xs text-red-600">กรุณากรอกชื่อผู้ใช้</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm">
            รหัสผ่าน
          </label>
          <input
            id="password"
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder="••••••••"
            {...register("password", { required: true })}
          />
          {errors.password && (
            <p className="text-xs text-red-600">กรุณากรอกรหัสผ่าน</p>
          )}
        </div>

        <button
          disabled={isSubmitting}
          className="w-full rounded-xl px-4 py-2 border shadow text-white bg-black disabled:opacity-60"
        >
          {isSubmitting ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
        </button>

        <p className="text-xs text-center text-gray-500">
          ยังไม่มีบัญชี?{" "}
          <a href="/register" className="underline">
            สมัครสมาชิก
          </a>
        </p>
      </form>
    </div>
  );
}
