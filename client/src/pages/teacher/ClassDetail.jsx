// src/pages/teacher/ClassDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Users,
    Clock,
    MapPin,
    Plus,
    Trash2,
    Play,
    Search,
    X,
    CheckCircle,
    Upload,
} from "lucide-react";
import { classService } from "@/services/classService";
import ImportStudentsModal from "./components/ImportStudentsModal";

/**
 * หน้ารายละเอียดวิชา
 * - ดูข้อมูลวิชา
 * - จัดการนักศึกษา (เพิ่ม/ลบ)
 * - เริ่มเช็คชื่อ
 */
const ClassDetail = () => {
    const { classId } = useParams();
    const navigate = useNavigate();

    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [allStudents, setAllStudents] = useState([]);
    const [searchStudent, setSearchStudent] = useState("");
    const [addingStudent, setAddingStudent] = useState(false);

    useEffect(() => {
        fetchClassDetail();
    }, [classId]);

    const fetchClassDetail = async () => {
        try {
            setLoading(true);
            const response = await classService.getClassById(classId);
            if (response.success) {
                setClassData(response.data);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllStudents = async () => {
        try {
            const response = await classService.getAllStudents();
            if (response.success) {
                // กรองนักศึกษาที่ยังไม่ได้อยู่ในวิชา
                const enrolledIds = classData.students.map((s) => s._id);
                const available = response.data.filter(
                    (s) => !enrolledIds.includes(s._id)
                );
                setAllStudents(available);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleAddStudent = async (studentId) => {
        try {
            setAddingStudent(true);
            const response = await classService.addStudent(classId, studentId);
            if (response.success) {
                // Refresh ข้อมูล
                await fetchClassDetail();
                // ลบจาก list ที่แสดง
                setAllStudents(allStudents.filter((s) => s._id !== studentId));
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setAddingStudent(false);
        }
    };

    const handleRemoveStudent = async (studentId) => {
        if (!window.confirm("ต้องการลบนักศึกษาออกจากวิชานี้?")) return;

        try {
            const response = await classService.removeStudent(classId, studentId);
            if (response.success) {
                await fetchClassDetail();
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const openAddStudentModal = () => {
        fetchAllStudents();
        setShowAddStudent(true);
    };

    const getDayLabel = (day) => {
        const days = {
            monday: "จันทร์",
            tuesday: "อังคาร",
            wednesday: "พุธ",
            thursday: "พฤหัส",
            friday: "ศุกร์",
            saturday: "เสาร์",
            sunday: "อาทิตย์",
        };
        return days[day] || day;
    };

    const filteredStudents = allStudents.filter(
        (s) =>
            s.username?.toLowerCase().includes(searchStudent.toLowerCase()) ||
            s.firstName?.toLowerCase().includes(searchStudent.toLowerCase()) ||
            s.lastName?.toLowerCase().includes(searchStudent.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="p-6 text-center text-gray-500">
                ไม่พบข้อมูลวิชา
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/teacher/classes")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{classData.classCode}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">Section {classData.section}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">{classData.className}</h1>
                </div>
                <button
                    onClick={() => navigate(`/teacher/attendance/start/${classId}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/25"
                >
                    <Play className="w-5 h-5" />
                    <span>เริ่มเช็คชื่อ</span>
                </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Students Count */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">นักศึกษา</p>
                            <p className="text-xl font-bold text-gray-800">
                                {classData.students?.length || 0} คน
                            </p>
                        </div>
                    </div>
                </div>

                {/* Schedule */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">ตารางเรียน</p>
                            <p className="text-sm font-medium text-gray-800">
                                {classData.schedule?.length > 0
                                    ? `${getDayLabel(classData.schedule[0].day)} ${classData.schedule[0].startTime}-${classData.schedule[0].endTime}`
                                    : "-"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Room */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">ห้องเรียน</p>
                            <p className="text-xl font-bold text-gray-800">
                                {classData.schedule?.[0]?.room || "-"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Students List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">รายชื่อนักศึกษา</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Import CSV</span>
                        </button>
                        <button
                            onClick={openAddStudentModal}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>เพิ่มนักศึกษา</span>
                        </button>
                    </div>
                </div>

                {classData.students?.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>ยังไม่มีนักศึกษาในวิชานี้</p>
                        <button
                            onClick={openAddStudentModal}
                            className="mt-2 text-blue-600 hover:underline"
                        >
                            เพิ่มนักศึกษา
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {classData.students.map((student, index) => (
                            <div
                                key={student._id}
                                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="w-8 text-center text-sm text-gray-400">
                                        {index + 1}
                                    </span>
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {student.firstName?.charAt(0) || student.username?.charAt(0) || "?"}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {student.firstName} {student.lastName}
                                        </p>
                                        <p className="text-sm text-gray-500">{student.username}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveStudent(student._id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Student Modal */}
            {showAddStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowAddStudent(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">เพิ่มนักศึกษา</h3>
                            <button
                                onClick={() => setShowAddStudent(false)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="px-6 py-3 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ค้นหานักศึกษา..."
                                    value={searchStudent}
                                    onChange={(e) => setSearchStudent(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto">
                            {filteredStudents.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    {allStudents.length === 0
                                        ? "ไม่มีนักศึกษาที่สามารถเพิ่มได้"
                                        : "ไม่พบนักศึกษา"}
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {filteredStudents.map((student) => (
                                        <div
                                            key={student._id}
                                            className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {student.firstName?.charAt(0) || student.username?.charAt(0) || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {student.firstName} {student.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{student.username}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAddStudent(student._id)}
                                                disabled={addingStudent}
                                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>เพิ่ม</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Import Students Modal */}
            <ImportStudentsModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                classId={classId}
                onSuccess={fetchClassDetail}
            />
        </div>
    );
};

export default ClassDetail;
