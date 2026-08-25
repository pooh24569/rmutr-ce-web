import React, { useState, useEffect, useCallback } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  UserIcon,
  LockOpenIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import * as registrarService from "@/services/registrarService";

const SEMESTERS = [
  { value: "1", label: "ภาคเรียนที่ 1" },
  { value: "2", label: "ภาคเรียนที่ 2" },
  { value: "summer", label: "ภาคฤดูร้อน" },
];

const EMPTY_FORM = {
  course: "",
  instructor: "",
  academicYear: new Date().getFullYear() + 543 + "",
  semester: "1",
  section: "1",
  maxStudents: 40,
  registrationOpen: false,
};

export default function CourseOfferingManage() {
  // Data
  const [offerings, setOfferings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Instructor search
  const [instructorSearch, setInstructorSearch] = useState("");
  const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);

  // ===== Fetch =====
  const fetchOfferings = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterSemester) params.semester = filterSemester;
      if (filterYear) params.academicYear = filterYear;
      const res = await registrarService.getCourseOfferings(params);
      if (res.success) setOfferings(res.data);
    } catch (err) {
      console.error("Fetch offerings error:", err);
    } finally {
      setLoading(false);
    }
  }, [filterSemester, filterYear]);

  const fetchCourses = async () => {
    try {
      const res = await registrarService.getCourses({ status: "active" });
      if (res.success) setCourses(res.data);
    } catch (err) {
      console.error("Fetch courses error:", err);
    }
  };

  const fetchInstructors = useCallback(async (searchTerm) => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      const res = await registrarService.getInstructors(params);
      if (res.success) setInstructors(res.data);
    } catch (err) {
      console.error("Fetch instructors error:", err);
    }
  }, []);

  useEffect(() => {
    fetchOfferings();
    fetchCourses();
    fetchInstructors();
  }, [fetchOfferings, fetchInstructors]);

  // Debounce instructor search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showInstructorDropdown) {
        fetchInstructors(instructorSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [instructorSearch, showInstructorDropdown, fetchInstructors]);

  // ===== Filter offerings by search =====
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

  // ===== Handlers =====
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setInstructorSearch("");
    setError("");
    setShowModal(true);
  };

  const openEdit = (offering) => {
    setEditingId(offering._id);
    setForm({
      course: offering.course?._id || "",
      instructor: offering.instructor?._id || "",
      academicYear: offering.academicYear,
      semester: offering.semester,
      section: offering.section,
      maxStudents: offering.maxStudents,
      registrationOpen: offering.registrationOpen,
    });
    setInstructorSearch(
      offering.instructor
        ? `${offering.instructor.firstName} ${offering.instructor.lastName}`
        : "",
    );
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!form.course || !form.instructor) {
      setError("กรุณาเลือกรายวิชาและอาจารย์");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await registrarService.updateCourseOffering(editingId, form);
      } else {
        await registrarService.createCourseOffering(form);
      }
      setShowModal(false);
      fetchOfferings();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRegistration = async (id) => {
    try {
      await registrarService.toggleRegistration(id);
      fetchOfferings();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ต้องการยกเลิกกลุ่มเรียนนี้ใช่หรือไม่?")) return;
    try {
      const res = await registrarService.deleteCourseOffering(id);
      if (res.success) {
        fetchOfferings();
      }
    } catch (err) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const selectInstructor = (inst) => {
    setForm((prev) => ({ ...prev, instructor: inst._id }));
    setInstructorSearch(`${inst.firstName} ${inst.lastName}`);
    setShowInstructorDropdown(false);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getSemesterLabel = (s) =>
    SEMESTERS.find((sem) => sem.value === s)?.label || s;

  // ===== Render =====
  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            จัดการกลุ่มเรียน
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            เปิดกลุ่มเรียน กำหนดอาจารย์ผู้สอน ({filtered.length} กลุ่ม)
          </p>
        </div>
        <button
          onClick={openCreate}
          id="btn-create-offering"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <PlusIcon className="w-5 h-5" />
          เปิดกลุ่มเรียน
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหารหัสวิชา ชื่อวิชา หรืออาจารย์..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <input
          type="text"
          placeholder="ปีการศึกษา"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="w-32 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        <select
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none min-w-[160px] transition-all"
        >
          <option value="">ทุกภาคเรียน</option>
          {SEMESTERS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <CalendarDaysIcon className="w-16 h-16 mb-3" />
          <p className="text-lg font-medium">ยังไม่มีกลุ่มเรียน</p>
          <p className="text-sm">กดปุ่ม "เปิดกลุ่มเรียน" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((o) => (
            <div
              key={o._id}
              className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden"
            >
              {/* Card Header */}
              <div className="h-20 bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-4 relative">
                <p className="text-blue-100 text-xs font-medium">
                  {o.course?.courseCode} • Sec {o.section}
                </p>
                <h3 className="text-white font-bold truncate mt-0.5">
                  {o.course?.courseNameTH || "—"}
                </h3>
                {/* Registration badge */}
                <button
                  onClick={() => handleToggleRegistration(o._id)}
                  className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                    o.registrationOpen
                      ? "bg-emerald-400/20 text-emerald-100 hover:bg-emerald-400/30"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                  title={
                    o.registrationOpen ? "ปิดลงทะเบียน" : "เปิดลงทะเบียน"
                  }
                >
                  {o.registrationOpen ? (
                    <LockOpenIcon className="w-3 h-3" />
                  ) : (
                    <LockClosedIcon className="w-3 h-3" />
                  )}
                  {o.registrationOpen ? "เปิดลงทะเบียน" : "ปิดลงทะเบียน"}
                </button>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                {/* Instructor */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">อาจารย์ผู้สอน</p>
                    <p className="text-sm font-medium text-slate-700">
                      {o.instructor
                        ? `${o.instructor.firstName} ${o.instructor.lastName}`
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Info row */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <CalendarDaysIcon className="w-3.5 h-3.5" />
                    <span>
                      {o.academicYear}/{getSemesterLabel(o.semester)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UserGroupIcon className="w-3.5 h-3.5" />
                    <span>
                      {o.students?.length || 0}/{o.maxStudents}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AcademicCapIcon className="w-3.5 h-3.5" />
                    <span>{o.course?.credits || 0} หน่วยกิต</span>
                  </div>
                </div>

                {/* Schedule preview */}
                {o.schedule?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {o.schedule.map((sch, idx) => (
                      <span
                        key={idx}
                        className="inline-flex px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-[11px] text-slate-500"
                      >
                        {sch.day} {sch.startTime}-{sch.endTime}
                        {sch.room ? ` (${sch.room})` : ""}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                  <button
                    onClick={() => openEdit(o)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(o._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="ยกเลิกกลุ่มเรียน"
                  >
                    <TrashIcon className="w-4 h-4" />
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Create/Edit Modal ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? "แก้ไขกลุ่มเรียน" : "เปิดกลุ่มเรียนใหม่"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Course */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  รายวิชา <span className="text-red-500">*</span>
                </label>
                <select
                  name="course"
                  value={form.course}
                  onChange={onChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all"
                >
                  <option value="">— เลือกรายวิชา —</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.courseCode} — {c.courseNameTH} ({c.credits} หน่วยกิต)
                    </option>
                  ))}
                </select>
              </div>

              {/* Instructor with search */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  อาจารย์ผู้สอน <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่ออาจารย์..."
                    value={instructorSearch}
                    onChange={(e) => {
                      setInstructorSearch(e.target.value);
                      setShowInstructorDropdown(true);
                      if (!e.target.value) {
                        setForm((prev) => ({ ...prev, instructor: "" }));
                      }
                    }}
                    onFocus={() => setShowInstructorDropdown(true)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  {form.instructor && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-xs font-medium">
                      ✓ เลือกแล้ว
                    </span>
                  )}
                </div>

                {/* Instructor Dropdown */}
                {showInstructorDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                    {instructors.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-slate-400">
                        ไม่พบอาจารย์
                      </div>
                    ) : (
                      instructors.map((inst) => (
                        <button
                          key={inst._id}
                          type="button"
                          onClick={() => selectInstructor(inst)}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors flex items-center justify-between ${
                            form.instructor === inst._id
                              ? "bg-blue-50 text-blue-700"
                              : "text-slate-700"
                          }`}
                        >
                          <div>
                            <p className="font-medium">
                              {inst.firstName} {inst.lastName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {inst.email}
                              {inst.faculty?.nameTH
                                ? ` • ${inst.faculty.nameTH}`
                                : ""}
                            </p>
                          </div>
                          {form.instructor === inst._id && (
                            <span className="text-blue-600 text-xs">✓</span>
                          )}
                        </button>
                      ))
                    )}
                    <div className="border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowInstructorDropdown(false)}
                        className="w-full px-4 py-2 text-xs text-slate-400 hover:bg-slate-50"
                      >
                        ปิด
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Academic Year + Semester + Section */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    ปีการศึกษา
                  </label>
                  <input
                    name="academicYear"
                    value={form.academicYear}
                    onChange={onChange}
                    placeholder="2569"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    ภาคเรียน
                  </label>
                  <select
                    name="semester"
                    value={form.semester}
                    onChange={onChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all"
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    กลุ่ม/Section
                  </label>
                  <input
                    name="section"
                    value={form.section}
                    onChange={onChange}
                    placeholder="1"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Max Students */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  จำนวนนักศึกษาสูงสุด
                </label>
                <input
                  name="maxStudents"
                  type="number"
                  min="1"
                  max="500"
                  value={form.maxStudents}
                  onChange={onChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all"
                >
                  {saving
                    ? "กำลังบันทึก..."
                    : editingId
                      ? "บันทึกการแก้ไข"
                      : "เปิดกลุ่มเรียน"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
