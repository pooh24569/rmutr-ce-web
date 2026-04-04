import React, { useState, useEffect, useCallback } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  AcademicCapIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import * as registrarService from "@/services/registrarService";

// ===== Constants =====
const COURSE_TYPES = [
  { value: "required", label: "วิชาบังคับ" },
  { value: "elective", label: "วิชาเลือก" },
  { value: "general", label: "วิชาศึกษาทั่วไป" },
  { value: "free", label: "วิชาเสรี" },
];

const EMPTY_FORM = {
  courseCode: "",
  courseNameTH: "",
  courseNameEN: "",
  credits: 3,
  faculty: "",
  department: "",
  description: "",
  courseType: "required",
};

// ===== Component =====
export default function CourseManage() {
  // Data
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [filterFaculty, setFilterFaculty] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formDepts, setFormDepts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ===== Fetch Data =====
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterFaculty) params.faculty = filterFaculty;
      const res = await registrarService.getCourses(params);
      if (res.success) setCourses(res.data);
    } catch (err) {
      console.error("Fetch courses error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, filterFaculty]);

  const fetchFaculties = async () => {
    try {
      const res = await registrarService.getFaculties();
      if (res.success) setFaculties(res.data);
    } catch (err) {
      console.error("Fetch faculties error:", err);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Fetch departments when form.faculty changes
  useEffect(() => {
    if (form.faculty) {
      registrarService.getDepartments(form.faculty).then((res) => {
        if (res.success) setFormDepts(res.data);
      });
    } else {
      setFormDepts([]);
    }
  }, [form.faculty]);

  // ===== Handlers =====
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  };

  const openEdit = (course) => {
    setEditingId(course._id);
    setForm({
      courseCode: course.courseCode,
      courseNameTH: course.courseNameTH,
      courseNameEN: course.courseNameEN || "",
      credits: course.credits,
      faculty: course.faculty?._id || "",
      department: course.department?._id || "",
      description: course.description || "",
      courseType: course.courseType || "required",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!form.courseCode || !form.courseNameTH || !form.credits) {
      setError("กรุณากรอกข้อมูลที่จำเป็น");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await registrarService.updateCourse(editingId, form);
      } else {
        await registrarService.createCourse(form);
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ต้องการปิดรายวิชานี้ใช่หรือไม่?")) return;
    try {
      await registrarService.deleteCourse(id);
      fetchCourses();
    } catch (err) {
      console.error("Delete course error:", err);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "faculty") {
      setForm((prev) => ({ ...prev, department: "" }));
    }
  };

  // ===== Render =====
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการรายวิชา</h1>
          <p className="text-slate-500 text-sm mt-1">
            เพิ่ม แก้ไข ลบรายวิชาในระบบ ({courses.length} วิชา)
          </p>
        </div>
        <button
          onClick={openCreate}
          id="btn-create-course"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <PlusIcon className="w-5 h-5" />
          เพิ่มรายวิชา
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหารหัสวิชา หรือชื่อวิชา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="relative">
          <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={filterFaculty}
            onChange={(e) => setFilterFaculty(e.target.value)}
            className="pl-9 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all min-w-[180px]"
          >
            <option value="">ทุกคณะ</option>
            {faculties.map((f) => (
              <option key={f._id} value={f._id}>
                {f.nameTH}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <AcademicCapIcon className="w-16 h-16 mb-3" />
          <p className="text-lg font-medium">ยังไม่มีรายวิชา</p>
          <p className="text-sm">กดปุ่ม "เพิ่มรายวิชา" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">
                    รหัสวิชา
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">
                    ชื่อวิชา
                  </th>
                  <th className="text-center px-5 py-3.5 font-semibold text-slate-600">
                    หน่วยกิต
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">
                    ประเภท
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">
                    คณะ / สาขา
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">
                    สถานะ
                  </th>
                  <th className="text-center px-5 py-3.5 font-semibold text-slate-600">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {courses.map((course) => (
                  <tr
                    key={course._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {course.courseCode}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800">
                        {course.courseNameTH}
                      </p>
                      {course.courseNameEN && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {course.courseNameEN}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm">
                        {course.credits}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          course.courseType === "required"
                            ? "bg-red-50 text-red-700"
                            : course.courseType === "elective"
                              ? "bg-amber-50 text-amber-700"
                              : course.courseType === "general"
                                ? "bg-green-50 text-green-700"
                                : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {COURSE_TYPES.find((t) => t.value === course.courseType)
                          ?.label || course.courseType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <p>{course.faculty?.nameTH || "—"}</p>
                      {course.department?.nameTH && (
                        <p className="text-xs text-slate-400">
                          {course.department.nameTH}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          course.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {course.status === "active" ? "เปิดใช้งาน" : "ปิด"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(course)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <PencilSquareIcon className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(course._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="ปิดรายวิชา"
                        >
                          <TrashIcon className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                {editingId ? "แก้ไขรายวิชา" : "เพิ่มรายวิชาใหม่"}
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

              {/* Course Code */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  รหัสวิชา <span className="text-red-500">*</span>
                </label>
                <input
                  name="courseCode"
                  value={form.courseCode}
                  onChange={onChange}
                  placeholder="เช่น CPE101"
                  disabled={!!editingId}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase disabled:bg-slate-50 disabled:text-slate-400 transition-all"
                />
              </div>

              {/* Course Name TH */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  ชื่อวิชา (ภาษาไทย) <span className="text-red-500">*</span>
                </label>
                <input
                  name="courseNameTH"
                  value={form.courseNameTH}
                  onChange={onChange}
                  placeholder="เช่น วิศวกรรมคอมพิวเตอร์เบื้องต้น"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Course Name EN */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  ชื่อวิชา (ภาษาอังกฤษ)
                </label>
                <input
                  name="courseNameEN"
                  value={form.courseNameEN}
                  onChange={onChange}
                  placeholder="Introduction to Computer Engineering"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Credits + Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    หน่วยกิต <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="credits"
                    type="number"
                    min="1"
                    max="12"
                    value={form.credits}
                    onChange={onChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    ประเภทวิชา
                  </label>
                  <select
                    name="courseType"
                    value={form.courseType}
                    onChange={onChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all"
                  >
                    {COURSE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Faculty + Department */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    คณะ
                  </label>
                  <select
                    name="faculty"
                    value={form.faculty}
                    onChange={onChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all"
                  >
                    <option value="">— เลือกคณะ —</option>
                    {faculties.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.nameTH}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    สาขา
                  </label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={onChange}
                    disabled={!form.faculty}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none disabled:bg-slate-50 transition-all"
                  >
                    <option value="">— เลือกสาขา —</option>
                    {formDepts.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.nameTH}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  รายละเอียด
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows={3}
                  placeholder="คำอธิบายรายวิชา..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
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
                      : "เพิ่มรายวิชา"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
