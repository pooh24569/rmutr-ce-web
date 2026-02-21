import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Users, ArrowLeft, CreditCard, User } from "lucide-react";
import { toast } from "sonner";
import parentService from "@/services/parentService";
import DatePicker from "@/components/ui/DatePicker";

const ParentLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        studentId: "",
        nationalId: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await parentService.login(formData);
            if (response.success) {
                localStorage.setItem("parentToken", response.token);
                localStorage.setItem("parentData", JSON.stringify(response.data));
                toast.success("เข้าสู่ระบบสำเร็จ");
                navigate("/parent");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
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
                        <p className="text-gray-500 mt-2">
                            กรอกข้อมูลผู้ปกครองเพื่อเข้าสู่ระบบ
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Student ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                รหัสนักศึกษา (บุตร/หลาน)
                            </label>
                            <input
                                type="text"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleChange}
                                placeholder="เช่น 6512345678901"
                                required
                                maxLength={13}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            />
                        </div>

                        {/* Parent National ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                เลขบัตรประชาชนผู้ปกครอง
                            </label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="nationalId"
                                    value={formData.nationalId}
                                    onChange={handleChange}
                                    placeholder="เลขบัตรประชาชน 13 หลัก"
                                    required
                                    maxLength={13}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Parent Name */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ชื่อผู้ปกครอง
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="ชื่อ"
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    นามสกุลผู้ปกครอง
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="นามสกุล"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Parent Date of Birth */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                วันเดือนปีเกิดผู้ปกครอง
                            </label>
                            <DatePicker
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                name="dateOfBirth"
                                placeholder="เลือกวันเกิด"
                                theme="green"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
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
                            <strong>หมายเหตุ:</strong> กรุณากรอกข้อมูลให้ตรงกับข้อมูล
                            ที่นักศึกษาลงทะเบียนไว้ในระบบ
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentLogin;

