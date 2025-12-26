// frontend/src/pages/student/ClassHomework.jsx
// หน้าแสดงการบ้านของวิชาที่เลือก
import React, { useState, useEffect } from "react";
import {
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    ArrowLeft,
    RefreshCw,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { homeworkService } from "@/services/homeworkService";
import StudentHeader from "@/components/student/StudentHeader";

const ClassHomework = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [homework, setHomework] = useState([]);
    const [classInfo, setClassInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHomework();
    }, [classId]);

    const fetchHomework = async () => {
        try {
            setLoading(true);
            const response = await homeworkService.getMyHomework();
            if (response.success) {
                // กรองเฉพาะวิชานี้
                const filtered = response.data.filter(
                    (hw) => hw.class?._id === classId
                );
                setHomework(filtered);
                if (filtered.length > 0) {
                    setClassInfo({
                        classCode: filtered[0].class?.classCode,
                        className: filtered[0].class?.className,
                    });
                }
            }
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (hw) => {
        if (hw.submitted) {
            if (hw.submission?.status === "graded") {
                return (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        ตรวจแล้ว ({hw.submission.score} คะแนน)
                    </span>
                );
            }
            return (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    ส่งแล้ว
                </span>
            );
        }

        const isOverdue = new Date(hw.dueDate) < new Date();
        if (isOverdue) {
            return (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    <AlertCircle className="w-4 h-4" />
                    เลยกำหนดส่ง
                </span>
            );
        }

        return (
            <span className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                <Clock className="w-4 h-4" />
                รอส่ง
            </span>
        );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("th-TH", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col h-full">
                <StudentHeader title="HOMEWORK" />
                <div className="flex-1 flex items-center justify-center bg-gray-100">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <StudentHeader title="HOMEWORK" />

            <section className="flex-1 px-6 py-6 bg-gray-100 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate("/student/homework")}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-800">
                            {classInfo?.classCode}
                        </h2>
                        <p className="text-sm text-gray-500">{classInfo?.className}</p>
                    </div>
                    <button
                        onClick={fetchHomework}
                        className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>

                {/* Homework List */}
                {homework.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                            ไม่มีการบ้าน
                        </h3>
                        <p className="text-gray-500">
                            วิชานี้ยังไม่มีการบ้านที่สั่ง
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {homework.map((hw) => (
                            <div
                                key={hw._id}
                                onClick={() => navigate(`/student/homework/${hw._id}`)}
                                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        {/* หัวข้อ */}
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {hw.title}
                                        </h3>

                                        {/* รายละเอียด */}
                                        {hw.description && (
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                {hw.description}
                                            </p>
                                        )}

                                        {/* Info */}
                                        <div className="flex items-center gap-4 mt-3">
                                            <span className="flex items-center gap-1 text-sm text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                กำหนดส่ง: {formatDate(hw.dueDate)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                คะแนนเต็ม: {hw.maxScore}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        {getStatusBadge(hw)}
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default ClassHomework;
