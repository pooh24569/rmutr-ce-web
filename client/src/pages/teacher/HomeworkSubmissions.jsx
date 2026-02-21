
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    User,
    FileText,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import { homeworkService } from "@/services/homeworkService";
import { toast } from "sonner";

const HomeworkSubmissions = () => {
    const { homeworkId } = useParams();
    const navigate = useNavigate();

    const [homework, setHomework] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [grading, setGrading] = useState({ score: "", feedback: "" });
    const [savingGrade, setSavingGrade] = useState(false);

    useEffect(() => {
        fetchData();
    }, [homeworkId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [hwResponse, subResponse] = await Promise.all([
                homeworkService.getHomeworkById(homeworkId),
                homeworkService.getSubmissions(homeworkId),
            ]);

            if (hwResponse.success) setHomework(hwResponse.data);
            if (subResponse.success) setSubmissions(subResponse.data);
        } catch (error) {
            console.error("Error:", error);
            toast.error("ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setLoading(false);
        }
    };

    const handleGrade = async () => {
        if (!grading.score || isNaN(grading.score)) {
            toast.error("กรุณากรอกคะแนน");
            return;
        }

        try {
            setSavingGrade(true);
            const response = await homeworkService.gradeSubmission(
                selectedSubmission._id,
                parseFloat(grading.score),
                grading.feedback
            );
            if (response.success) {
                toast.success("ให้คะแนนสำเร็จ");
                setSelectedSubmission(null);
                setGrading({ score: "", feedback: "" });
                fetchData();
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("เกิดข้อผิดพลาด");
        } finally {
            setSavingGrade(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
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
            { }
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/teacher/homework")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <span className="text-sm text-blue-600 font-medium">
                        {homework?.class?.classCode}
                    </span>
                    <h1 className="text-2xl font-bold text-gray-800">{homework?.title}</h1>
                </div>
                <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            { }
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                    <p className="text-2xl font-bold text-gray-800">{submissions.length}</p>
                    <p className="text-sm text-gray-500">ส่งแล้ว</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                    <p className="text-2xl font-bold text-green-600">
                        {submissions.filter((s) => s.status === "graded").length}
                    </p>
                    <p className="text-sm text-gray-500">ตรวจแล้ว</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                        {submissions.filter((s) => s.status === "submitted").length}
                    </p>
                    <p className="text-sm text-gray-500">รอตรวจ</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                    <p className="text-2xl font-bold text-red-600">
                        {submissions.filter((s) => s.isLate).length}
                    </p>
                    <p className="text-sm text-gray-500">ส่งช้า</p>
                </div>
            </div>

            { }
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-800">รายชื่อที่ส่ง</h2>
                </div>

                {submissions.length === 0 ? (
                    <div className="p-8 text-center">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500">ยังไม่มีนักศึกษาส่งงาน</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {submissions.map((sub) => (
                            <div key={sub._id} className="px-6 py-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {sub.student?.firstName?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {sub.student?.firstName} {sub.student?.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500">{sub.student?.username}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">
                                                ส่งเมื่อ {formatDate(sub.submittedAt)}
                                            </p>
                                            {sub.isLate && (
                                                <span className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    ส่งช้า
                                                </span>
                                            )}
                                        </div>

                                        {sub.status === "graded" ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                {sub.score} คะแนน
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setSelectedSubmission(sub);
                                                    setGrading({ score: "", feedback: "" });
                                                }}
                                                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                                            >
                                                ให้คะแนน
                                            </button>
                                        )}
                                    </div>
                                </div>

                                { }
                                {sub.content && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                                        {sub.content.substring(0, 200)}
                                        {sub.content.length > 200 && "..."}
                                    </div>
                                )}

                                { }
                                {sub.attachments && sub.attachments.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-500 mb-2">ไฟล์แนบ ({sub.attachments.length} ไฟล์)</p>
                                        <div className="flex flex-wrap gap-2">
                                            {sub.attachments.map((file, idx) => {

                                                const displayName = file.fileName || file.originalName || file.filename || `ไฟล์ ${idx + 1}`;
                                                const fileUrl = file.fileUrl || `/uploads/homework/${file.filename}`;

                                                return (
                                                    <a
                                                        key={idx}
                                                        href={`${import.meta.env.VITE_SERVER_URL || "http://localhost:7001"}${fileUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        <span className="max-w-[150px] truncate">{displayName}</span>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            { }
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">ให้คะแนน</h2>

                        <div className="mb-4">
                            <p className="text-sm text-gray-500">นักศึกษา</p>
                            <p className="font-medium">
                                {selectedSubmission.student?.firstName}{" "}
                                {selectedSubmission.student?.lastName}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    คะแนน (เต็ม {homework?.maxScore})
                                </label>
                                <input
                                    type="number"
                                    value={grading.score}
                                    onChange={(e) => setGrading({ ...grading, score: e.target.value })}
                                    max={homework?.maxScore}
                                    min="0"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Feedback (ไม่บังคับ)
                                </label>
                                <textarea
                                    value={grading.feedback}
                                    onChange={(e) => setGrading({ ...grading, feedback: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleGrade}
                                disabled={savingGrade}
                                className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                            >
                                {savingGrade ? "กำลังบันทึก..." : "บันทึก"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeworkSubmissions;
