import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function AdminLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:7001/api"}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            // Check if user is admin or superadmin
            if (!["admin", "superadmin", "central_registrar", "faculty_registrar", "dept_head"].includes(data.user.role)) {
                throw new Error("Access denied. Admin privileges required.");
            }

            login({ user: data.user, token: data.token });
            navigate("/admin/dashboard", { replace: true });
        } catch (err) {
            setError(err.message || "An error occurred during login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Side - Branding & Welcome */}
            <div
                className="w-1/2 min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #25343F 0%, #1a252d 50%, #0f171c 100%)' }}
            >
                {/* Decorative circles */}
                <div className="absolute top-20 left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>

                {/* Content */}
                <div className="relative z-10 text-center max-w-md">
                    {/* Logo placeholder */}
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/20">
                        <span className="text-2xl font-bold text-white">R</span>
                    </div>

                    <h1 className="text-2xl xl:text-4xl font-bold text-white mb-3 xl:mb-4">
                        Welcome to <span className="text-amber-400">RMUTR</span>
                    </h1>
                    <p className="text-slate-400 text-base xl:text-lg leading-relaxed">
                        Rajamangala University of Technology Rattanakosin
                    </p>
                    <p className="text-slate-500 mt-3 xl:mt-4 text-sm xl:text-base">
                        Admin Management System
                    </p>

                    {/* Feature highlights */}
                    <div className="mt-8 xl:mt-12 grid grid-cols-3 gap-4 xl:gap-6">
                        <div className="text-center">
                            <div className="w-10 h-10 xl:w-12 xl:h-12 mx-auto mb-2 xl:mb-3 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                                <svg className="w-5 h-5 xl:w-6 xl:h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                            </div>
                            <p className="text-xs text-slate-400">Secure</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 xl:w-12 xl:h-12 mx-auto mb-2 xl:mb-3 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                                <svg className="w-5 h-5 xl:w-6 xl:h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                </svg>
                            </div>
                            <p className="text-xs text-slate-400">Fast</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 xl:w-12 xl:h-12 mx-auto mb-2 xl:mb-3 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                                <svg className="w-5 h-5 xl:w-6 xl:h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                </svg>
                            </div>
                            <p className="text-xs text-slate-400">Reliable</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div
                className="w-1/2 min-h-screen flex flex-col items-center justify-center p-6"
                style={{ background: '#F5E7C6' }}
            >
                <div className="w-full max-w-sm">

                    {/* Form Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            Sign In
                        </h2>
                        <p className="text-slate-600 text-sm">
                            Enter your credentials to access the admin panel
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="text"
                                id="email"
                                name="email"
                                placeholder="admin@rmutr.ac.th"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3.5 bg-white text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm"
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3.5 bg-white text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="text-right">
                            <a
                                href="#"
                                className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                            >
                                Forgot password?
                            </a>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading || !formData.email || !formData.password}
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
