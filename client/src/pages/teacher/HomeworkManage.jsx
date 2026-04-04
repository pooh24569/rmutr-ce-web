
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    FileText,
    Clock,
    Users,
    ChevronRight,
    RefreshCw,
    Trash2,
} from "lucide-react";
import { homeworkService } from "@/services/homeworkService";
import api from "@/lib/api";
import { toast } from "sonner";

const HomeworkManage = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [homework, setHomework] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        maxScore: 100,
        dueDate: "",
    });

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchHomework();
        }
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            const { data: response } = await api.get("/courses/offerings/my-teaching");
            if (response.success) {
                setClasses(response.data);
                if (response.data.length > 0) {
                    setSelectedClass(response.data[0]._id);
                }
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHomework = async () => {
        try {
            const { data: response } = await api.get(`/homework/offering/${selectedClass}`);
            if (response.success) {
                setHomework(response.data);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleCreateHomework = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.dueDate) {
            toast.error("กรุณากรอกข้อมูลให้ครบ");
            return;
        }

        try {
            const { data: response } = await api.post("/homework", {
                offeringId: selectedClass,
                ...formData,
            });
            if (response.success) {
                toast.success("สร้างการบ้านสำเร็จ");
                setShowCreateModal(false);
                setFormData({ title: "", description: "", maxScore: 100, dueDate: "" });
                fetchHomework();
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
        }
    };

    const handleDelete = async (homeworkId) => {
        if (!window.confirm("ต้องการลบการบ้านนี้?")) return;

        try {
            const { data: response } = await api.delete(`/homework/${homeworkId}`);
            if (response.success) {
                toast.success("ลบสำเร็จ");
                fetchHomework();
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("เกิดข้อผิดพลาด");
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">จัดการการบ้าน</h1>
                    <p className="text-gray-500">สร้างและจัดการการบ้านสำหรับนักศึกษา</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25"
                >
                    <Plus className="w-5 h-5" />
                    สร้างการบ้าน
                </button>
            </div>

            {}
            <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">เลือกวิชา:</label>
                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                    {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                            {cls.course?.courseCode} - {cls.course?.courseNameTH || cls.course?.courseNameEN}
                        </option>
                    ))}
                </select>
                <button
                    onClick={fetchHomework}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {}
            {homework.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                        ยังไม่มีการบ้าน
                    </h3>
                    <p className="text-gray-500">
                        กดปุ่ม "สร้างการบ้าน" เพื่อเริ่มต้น
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {homework.map((hw) => (
                        <div
                            key={hw._id}
                            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">{hw.title}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            กำหนดส่ง: {formatDate(hw.dueDate)}
                                        </span>
                                        <span>คะแนน: {hw.maxScore}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate(`/teacher/homework/${hw._id}/submissions`)}
                                        className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <Users className="w-4 h-4" />
                                        ดูงานที่ส่ง
                                    </button>
                                    <button
                                        onClick={() => handleDelete(hw._id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">สร้างการบ้านใหม่</h2>

                        <form onSubmit={handleCreateHomework} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    หัวข้อ *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="เช่น แบบฝึกหัดบทที่ 1"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    รายละเอียด
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="คำอธิบายเพิ่มเติม..."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        คะแนนเต็ม
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.maxScore}
                                        onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                                        min="1"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        กำหนดส่ง *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    สร้าง
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeworkManage;
