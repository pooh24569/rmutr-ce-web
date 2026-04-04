
import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { BookOpen, Plus, Minus, Clock, MapPin, User, Search, RefreshCw } from "lucide-react";

const Registration = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [enrollingId, setEnrollingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data: response } = await api.get("/student-registration/available");
            if (response.success) {
                setClasses(response.data);
            }
        } catch (err) {
            console.error("Error fetching classes:", err);
            setError(err.response?.data?.message || "ไม่สามารถดึงข้อมูลวิชาได้");
            toast.error("ไม่สามารถดึงข้อมูลวิชาได้");
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (offeringId) => {
        try {
            setEnrollingId(offeringId);
            const { data: response } = await api.post("/student-registration/enroll", { offeringId });
            if (response.success) {
                toast.success("ลงทะเบียนสำเร็จ!");

                setClasses(
                    classes.map((c) =>
                        c._id === offeringId ? { ...c, isEnrolled: true } : c
                    )
                );
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "ไม่สามารถลงทะเบียนได้");
        } finally {
            setEnrollingId(null);
        }
    };

    const handleDrop = async (offeringId) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ที่จะยกเลิกลงทะเบียนวิชานี้?")) return;

        try {
            setEnrollingId(offeringId);
            const { data: response } = await api.delete(`/student-registration/drop/${offeringId}`);
            if (response.success) {
                toast.success("ยกเลิกลงทะเบียนสำเร็จ");

                setClasses(
                    classes.map((c) =>
                        c._id === offeringId ? { ...c, isEnrolled: false } : c
                    )
                );
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "ไม่สามารถยกเลิกได้");
        } finally {
            setEnrollingId(null);
        }
    };

    const getDayLabel = (day) => {
        const days = {
            mon: "จันทร์", tue: "อังคาร", wed: "พุธ",
            thu: "พฤหัส", fri: "ศุกร์", sat: "เสาร์", sun: "อาทิตย์",
            monday: "จันทร์", tuesday: "อังคาร", wednesday: "พุธ",
            thursday: "พฤหัส", friday: "ศุกร์", saturday: "เสาร์", sunday: "อาทิตย์",
        };
        return days[day] || day;
    };

    const filteredClasses = classes.filter((c) => {
        const code = c.course?.courseCode || "";
        const nameTH = c.course?.courseNameTH || "";
        const nameEN = c.course?.courseNameEN || "";
        return (
            code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            nameTH.toLowerCase().includes(searchTerm.toLowerCase()) ||
            nameEN.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const enrolledCount = classes.filter((c) => c.isEnrolled).length;

    return (
        <div className="flex flex-col h-full bg-white">
            {}
            <header className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-white">ลงทะเบียนวิชา</h1>
                        <p className="text-white/80 text-sm">
                            เลือกวิชาที่ต้องการลงทะเบียน • ลงทะเบียนแล้ว {enrolledCount} วิชา
                        </p>
                    </div>
                    <button
                        onClick={fetchClasses}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </header>

            {}
            <div className="flex-1 p-6 overflow-auto bg-gray-50">
                {}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาวิชาโดยชื่อหรือรหัส..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </div>

                {}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={fetchClasses}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            ลองใหม่
                        </button>
                    </div>
                )}

                {}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500">กำลังโหลดวิชา...</p>
                        </div>
                    </div>
                ) : filteredClasses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <BookOpen className="w-16 h-16 mb-4 text-gray-300" />
                        <p className="text-lg font-medium">ไม่พบวิชาที่เปิดลงทะเบียน</p>
                        <p className="text-sm">ลองค้นหาด้วยคำอื่น หรือติดต่ออาจารย์</p>
                    </div>
                ) : (

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredClasses.map((classItem) => (
                            <div
                                key={classItem._id}
                                className={`bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg ${classItem.isEnrolled
                                        ? "border-green-500 bg-green-50"
                                        : classItem.isFull
                                            ? "border-gray-300 opacity-70"
                                            : "border-gray-200 hover:border-red-300"
                                    }`}
                            >
                                {}
                                <div
                                    className={`p-4 ${classItem.isEnrolled
                                            ? "bg-green-500"
                                            : "bg-gradient-to-r from-red-500 to-orange-500"
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-medium bg-white/20 text-white px-2 py-1 rounded">
                                                {classItem.course?.courseCode}
                                            </span>
                                            <h3 className="text-white font-bold mt-2 text-lg">
                                                {classItem.course?.courseNameTH || classItem.course?.courseNameEN}
                                            </h3>
                                            {classItem.course?.credits && (
                                                <span className="text-xs text-white/80 mt-1">
                                                    {classItem.course.credits} หน่วยกิต
                                                </span>
                                            )}
                                        </div>
                                        {classItem.isEnrolled && (
                                            <span className="text-xs bg-white text-green-600 px-2 py-1 rounded font-medium">
                                                ลงทะเบียนแล้ว
                                            </span>
                                        )}
                                        {classItem.isFull && !classItem.isEnrolled && (
                                            <span className="text-xs bg-white text-red-600 px-2 py-1 rounded font-medium">
                                                เต็มแล้ว
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {}
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User className="w-4 h-4" />
                                        <span>Section {classItem.section}</span>
                                        <span className="text-gray-300">•</span>
                                        <span>{classItem.students?.length || 0}/{classItem.maxStudents} คน</span>
                                    </div>

                                    {classItem.instructor && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User className="w-4 h-4 text-blue-500" />
                                            <span>
                                                อ.{classItem.instructor.firstName}{" "}
                                                {classItem.instructor.lastName}
                                            </span>
                                        </div>
                                    )}

                                    {classItem.schedule?.length > 0 && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span>
                                                {classItem.schedule.map((s, i) => (
                                                    <span key={i}>
                                                        {getDayLabel(s.day)} {s.startTime}-{s.endTime}
                                                        {i < classItem.schedule.length - 1 && ", "}
                                                    </span>
                                                ))}
                                            </span>
                                        </div>
                                    )}

                                    {classItem.schedule?.[0]?.room && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>ห้อง {classItem.schedule[0].room}</span>
                                        </div>
                                    )}

                                    {}
                                    <div className="pt-3 border-t">
                                        {classItem.isEnrolled ? (
                                            <button
                                                onClick={() => handleDrop(classItem._id)}
                                                disabled={enrollingId === classItem._id}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                                            >
                                                {enrollingId === classItem._id ? (
                                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Minus className="w-4 h-4" />
                                                )}
                                                ยกเลิกลงทะเบียน
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEnroll(classItem._id)}
                                                disabled={enrollingId === classItem._id || classItem.isFull}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition disabled:opacity-50"
                                            >
                                                {enrollingId === classItem._id ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Plus className="w-4 h-4" />
                                                )}
                                                {classItem.isFull ? "เต็มแล้ว" : "ลงทะเบียน"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Registration;
