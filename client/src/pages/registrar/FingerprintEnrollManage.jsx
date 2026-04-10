/**
 * ===================================================================
 * 🔐 FingerprintEnrollManage — หน้าลงทะเบียนลายนิ้วมือ
 * ===================================================================
 *
 * หน้านี้อยู่ใน Registrar (สำนักงานหัวหน้าภาค)
 * ใช้สำหรับ: ลงทะเบียนลายนิ้วมือนักศึกษาทั้งหมด (รวมศูนย์)
 *
 * Flow:
 * 1. เลือกกลุ่มเรียน (offering) — dropdown
 * 2. ดูรายชื่อนักศึกษา + สถานะลงทะเบียน
 * 3. กดปุ่ม "ลงทะเบียนนิ้ว" ข้างชื่อ → เปิด FingerprintEnrollDialog
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
} from "lucide-react";
import api from "@/lib/api";
import fingerprintService from "@/services/fingerprintService";
import FingerprintEnrollDialog from "@/pages/teacher/components/FingerprintEnrollDialog";

const FingerprintEnrollManage = () => {
  // --- State ---
  const [offerings, setOfferings] = useState([]);
  const [selectedOffering, setSelectedOffering] = useState("");
  const [students, setStudents] = useState([]);
  const [enrolledMap, setEnrolledMap] = useState({}); // { studentId: true }
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Enroll dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Delete state
  const [deletingId, setDeletingId] = useState(null);

  // --- โหลดรายวิชาทั้งหมด ---
  useEffect(() => {
    fetchOfferings();
  }, []);

  const fetchOfferings = async () => {
    try {
      const { data: response } = await api.get("/courses/offerings/managed");
      if (response.success) {
        setOfferings(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching offerings:", error);
      // ลอง endpoint อื่น
      try {
        const { data: response } = await api.get("/courses/offerings");
        if (response.success) {
          setOfferings(response.data || []);
        }
      } catch {
        console.error("Could not fetch offerings");
      }
    }
  };

  // --- โหลดนักศึกษาเมื่อเลือกกลุ่มเรียน ---
  useEffect(() => {
    if (selectedOffering) {
      fetchStudents(selectedOffering);
    } else {
      setStudents([]);
      setEnrolledMap({});
    }
  }, [selectedOffering]);

  const fetchStudents = async (offeringId) => {
    setLoading(true);
    try {
      const { data: response } = await api.get(
        `/courses/offerings/${offeringId}`,
      );
      if (response.success && response.data?.students) {
        setStudents(response.data.students);
        // ตรวจสอบสถานะ fingerprint
        await checkEnrollmentStatus(response.data.students);
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
      const { data: response } = await fingerprintService.getBulkStatus(
        studentIds,
      );
      if (response?.data) {
        const map = {};
        response.data.forEach((s) => {
          if (s.enrolled) map[s.studentId] = true;
        });
        setEnrolledMap(map);
      }
    } catch {
      // SourceAFIS / fingerprint service ยังไม่พร้อม
      console.log("Fingerprint status check skipped");
    }
  };

  // --- Handlers ---
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
      await fingerprintService.delete(studentId);
      setEnrolledMap((prev) => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
    } catch (error) {
      alert(error.message || "ลบไม่สำเร็จ");
    } finally {
      setDeletingId(null);
    }
  };

  // --- Filter ---
  const filteredStudents = students.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.firstName?.toLowerCase().includes(term) ||
      s.lastName?.toLowerCase().includes(term) ||
      s.username?.toLowerCase().includes(term)
    );
  });

  const enrolledCount = Object.keys(enrolledMap).length;
  const totalCount = students.length;

  return (
    <div className="p-6 space-y-6">
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
              สำนักงานหัวหน้าภาค — ลงทะเบียนลายนิ้วมือนักศึกษาแต่ละกลุ่มเรียน
            </p>
          </div>
        </div>
      </div>

      {/* Offering Selector */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          เลือกกลุ่มเรียน
        </label>
        <div className="relative">
          <select
            value={selectedOffering}
            onChange={(e) => setSelectedOffering(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">-- เลือกกลุ่มเรียน --</option>
            {offerings.map((o) => (
              <option key={o._id} value={o._id}>
                {o.course?.courseCode} — {o.course?.courseNameTH || o.course?.courseNameEN} (Sec {o.section})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Stats + Search */}
      {selectedOffering && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Stats */}
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

          {/* Search */}
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
      ) : selectedOffering && filteredStudents.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
                      <p className="text-sm text-gray-500">
                        {student.username}
                      </p>
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
      ) : selectedOffering && !loading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchTerm
              ? "ไม่พบนักศึกษาที่ค้นหา"
              : "ยังไม่มีนักศึกษาในกลุ่มเรียนนี้"}
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
