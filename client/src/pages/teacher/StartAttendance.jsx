
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Clock,
    MapPin,
    Users,
    Play,
    Square,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import api from "@/lib/api";
import { sessionService } from "@/services/sessionService";
import FingerprintPanel from "./components/FingerprintPanel";

const StartAttendance = () => {
    const { classId: offeringId } = useParams();
    const navigate = useNavigate();

    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSession, setActiveSession] = useState(null);
    const [attendances, setAttendances] = useState([]);
    const [starting, setStarting] = useState(false);
    const [closing, setClosing] = useState(false);

    const [formData, setFormData] = useState({
        startTime: "",
        lateAfterMinutes: 15,
        closeAfterMinutes: 30,
        classEndTime: "",
        room: "",
    });

    useEffect(() => {
        fetchOfferingDetail();
        checkActiveSession();
    }, [offeringId]);

    const fetchOfferingDetail = async () => {
        try {
            const { data: response } = await api.get(`/courses/offerings/${offeringId}`);
            if (response.success) {
                setClassData(response.data);

                if (response.data.schedule?.length > 0) {
                    const sch = response.data.schedule[0];
                    setFormData((prev) => ({
                        ...prev,
                        startTime: sch.startTime || "",
                        classEndTime: sch.endTime || "",
                        room: sch.room || "",
                    }));
                }
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const checkActiveSession = async () => {
        try {
            const response = await sessionService.getOpenSessions();
            if (response.success && response.data.length > 0) {

                const session = response.data.find(
                    (s) => (s.courseOffering?._id || s.courseOffering) === offeringId
                );
                if (session) {
                    setActiveSession(session);
                    fetchSessionDetail(session._id);
                }
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const fetchSessionDetail = async (sessionId) => {
        try {
            const response = await sessionService.getSessionDetail(sessionId);
            if (response.success) {
                setActiveSession(response.data.session);
                setAttendances(response.data.attendances);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleStartSession = async () => {
        try {
            setStarting(true);
            const response = await sessionService.startSession({
                offeringId,
                startTime: formData.startTime,
                lateAfterMinutes: parseInt(formData.lateAfterMinutes),
                closeAfterMinutes: parseInt(formData.closeAfterMinutes),
                classEndTime: formData.classEndTime,
                room: formData.room,
            });

            if (response.success) {
                setActiveSession(response.data);
                fetchSessionDetail(response.data._id);
            }
        } catch (error) {
            console.error("Error:", error);
            alert(error.message || "เกิดข้อผิดพลาด");
        } finally {
            setStarting(false);
        }
    };

    const handleCloseSession = async () => {
        if (!window.confirm("ต้องการปิดการเช็คชื่อ?")) return;

        try {
            setClosing(true);
            const response = await sessionService.closeSession(activeSession._id);
            if (response.success) {
                alert("ปิดการเช็คชื่อสำเร็จ!");
                navigate(`/teacher/classes/${offeringId}`);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setClosing(false);
        }
    };

    const refreshAttendances = () => {
        if (activeSession) {
            fetchSessionDetail(activeSession._id);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PRESENT":
                return "text-green-600 bg-green-50";
            case "LATE":
                return "text-orange-600 bg-orange-50";
            case "ABSENT":
                return "text-red-600 bg-red-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "PRESENT":
                return "มา";
            case "LATE":
                return "สาย";
            case "ABSENT":
                return "ขาด";
            default:
                return status;
        }
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
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(`/teacher/classes/${offeringId}`)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-800">เช็คชื่อ</h1>
                    <p className="text-gray-500">
                        {classData?.course?.courseCode} - {classData?.course?.courseNameTH || classData?.course?.courseNameEN}
                    </p>
                </div>
            </div>

            {}
            {!activeSession ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        ตั้งค่าการเช็คชื่อ
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                เวลาเริ่มเรียน
                            </label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) =>
                                    setFormData({ ...formData, startTime: e.target.value })
                                }
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        {}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                สายหลังกี่นาที
                            </label>
                            <select
                                value={formData.lateAfterMinutes}
                                onChange={(e) =>
                                    setFormData({ ...formData, lateAfterMinutes: e.target.value })
                                }
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="10">10 นาที</option>
                                <option value="15">15 นาที</option>
                                <option value="20">20 นาที</option>
                                <option value="30">30 นาที</option>
                            </select>
                        </div>

                        {}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ปิดรับเช็คชื่อหลังกี่นาที
                            </label>
                            <select
                                value={formData.closeAfterMinutes}
                                onChange={(e) =>
                                    setFormData({ ...formData, closeAfterMinutes: e.target.value })
                                }
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="30">30 นาที</option>
                                <option value="45">45 นาที</option>
                                <option value="60">60 นาที</option>
                            </select>
                        </div>

                        {}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ห้องเรียน
                            </label>
                            <input
                                type="text"
                                value={formData.room}
                                onChange={(e) =>
                                    setFormData({ ...formData, room: e.target.value })
                                }
                                placeholder="เช่น A101"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {}
                    <button
                        onClick={handleStartSession}
                        disabled={starting || !formData.startTime || !formData.room}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Play className="w-5 h-5" />
                        <span>{starting ? "กำลังเปิด..." : "เปิดเช็คชื่อ"}</span>
                    </button>
                </div>
            ) : (

                <>
                    {}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                                <span className="font-medium">กำลังเช็คชื่อ</span>
                            </div>
                            <button
                                onClick={refreshAttendances}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-white/70 text-sm">เริ่ม</p>
                                <p className="text-2xl font-bold">{activeSession.startTime}</p>
                            </div>
                            <div>
                                <p className="text-white/70 text-sm">สาย</p>
                                <p className="text-2xl font-bold">{activeSession.lateTime}</p>
                            </div>
                            <div>
                                <p className="text-white/70 text-sm">ปิด</p>
                                <p className="text-2xl font-bold">{activeSession.endTime}</p>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                            <p className="text-2xl font-bold text-gray-800">
                                {activeSession.summary?.present || 0}
                            </p>
                            <p className="text-sm text-gray-500">มา</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                            <p className="text-2xl font-bold text-gray-800">
                                {activeSession.summary?.late || 0}
                            </p>
                            <p className="text-sm text-gray-500">สาย</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                            <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                            <p className="text-2xl font-bold text-gray-800">
                                {activeSession.summary?.absent || 0}
                            </p>
                            <p className="text-sm text-gray-500">ขาด</p>
                        </div>
                    </div>

                    {/* 🔷 Fingerprint Scanner Panel */}
                    <FingerprintPanel
                        sessionId={activeSession._id}
                        onCheckInSuccess={refreshAttendances}
                    />

                    {/* รายชื่อนักศึกษา */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800">
                                รายชื่อนักศึกษา ({attendances.length} คน)
                            </h2>
                        </div>

                        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                            {attendances.map((att) => (
                                <div
                                    key={att._id}
                                    className="flex items-center justify-between px-6 py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {att.student?.firstName?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {att.student?.firstName} {att.student?.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {att.student?.username}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {att.checkInTime && (
                                            <span className="text-sm text-gray-500">
                                                {new Date(att.checkInTime).toLocaleTimeString("th-TH", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        )}
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                                att.status
                                            )}`}
                                        >
                                            {getStatusLabel(att.status)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {}
                    <button
                        onClick={handleCloseSession}
                        disabled={closing}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50"
                    >
                        <Square className="w-5 h-5" />
                        <span>{closing ? "กำลังปิด..." : "ปิดการเช็คชื่อ"}</span>
                    </button>
                </>
            )}
        </div>
    );
};

export default StartAttendance;
