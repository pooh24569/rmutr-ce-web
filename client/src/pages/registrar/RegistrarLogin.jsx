import React, { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import {
    EyeIcon,
    EyeSlashIcon,
    ShieldCheckIcon,
    LockClosedIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// === Security Constants ===
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30; // seconds
const ALLOWED_ROLES = ["central_registrar", "faculty_registrar"];
const PASSWORD_MIN_LENGTH = 6;

// === Input Sanitizer ===
const sanitizeInput = (value) =>
    value.replace(/[<>'";&]/g, "").trim();

export default function RegistrarLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Security state
    const [attempts, setAttempts] = useState(0);
    const [lockedUntil, setLockedUntil] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef(null);

    // Countdown timer for lockout
    useEffect(() => {
        if (lockedUntil) {
            const tick = () => {
                const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
                if (remaining <= 0) {
                    setLockedUntil(null);
                    setCountdown(0);
                    setAttempts(0);
                    setError("");
                    clearInterval(timerRef.current);
                } else {
                    setCountdown(remaining);
                }
            };
            tick();
            timerRef.current = setInterval(tick, 1000);
            return () => clearInterval(timerRef.current);
        }
    }, [lockedUntil]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    const isLocked = lockedUntil && Date.now() < lockedUntil;

    // Client-side validation
    const validate = useCallback(() => {
        if (!formData.username.trim()) return "กรุณากรอก Username หรือ Email";
        if (!formData.password) return "กรุณากรอกรหัสผ่าน";
        if (formData.password.length < PASSWORD_MIN_LENGTH)
            return `รหัสผ่านต้องมีอย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร`;
        return null;
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "password" ? value : sanitizeInput(value),
        }));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading || isLocked) return;

        // Client validation
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");
        setLoading(true);

        try {
            const { data } = await api.post("/auth/login", {
                username: formData.username.trim(),
                password: formData.password,
            });

            // Role validation — reject non-registrar roles
            if (!ALLOWED_ROLES.includes(data.user.role)) {
                throw new Error(
                    "สิทธิ์การเข้าถึงไม่เพียงพอ กรุณาใช้ช่องทางที่เหมาะสมกับบัญชีของคุณ"
                );
            }

            // Success — reset attempts
            setAttempts(0);
            login({ user: data.user, token: data.token });
            navigate("/registrar/dashboard", { replace: true });
        } catch (err) {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            // Lockout after MAX_ATTEMPTS
            if (newAttempts >= MAX_ATTEMPTS) {
                const lockUntil = Date.now() + LOCKOUT_DURATION * 1000;
                setLockedUntil(lockUntil);
                setError(
                    `เข้าสู่ระบบผิดพลาดเกินกำหนด กรุณารอ ${LOCKOUT_DURATION} วินาที`
                );
            } else {
                // Generic error — don't reveal if username/password is wrong
                setError(
                    err.response?.data?.message ||
                    "ข้อมูลเข้าสู่ระบบไม่ถูกต้อง กรุณาลองอีกครั้ง"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row">
            {/* Left Side — Branding */}
            <div
                className="hidden lg:flex w-1/2 min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden"
                style={{
                    background:
                        "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
                }}
            >
                {/* Decorative elements */}
                <div className="absolute top-20 left-16 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-16 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl" />

                <div className="relative z-10 text-center max-w-md">
                    {/* Logo */}
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                        <ShieldCheckIcon className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-2xl xl:text-4xl font-bold text-white mb-3">
                        สำนักส่งเสริมวิชาการ
                        <span className="block text-blue-400">
                            และงานทะเบียน
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base xl:text-lg leading-relaxed">
                        Rajamangala University of Technology Rattanakosin
                    </p>
                    <p className="text-slate-500 mt-3 text-sm">
                        Registrar Management System
                    </p>

                    {/* Security badges */}
                    <div className="mt-10 grid grid-cols-3 gap-5">
                        <div className="text-center">
                            <div className="w-11 h-11 mx-auto mb-2 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                                <LockClosedIcon className="w-5 h-5 text-blue-400" />
                            </div>
                            <p className="text-xs text-slate-400">Encrypted</p>
                        </div>
                        <div className="text-center">
                            <div className="w-11 h-11 mx-auto mb-2 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                                <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
                            </div>
                            <p className="text-xs text-slate-400">Protected</p>
                        </div>
                        <div className="text-center">
                            <div className="w-11 h-11 mx-auto mb-2 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                                <svg
                                    className="w-5 h-5 text-blue-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <p className="text-xs text-slate-400">
                                Session Monitored
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side — Login Form */}
            <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
                <div className="w-full max-w-sm">


                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            เข้าสู่ระบบงานทะเบียน
                        </h2>
                        <p className="text-slate-500 text-sm">
                            สำหรับเจ้าหน้าที่ทะเบียนกลางและทะเบียนคณะ
                        </p>
                    </div>

                    {/* Error / Lockout Message */}
                    {error && (
                        <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 border-l-4 ${isLocked
                                ? "bg-orange-50 border-orange-500 text-orange-700"
                                : "bg-red-50 border-red-500 text-red-700"
                                }`}
                            role="alert"
                        >
                            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                            <div className="text-sm">
                                <p>{error}</p>
                                {isLocked && (
                                    <p className="font-semibold mt-1">
                                        เวลาที่เหลือ: {countdown} วินาที
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Remaining Attempts Warning */}
                    {attempts > 0 && attempts < MAX_ATTEMPTS && !isLocked && (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                            <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                            <span>
                                เหลือโอกาสอีก {MAX_ATTEMPTS - attempts} ครั้ง
                                ก่อนถูกล็อก
                            </span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                        noValidate
                    >
                        {/* Username */}
                        <div>
                            <label
                                htmlFor="registrar-username"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Username / Email
                            </label>
                            <input
                                type="text"
                                id="registrar-username"
                                name="username"
                                placeholder="registrar@rmutr.ac.th"
                                value={formData.username}
                                onChange={handleChange}
                                disabled={isLocked}
                                required
                                autoComplete="username"
                                maxLength={100}
                                className="w-full px-4 py-3.5 bg-white text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="registrar-password"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                รหัสผ่าน
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="registrar-password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isLocked}
                                    required
                                    autoComplete="current-password"
                                    maxLength={128}
                                    className="w-full px-4 py-3.5 bg-white text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    tabIndex={-1}
                                    aria-label={
                                        showPassword
                                            ? "ซ่อนรหัสผ่าน"
                                            : "แสดงรหัสผ่าน"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={
                                loading ||
                                isLocked ||
                                !formData.username ||
                                !formData.password
                            }
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    กำลังตรวจสอบ...
                                </span>
                            ) : isLocked ? (
                                `ถูกล็อก (${countdown}s)`
                            ) : (
                                "เข้าสู่ระบบ"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
