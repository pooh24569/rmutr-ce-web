
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Clock,
    Plus,
    X,
    FileText,
    Image,
    File,
} from "lucide-react";
import { homeworkService } from "@/services/homeworkService";
import { toast } from "sonner";
import StudentHeader from "@/components/student/StudentHeader";

const HomeworkDetail = () => {
    const { homeworkId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [homework, setHomework] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [attachments, setAttachments] = useState([]);

    useEffect(() => {
        fetchHomework();
    }, [homeworkId]);

    const fetchHomework = async () => {
        try {
            setLoading(true);
            const response = await homeworkService.getHomeworkById(homeworkId);
            if (response.success) {
                setHomework(response.data);
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const newAttachments = files.map(file => ({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        }));
        setAttachments(prev => [...prev, ...newAttachments]);
        e.target.value = '';
    };

    const removeAttachment = (index) => {
        setAttachments(prev => {
            const updated = [...prev];
            if (updated[index].preview) {
                URL.revokeObjectURL(updated[index].preview);
            }
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (attachments.length === 0) {
            toast.error("กรุณาแนบไฟล์งาน");
            return;
        }

        try {
            setSubmitting(true);
            const files = attachments.map(a => a.file);
            const response = await homeworkService.submitHomework(homeworkId, "", files);
            if (response.success) {
                toast.success(response.message);

                setAttachments([]);
                fetchHomework();
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
        if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
        return <File className="w-5 h-5 text-gray-500" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!homework) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500">ไม่พบการบ้าน</p>
            </div>
        );
    }

    const isOverdue = new Date(homework.dueDate) < new Date();
    const submissionStatus = homework.submission ? "Submitted" : "Missing";

    return (
        <div className="min-h-screen bg-gray-50">
            { }
            <StudentHeader
                breadcrumbs={[
                    { label: "HOMEWORK LIST", link: "/student/homework" },
                    { label: homework.class?.classCode || "" }
                ]}
            />

            { }
            <div className="p-4 sm:p-6">
                { }
                <button
                    onClick={() => navigate("/student/homework")}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                { }
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    { }
                    <div>
                        { }
                        <div className="mb-4">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-800">
                                    {homework.title}
                                </h1>
                                <span className="text-gray-500 text-sm">
                                    • {homework.maxScore} Point
                                </span>
                            </div>
                        </div>

                        { }
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-6">
                            <Clock className="w-4 h-4" />
                            <span>On {formatDate(homework.createdAt)}</span>
                            <span className="mx-1">•</span>
                            <span>Closes {formatDate(homework.dueDate)}</span>
                        </div>

                        { }
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Instructions</h3>
                            <p className="text-gray-600">
                                {homework.description || "None"}
                            </p>
                        </div>
                    </div>

                    { }
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        { }
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                        </div>

                        { }
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-700 font-medium">Your work</h3>
                            <span className={`text-sm font-medium ${submissionStatus === "Submitted" ? "text-green-600" : "text-red-500"
                                }`}>
                                {submissionStatus}
                            </span>
                        </div>

                        { }
                        <p className="text-sm text-gray-500 mb-3">Attachments</p>

                        { }
                        {homework.submission?.attachments?.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs text-green-600 mb-2">ไฟล์ที่ส่งแล้ว:</p>
                                <div className="space-y-2">
                                    {homework.submission.attachments.map((file, idx) => (
                                        <a
                                            key={`submitted-${idx}`}
                                            href={`${import.meta.env.VITE_SERVER_URL || "http://localhost:7001"}${file.fileUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-green-600" />
                                                <p className="text-sm font-medium text-green-700 truncate max-w-[200px]">
                                                    {file.fileName || file.originalName || 'ไฟล์'}
                                                </p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        { }
                        {homework.submission?.status === "graded" && (
                            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-blue-700">คะแนน</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {homework.submission.score} / {homework.maxScore}
                                    </p>
                                </div>
                                {homework.submission.feedback && (
                                    <div className="mt-3 pt-3 border-t border-blue-200">
                                        <p className="text-sm font-medium text-blue-700 mb-1">Feedback จากอาจารย์:</p>
                                        <p className="text-sm text-gray-700">{homework.submission.feedback}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        { }
                        <div className="space-y-2 mb-4">
                            {attachments.map((attachment, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-center gap-3">
                                        {attachment.preview ? (
                                            <img
                                                src={attachment.preview}
                                                alt={attachment.name}
                                                className="w-10 h-10 object-cover rounded"
                                            />
                                        ) : (
                                            getFileIcon(attachment.type)
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                                                {attachment.name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {formatFileSize(attachment.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeAttachment(index)}
                                        className="p-1 hover:bg-gray-200 rounded"
                                    >
                                        <X className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        { }
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors mb-6"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add work</span>
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                        />

                        { }
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || attachments.length === 0}
                            className="w-full py-3 bg-[#8B2332] text-white rounded-full hover:bg-[#7a1f2c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {submitting ? "Submitting..." : "Send"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeworkDetail;
