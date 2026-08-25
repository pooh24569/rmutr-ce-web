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
    AcademicCapIcon,
} from "@heroicons/react/24/outline";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30;
const ALLOWED_ROLES = ["dept_head"];
const PASSWORD_MIN_LENGTH = 6;

const sanitizeInput = (value) => value.replace(/[<>'";&]/g, "").trim();

export default function DeptHeadLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ username: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [attempts, setAttempts] = useState(0);
    const [lockedUntil, setLockedUntil] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef(null);

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

    useEffect(() => () => clearInterval(timerRef.current), []);

    const isLocked = lockedUntil && Date.now() < lockedUntil;

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

            if (!ALLOWED_ROLES.includes(data.user.role)) {
                throw new Error(
                    "สิทธิ์การเข้าถึงไม่เพียงพอ กรุณาใช้ช่องทางที่เหมาะสมกับบัญชีของคุณ"
                );
            }

            setAttempts(0);
            login({ user: data.user, token: data.token });
            navigate("/depthead/dashboard", { replace: true });
        } catch (err) {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= MAX_ATTEMPTS) {
                const lockUntil = Date.now() + LOCKOUT_DURATION * 1000;
                setLockedUntil(lockUntil);
                setError(
                    `เข้าสู่ระบบผิดพลาดเกินกำหนด กรุณารอ ${LOCKOUT_DURATION} วินาที`
                );
            } else {
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
                        "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #064e3b 100%)",
                }}
            >
                <div className="absolute top-20 left-16 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-16 w-80 h-80 bg-teal-400/8 rounded-full blur-3xl" />

                <div className="relative z-10 text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                        <AcademicCapIcon className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-2xl xl:text-4xl font-bold text-white mb-3">
                        ระบบหัวหน้าสาขา
                    </h1>
                    <p className="text-emerald-200/80 text-base xl:text-lg leading-relaxed">
                        Rajamangala University of Technology Rattanakosin
                    </p>
                    <p className="text-emerald-300/60 mt-3 text-sm">
                        Department Head Management System
                    </p>

                    <div className="mt-10 grid grid-cols-3 gap-5">
                        <div className="text-center">
                            <div className="w-11 h-11 mx-auto mb-2 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                                <LockClosedIcon className="w-5 h-5 text-emerald-300" />
                            </div>
                            <p className="text-xs text-emerald-300/60">Encrypted</p>
                        </div>
                        <div className="text-center">
                            <div className="w-11 h-11 mx-auto mb-2 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                                <ShieldCheckIcon className="w-5 h-5 text-emerald-300" />
                            </div>
                            <p className="text-xs text-emerald-300/60">Protected</p>
                        </div>
                        <div className="text-center">
                            <div className="w-11 h-11 mx-auto mb-2 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                                <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-xs text-emerald-300/60">Session Monitored</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side — Login Form */}
            <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
                <div className="w-full max-w-sm">

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            เข้าสู่ระบบหัวหน้าสาขา
                        </h2>
                        <p className="text-slate-500 text-sm">
                            สำหรับหัวหน้าสาขาวิชา
                        </p>
                    </div>

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

                    {attempts > 0 && attempts < MAX_ATTEMPTS && !isLocked && (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                            <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                            <span>
                                เหลือโอกาสอีก {MAX_ATTEMPTS - attempts} ครั้ง ก่อนถูกล็อก
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div>
                            <label htmlFor="depthead-username" className="block text-sm font-medium text-slate-700 mb-2">
                                Username / Email
                            </label>
                            <input
                                type="text"
                                id="depthead-username"
                                name="username"
                                placeholder="depthead@rmutr.ac.th"
                                value={formData.username}
                                onChange={handleChange}
                                disabled={isLocked}
                                required
                                autoComplete="username"
                                maxLength={100}
                                className="w-full px-4 py-3.5 bg-white text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label htmlFor="depthead-password" className="block text-sm font-medium text-slate-700 mb-2">
                                รหัสผ่าน
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="depthead-password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isLocked}
                                    required
                                    autoComplete="current-password"
                                    maxLength={128}
                                    className="w-full px-4 py-3.5 bg-white text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 shadow-sm pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    tabIndex={-1}
                                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || isLocked || !formData.username || !formData.password}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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

                    <div className="mt-8 p-4 bg-slate-100 rounded-xl border border-slate-200">
                        <div className="flex items-start gap-3">
                            <ShieldCheckIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-slate-500 leading-relaxed">
                                <p className="font-medium text-slate-600 mb-1">
                                    ระบบรักษาความปลอดภัย
                                </p>
                                <p>
                                    การเชื่อมต่อถูกเข้ารหัส Session จะหมดอายุใน 24 ชั่วโมง
                                    ห้ามเปิดเผยรหัสผ่านแก่บุคคลอื่นทุกกรณี
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-xs text-slate-400 mt-6">
                        © {new Date().getFullYear()} RMUTR — ระบบหัวหน้าสาขา
                    </p>
                </div>
            </div>
        </div>
    );
}
