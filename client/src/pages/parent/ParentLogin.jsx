import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Users, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const ParentLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [values, setValues] = useState({
        firstName: "",
        lastName: "",
        studentId: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const onChange = (e) =>
        setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const onSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setError("");
        setLoading(true);

        try {
            const { data } = await api.post("/auth/parent-login", {
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                studentId: values.studentId.trim(),
            });

            login({ user: data.user, token: data.token });
            toast.success("เข้าสู่ระบบสำเร็จ");
            navigate("/parent/dashboard", { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 via-teal-500 to-cyan-600 p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>กลับหน้า Login หลัก</span>
                </Link>

                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            ระบบผู้ปกครอง
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            กรอกชื่อ-นามสกุลผู้ปกครอง และเลขนักศึกษา
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        {error && (
                            <div className="text-red-700 text-sm border border-red-200 bg-red-50 p-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ชื่อผู้ปกครอง
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={values.firstName}
                                onChange={onChange}
                                placeholder="ชื่อผู้ปกครอง"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                นามสกุลผู้ปกครอง
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={values.lastName}
                                onChange={onChange}
                                placeholder="นามสกุลผู้ปกครอง"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            />
                        </div>

                        {/* Student ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                เลขนักศึกษา
                            </label>
                            <input
                                type="text"
                                name="studentId"
                                value={values.studentId}
                                onChange={onChange}
                                placeholder="เลขนักศึกษา 13 หลัก"
                                required
                                maxLength={13}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !values.firstName || !values.lastName || !values.studentId}
                            className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-teal-700 transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    กำลังเข้าสู่ระบบ...
                                </span>
                            ) : (
                                "เข้าสู่ระบบ"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-green-50 rounded-xl">
                        <p className="text-sm text-green-700 text-center">
                            <strong>หมายเหตุ:</strong> ใช้ชื่อ-นามสกุลผู้ปกครองที่นักศึกษากรอกไว้
                            ในหน้าแก้ไขข้อมูลส่วนตัว พร้อมเลขนักศึกษา
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentLogin;
