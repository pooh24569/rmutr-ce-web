/**
 * ===================================================================
 * 🔐 FingerprintEnrollManage — หน้าลงทะเบียนลายนิ้วมือ
 * ===================================================================
 *
 * หน้านี้อยู่ใน Registrar (สำนักงานหัวหน้าภาค)
 * กรองนักศึกษาตาม: คณะ → สาขา → ชั้นปี
 *
 * ตัวอย่าง: ปี 1 / คณะวิศวกรรมศาสตร์ / วิศวกรรมคอมพิวเตอร์
 *
 * ===================================================================
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Fingerprint,
  CheckCircle2,
  Search,
  Users,
  ChevronDown,
  AlertCircle,
  Loader2,
  Trash2,
  Building2,
  GraduationCap,
  Layers,
} from "lucide-react";
import api from "@/lib/api";
import FingerprintEnrollDialog from "@/pages/teacher/components/FingerprintEnrollDialog";

const FingerprintEnrollManage = () => {
  // --- Filter State ---
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // --- Student List ---
  const [students, setStudents] = useState([]);
  const [enrolledMap, setEnrolledMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Enroll dialog ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // === โหลดคณะทั้งหมด ===
  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const { data: response } = await api.get("/academic/faculties");
      if (response.success) {
        setFaculties(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching faculties:", error);
    }
  };

  // === โหลดสาขาเมื่อเลือกคณะ ===
  useEffect(() => {
    if (selectedFaculty) {
      fetchDepartments(selectedFaculty);
    } else {
      setDepartments([]);
      setSelectedDepartment("");
      setStudents([]);
    }
  }, [selectedFaculty]);

  const fetchDepartments = async (facultyId) => {
    try {
      const { data: response } = await api.get(
        `/academic/departments/${facultyId}`,
      );
      if (response.success) {
        setDepartments(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // === โหลดนักศึกษาเมื่อเลือกสาขา (+ ชั้นปี) ===
  useEffect(() => {
    if (selectedDepartment) {
      fetchStudents();
    } else {
      setStudents([]);
      setEnrolledMap({});
    }
  }, [selectedDepartment, selectedYear]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        departmentId: selectedDepartment,
      });
      if (selectedYear) {
        params.append("yearLevel", selectedYear);
      }

      const { data: response } = await api.get(
        `/academic/students/filter?${params}`,
      );

      if (response.success) {
        setStudents(response.data.students || []);
        // ตรวจสอบสถานะ fingerprint
        if (response.data.students?.length > 0) {
          await checkEnrollmentStatus(response.data.students);
        } else {
          setEnrolledMap({});
        }
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async (studentList) => {
    try {
      const studentIds = studentList.map((s) => s._id);
      const { data: response } = await api.post("/fingerprint/status/bulk", {
        studentIds,
      });
      if (response.success) {
        const map = {};
        response.data.students.forEach((s) => {
          if (s.enrolled) map[s.studentId] = true;
        });
        setEnrolledMap(map);
      }
    } catch {
      console.log("Fingerprint status check skipped");
    }
  };

  // === Handlers ===
  const handleEnrollClick = (student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const handleEnrollSuccess = useCallback((studentId) => {
    setEnrolledMap((prev) => ({ ...prev, [studentId]: true }));
  }, []);

  const handleDelete = async (studentId) => {
    if (!window.confirm("ลบลายนิ้วมือของนักศึกษาคนนี้?")) return;
    setDeletingId(studentId);
    try {
      await api.delete(`/fingerprint/${studentId}`);
      setEnrolledMap((prev) => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
    } catch (error) {
      alert(error?.response?.data?.message || "ลบไม่สำเร็จ");
    } finally {
      setDeletingId(null);
    }
  };

  // === Filter ===
  const filteredStudents = students.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.firstName?.toLowerCase().includes(term) ||
      s.lastName?.toLowerCase().includes(term) ||
      s.username?.toLowerCase().includes(term)
    );
  });

  const enrolledCount = students.filter((s) => enrolledMap[s._id]).length;
  const totalCount = students.length;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Fingerprint className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              ลงทะเบียนลายนิ้วมือ
            </h1>
            <p className="text-sm text-gray-500">
              สำนักงานหัวหน้าภาค — เลือกคณะ → สาขา → ชั้นปี
            </p>
          </div>
        </div>
      </div>

      {/* 🔷 3-Level Filter: คณะ → สาขา → ชั้นปี */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-500" />
          กรองนักศึกษา
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* คณะ */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              <Building2 className="w-3.5 h-3.5 inline mr-1" />
              คณะ
            </label>
            <div className="relative">
              <select
                value={selectedFaculty}
                onChange={(e) => {
                  setSelectedFaculty(e.target.value);
                  setSelectedDepartment("");
                  setSelectedYear("");
                }}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">-- เลือกคณะ --</option>
                {faculties.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.nameTH || f.nameEN}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* สาขา */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              <GraduationCap className="w-3.5 h-3.5 inline mr-1" />
              สาขาวิชา
            </label>
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setSelectedYear("");
                }}
                disabled={!selectedFaculty}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">-- เลือกสาขา --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.nameTH || d.nameEN}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* ชั้นปี */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              📚 ชั้นปี
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={!selectedDepartment}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">ทุกชั้นปี</option>
                <option value="1">ชั้นปี 1</option>
                <option value="2">ชั้นปี 2</option>
                <option value="3">ชั้นปี 3</option>
                <option value="4">ชั้นปี 4</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats + Search */}
      {selectedDepartment && students.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">นักศึกษา</p>
                <p className="text-lg font-bold text-gray-800">
                  {totalCount}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-xs text-gray-500">ลงทะเบียนแล้ว</p>
                <p className="text-lg font-bold text-gray-800">
                  {enrolledCount}/{totalCount}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหานักศึกษา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Student List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : selectedDepartment && filteredStudents.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50">
            <p className="text-xs font-medium text-gray-500">
              {selectedYear ? `ชั้นปี ${selectedYear}` : "ทุกชั้นปี"} —{" "}
              {filteredStudents.length} คน
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredStudents.map((student, index) => {
              const isEnrolled = enrolledMap[student._id];
              const isDeleting = deletingId === student._id;

              return (
                <div
                  key={student._id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center text-sm text-gray-400">
                      {index + 1}
                    </span>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {student.firstName?.charAt(0) ||
                        student.username?.charAt(0) ||
                        "?"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {student.firstName} {student.lastName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{student.username}</span>
                        {student.classInfo && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span>
                              ปี {student.classInfo.yearLevel} ห้อง{" "}
                              {student.classInfo.section}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEnrolled ? (
                      <>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-medium text-emerald-600">
                            ลงทะเบียนแล้ว
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(student._id)}
                          disabled={isDeleting}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบลายนิ้วมือ"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEnrollClick(student)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-sm"
                      >
                        <Fingerprint className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          ลงทะเบียนนิ้ว
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : selectedDepartment && !loading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchTerm
              ? "ไม่พบนักศึกษาที่ค้นหา"
              : "ไม่พบนักศึกษาในสาขา/ชั้นปีที่เลือก"}
          </p>
        </div>
      ) : !selectedDepartment ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            เลือก คณะ → สาขา เพื่อดูรายชื่อนักศึกษา
          </p>
        </div>
      ) : null}

      {/* Enroll Dialog */}
      <FingerprintEnrollDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        student={selectedStudent}
        onSuccess={handleEnrollSuccess}
      />
    </div>
  );
};

export default FingerprintEnrollManage;
