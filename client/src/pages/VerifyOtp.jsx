
import React, { useState, useRef } from "react";
import api from "@/lib/api";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputsRef = useRef([]);

  const handleChange = (index, value) => {

    const v = value.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[index] = v;
    setDigits(next);

    if (v && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {

    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");

    if (!email) {
      setError("ลิงก์ไม่ถูกต้อง กรุณาขอ OTP ใหม่อีกครั้ง");
      return;
    }

    const code = digits.join("");
    if (code.length !== 6) {
      setError("กรุณากรอก OTP ให้ครบ 6 หลัก");
      return;
    }

    setLoading(true);
    try {

      const { data } = await api.post(`/api/auth/verify-reset-otp`, {
        email,
        otp: code,
      });

      if (!data?.success) {
        setError(data?.message || "Invalid OTP");
        return;
      }

      navigate(
        `/reset-password?email=${encodeURIComponent(
          email
        )}&otp=${encodeURIComponent(code)}`,
        { replace: true }
      );
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "เกิดข้อผิดพลาด"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#631a2b] to-[#3b2063] p-4">
        <div className="bg-[#0d0b14]/90 backdrop-blur-xl text-white w-[92vw] max-w-sm sm:max-w-md p-8 rounded-3xl shadow-2xl border border-white/10">
          <p className="text-center text-sm font-semibold">
            ลิงก์ไม่ถูกต้องหรือหมดอายุ กรุณาขอ OTP ใหม่อีกครั้ง
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen flex items-center justify-center
        bg-gradient-to-br from-[#631a2b] via-[#5b2158] to-[#3b2063]
        p-4
      "
    >
      <div className="
        relative
        w-[92vw] max-w-sm sm:max-w-md
        rounded-3xl
        bg-[#080512]/95
        text-white
        px-8 py-8
        shadow-[0_24px_80px_rgba(0,0,0,0.7)]
        border border-white/10
        overflow-hidden
      ">
        {}
        <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-pink-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-purple-500/25 blur-3xl" />

        <div className="relative z-10">
          <h2 className="text-center text-2xl font-semibold mb-2">
            Email Verify OTP
          </h2>
          <p className="text-center text-sm text-neutral-300 mb-6">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-pink-300">
              {email}
            </span>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            {}
            <div className="flex justify-center gap-2 mb-3">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="
                    w-10 h-12 sm:w-12 sm:h-14
                    text-center text-xl font-semibold
                    rounded-xl
                    bg-[#141223]
                    border border-[#f74c83]/50
                    focus:border-[#ff6aa2]
                    focus:outline-none
                    focus:ring-2 focus:ring-[#ff6aa2]/40
                    transition-all
                  "
                />
              ))}
            </div>

            {}
            <p className="text-sm text-red-400 mb-3 text-center min-h-[1.25rem]">
              {error}
            </p>

            {}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-gradient-to-r from-[#f74c83] to-[#bb2af6]
                hover:opacity-90
                disabled:opacity-60
                text-white font-semibold
                py-2.5
                rounded-xl
                transition-all
                shadow-md
              "
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <p className="mt-3 text-[11px] text-neutral-400 text-center">
              OTP มีอายุ 15 นาที หากหมดอายุ กรุณาขอใหม่อีกครั้ง
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}