import React, { useState, useEffect, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  TrashIcon,
  XMarkIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import * as registrarService from "@/services/registrarService";

export default function EnrollmentManage() {
  // Data
  const [offerings, setOfferings] = useState([]);
  const [selectedOffering, setSelectedOffering] = useState(null);
  const [offeringDetail, setOfferingDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSemester, setFilterSemester] = useState("");

  // Enroll modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollInput, setEnrollInput] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollResult, setEnrollResult] = useState(null);

  // ===== Fetch Offerings =====
  const fetchOfferings = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterYear) params.academicYear = filterYear;
      if (filterSemester) params.semester = filterSemester;
      const res = await registrarService.getCourseOfferings(params);
      if (res.success) setOfferings(res.data);
    } catch (err) {
      console.error("Fetch offerings error:", err);
    } finally {
      setLoading(false);
    }
  }, [filterYear, filterSemester]);

  useEffect(() => {
    fetchOfferings();
  }, [fetchOfferings]);

  // ===== Fetch offering detail =====
  const selectOffering = async (offering) => {
    setSelectedOffering(offering._id);
    setDetailLoading(true);
    setEnrollResult(null);
    try {
      const res = await registrarService.getCourseOfferingById(offering._id);
      if (res.success) setOfferingDetail(res.data);
    } catch (err) {
      console.error("Fetch detail error:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // ===== Filter =====
  const filtered = offerings.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      o.course?.courseCode?.toLowerCase().includes(s) ||
      o.course?.courseNameTH?.toLowerCase().includes(s) ||
      o.instructor?.firstName?.toLowerCase().includes(s) ||
      o.instructor?.lastName?.toLowerCase().includes(s)
    );
  });

  // ===== Enroll Students =====
  const handleEnroll = async () => {
    if (enrolling || !enrollInput.trim()) return;
    setEnrolling(true);
    setEnrollResult(null);

    const studentIds = enrollInput
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await registrarService.enrollStudents(
        selectedOffering,
        studentIds,
      );
      if (res.success) {
        setEnrollResult(res.data);
        setEnrollInput("");
        // Refresh detail
        const detail = await registrarService.getCourseOfferingById(
          selectedOffering,
        );
        if (detail.success) setOfferingDetail(detail.data);
        fetchOfferings();
      }
    } catch (err) {
      setEnrollResult({
        error: err.response?.data?.message || "เกิดข้อผิดพลาด",
      });
    } finally {
      setEnrolling(false);
    }
  };

  // ===== Remove Student =====
  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("ต้องการลบนักศึกษาออกจากกลุ่มเรียนนี้?")) return;
    try {
      await registrarService.removeStudentFromOffering(
        selectedOffering,
        studentId,
      );
      const detail = await registrarService.getCourseOfferingById(
        selectedOffering,
      );
      if (detail.success) setOfferingDetail(detail.data);
      fetchOfferings();
    } catch (err) {
      console.error("Remove student error:", err);
    }
  };

  // ===== Render =====
  return (
    <div className="p-6 h-full">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Left Panel — Offering List */}
        <div className="w-full lg:w-96 flex-shrink-0 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              ลงทะเบียนนักศึกษา
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              เลือกกลุ่มเรียน แล้วจัดการนักศึกษา
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหารายวิชา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ปี"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all"
            >
              <option value="">ทุกภาคเรียน</option>
              <option value="1">ภาคเรียนที่ 1</option>
              <option value="2">ภาคเรียนที่ 2</option>
              <option value="summer">ภาคฤดูร้อน</option>
            </select>
          </div>

          {/* Offering List */}
          <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <AcademicCapIcon className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">ไม่พบกลุ่มเรียน</p>
              </div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o._id}
                  onClick={() => selectOffering(o)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedOffering === o._id
                      ? "bg-blue-50 border-blue-200 shadow-sm"
                      : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p
                        className={`text-xs font-medium ${selectedOffering === o._id ? "text-blue-600" : "text-slate-400"}`}
                      >
                        {o.course?.courseCode} • Sec {o.section}
                      </p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">
                        {o.course?.courseNameTH || "—"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {o.instructor
                          ? `${o.instructor.firstName} ${o.instructor.lastName}`
                          : "—"}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        (o.students?.length || 0) >= o.maxStudents
                          ? "bg-red-50 text-red-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {o.students?.length || 0}/{o.maxStudents}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel — Student List & Enrollment */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {!selectedOffering ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
              <UserGroupIcon className="w-16 h-16 mb-3" />
              <p className="text-lg font-medium">เลือกกลุ่มเรียน</p>
              <p className="text-sm">
                เลือกกลุ่มเรียนทางซ้ายเพื่อจัดการนักศึกษา
              </p>
            </div>
          ) : detailLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : offeringDetail ? (
            <div className="flex flex-col h-full">
              {/* Detail Header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      {offeringDetail.course?.courseCode} —{" "}
                      {offeringDetail.course?.courseNameTH}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Section {offeringDetail.section} •{" "}
                      {offeringDetail.academicYear}/
                      {offeringDetail.semester === "summer"
                        ? "ฤดูร้อน"
                        : `เทอม ${offeringDetail.semester}`}{" "}
                      • อ.
                      {offeringDetail.instructor?.firstName}{" "}
                      {offeringDetail.instructor?.lastName}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowEnrollModal(true);
                      setEnrollResult(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    <UserPlusIcon className="w-4 h-4" />
                    เพิ่มนักศึกษา
                  </button>
                </div>
              </div>

              {/* Student List */}
              <div className="flex-1 overflow-y-auto">
                {offeringDetail.students?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 py-16">
                    <UserGroupIcon className="w-12 h-12 mb-2" />
                    <p className="font-medium">ยังไม่มีนักศึกษา</p>
                    <p className="text-sm">กดปุ่ม "เพิ่มนักศึกษา" เพื่อลงทะเบียน</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-6 py-3 font-semibold text-slate-600 w-12">
                          #
                        </th>
                        <th className="text-left px-6 py-3 font-semibold text-slate-600">
                          รหัสนักศึกษา
                        </th>
                        <th className="text-left px-6 py-3 font-semibold text-slate-600">
                          ชื่อ-นามสกุล
                        </th>
                        <th className="text-left px-6 py-3 font-semibold text-slate-600">
                          Email
                        </th>
                        <th className="text-center px-6 py-3 font-semibold text-slate-600 w-20">
                          ลบ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {offeringDetail.students.map((student, idx) => (
                        <tr
                          key={student._id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-3 text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-3">
                            <span className="font-mono font-medium text-slate-700">
                              {student.username}
                            </span>
                          </td>
                          <td className="px-6 py-3 font-medium text-slate-800">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-6 py-3 text-slate-500">
                            {student.email}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <button
                              onClick={() => handleRemoveStudent(student._id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="ลบออก"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer Stats */}
              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-sm text-slate-500 flex items-center justify-between">
                <span>
                  รวม {offeringDetail.students?.length || 0} /{" "}
                  {offeringDetail.maxStudents} คน
                </span>
                <span
                  className={`font-medium ${
                    (offeringDetail.students?.length || 0) >=
                    offeringDetail.maxStudents
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                >
                  ว่าง{" "}
                  {Math.max(
                    0,
                    offeringDetail.maxStudents -
                      (offeringDetail.students?.length || 0),
                  )}{" "}
                  ที่นั่ง
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ===== Enroll Modal ===== */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowEnrollModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                เพิ่มนักศึกษา
              </h2>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  รหัสนักศึกษา (หนึ่งบรรทัดต่อคน หรือคั่นด้วย , )
                </label>
                <textarea
                  value={enrollInput}
                  onChange={(e) => setEnrollInput(e.target.value)}
                  rows={6}
                  placeholder={"6601010001\n6601010002\n6601010003"}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
                />
              </div>

              {/* Result */}
              {enrollResult && (
                <div className="space-y-2">
                  {enrollResult.error ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 rounded-xl text-sm text-red-700">
                      <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                      {enrollResult.error}
                    </div>
                  ) : (
                    <>
                      {enrollResult.summary?.added > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 rounded-xl text-sm text-emerald-700">
                          <CheckCircleIcon className="w-4 h-4" />
                          เพิ่มสำเร็จ {enrollResult.summary.added} คน
                        </div>
                      )}
                      {enrollResult.summary?.alreadyExists > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 rounded-xl text-sm text-amber-700">
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          มีอยู่แล้ว {enrollResult.summary.alreadyExists} คน
                        </div>
                      )}
                      {enrollResult.summary?.notFound > 0 && (
                        <div className="px-4 py-2.5 bg-red-50 rounded-xl text-sm text-red-700">
                          <div className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            ไม่พบ {enrollResult.summary.notFound} คน
                          </div>
                          <p className="text-xs mt-1 font-mono">
                            {enrollResult.notFound?.join(", ")}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  ปิด
                </button>
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || !enrollInput.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
                >
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  {enrolling ? "กำลังเพิ่ม..." : "เพิ่มนักศึกษา"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
