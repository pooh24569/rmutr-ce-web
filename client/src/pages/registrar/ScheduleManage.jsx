import React, { useState, useEffect, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import * as registrarService from "@/services/registrarService";

const DAYS = [
  { value: "mon", label: "จันทร์", short: "จ." },
  { value: "tue", label: "อังคาร", short: "อ." },
  { value: "wed", label: "พุธ", short: "พ." },
  { value: "thu", label: "พฤหัสบดี", short: "พฤ." },
  { value: "fri", label: "ศุกร์", short: "ศ." },
  { value: "sat", label: "เสาร์", short: "ส." },
  { value: "sun", label: "อาทิตย์", short: "อา." },
];

const TIME_SLOTS = [];
for (let h = 8; h <= 20; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

const EMPTY_SLOT = { day: "mon", startTime: "09:00", endTime: "12:00", room: "" };

export default function ScheduleManage() {
  // Data
  const [offerings, setOfferings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedOffering, setSelectedOffering] = useState(null);
  const [loading, setLoading] = useState(true);

  // Schedule editing
  const [schedule, setSchedule] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSemester, setFilterSemester] = useState("");

  // ===== Fetch =====
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

  const selectOffering = async (offering) => {
    setSelectedId(offering._id);
    setSelectedOffering(offering);
    setSchedule(offering.schedule?.length > 0 ? [...offering.schedule] : []);
    setSaved(false);
  };

  // ===== Filter =====
  const filtered = offerings.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      o.course?.courseCode?.toLowerCase().includes(s) ||
      o.course?.courseNameTH?.toLowerCase().includes(s)
    );
  });

  // ===== Schedule Handlers =====
  const addSlot = () => {
    setSchedule([...schedule, { ...EMPTY_SLOT }]);
    setSaved(false);
  };

  const removeSlot = (idx) => {
    setSchedule(schedule.filter((_, i) => i !== idx));
    setSaved(false);
  };

  const updateSlot = (idx, field, value) => {
    const updated = [...schedule];
    updated[idx] = { ...updated[idx], [field]: value };
    setSchedule(updated);
    setSaved(false);
  };

  const handleSave = async () => {
    if (saving || !selectedId) return;
    setSaving(true);
    try {
      await registrarService.updateOfferingSchedule(selectedId, schedule);
      setSaved(true);
      fetchOfferings();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save schedule error:", err);
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const getDayLabel = (val) => DAYS.find((d) => d.value === val)?.label || val;

  // ===== Render =====
  return (
    <div className="p-6 h-full">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Left Panel — Offering List */}
        <div className="w-full lg:w-96 flex-shrink-0 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">จัดตารางเรียน</h1>
            <p className="text-slate-500 text-sm mt-1">
              กำหนดวัน เวลา ห้องเรียน
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

          {/* List */}
          <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CalendarDaysIcon className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">ไม่พบกลุ่มเรียน</p>
              </div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o._id}
                  onClick={() => selectOffering(o)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedId === o._id
                      ? "bg-purple-50 border-purple-200 shadow-sm"
                      : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                  }`}
                >
                  <p
                    className={`text-xs font-medium ${selectedId === o._id ? "text-purple-600" : "text-slate-400"}`}
                  >
                    {o.course?.courseCode} • Sec {o.section}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {o.course?.courseNameTH || "—"}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {o.schedule?.length > 0 ? (
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {o.schedule.length} คาบ
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        ยังไม่มีตาราง
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel — Schedule Editor */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {!selectedId ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
              <CalendarDaysIcon className="w-16 h-16 mb-3" />
              <p className="text-lg font-medium">เลือกกลุ่มเรียน</p>
              <p className="text-sm">
                เลือกกลุ่มเรียนทางซ้ายเพื่อจัดตารางเรียน
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      {selectedOffering?.course?.courseCode} —{" "}
                      {selectedOffering?.course?.courseNameTH}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Section {selectedOffering?.section} •{" "}
                      {selectedOffering?.academicYear}/
                      {selectedOffering?.semester === "summer"
                        ? "ฤดูร้อน"
                        : `เทอม ${selectedOffering?.semester}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={addSlot}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                      เพิ่มคาบ
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className={`inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-xl shadow-lg transition-all ${
                        saved
                          ? "bg-emerald-500 text-white shadow-emerald-500/20"
                          : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/20 hover:shadow-purple-500/30 hover:-translate-y-0.5 active:translate-y-0"
                      } disabled:opacity-50`}
                    >
                      {saved ? (
                        <>
                          <CheckIcon className="w-4 h-4" />
                          บันทึกแล้ว
                        </>
                      ) : saving ? (
                        "กำลังบันทึก..."
                      ) : (
                        "บันทึกตาราง"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Schedule Slots */}
              <div className="flex-1 overflow-y-auto p-6">
                {schedule.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <ClockIcon className="w-12 h-12 mb-2" />
                    <p className="font-medium">ยังไม่มีตารางเรียน</p>
                    <p className="text-sm mb-4">กดปุ่ม "เพิ่มคาบ" เพื่อเริ่มจัดตาราง</p>
                    <button
                      onClick={addSlot}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-50 text-purple-700 text-sm font-medium rounded-xl hover:bg-purple-100 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                      เพิ่มคาบเรียน
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {schedule.map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-slate-200 transition-all"
                      >
                        {/* Day indicator */}
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20 flex-shrink-0">
                          {DAYS.find((d) => d.value === slot.day)?.short ||
                            slot.day}
                        </div>

                        {/* Fields */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                          {/* Day */}
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                              วัน
                            </label>
                            <select
                              value={slot.day}
                              onChange={(e) =>
                                updateSlot(idx, "day", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none transition-all"
                            >
                              {DAYS.map((d) => (
                                <option key={d.value} value={d.value}>
                                  {d.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Start Time */}
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                              เริ่ม
                            </label>
                            <select
                              value={slot.startTime}
                              onChange={(e) =>
                                updateSlot(idx, "startTime", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none transition-all"
                            >
                              {TIME_SLOTS.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* End Time */}
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                              สิ้นสุด
                            </label>
                            <select
                              value={slot.endTime}
                              onChange={(e) =>
                                updateSlot(idx, "endTime", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none transition-all"
                            >
                              {TIME_SLOTS.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Room */}
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                              ห้อง
                            </label>
                            <div className="relative">
                              <MapPinIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                              <input
                                type="text"
                                value={slot.room}
                                onChange={(e) =>
                                  updateSlot(idx, "room", e.target.value)
                                }
                                placeholder="เช่น B401"
                                className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => removeSlot(idx)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 mt-5"
                          title="ลบคาบนี้"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Weekly Overview */}
              {schedule.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    ภาพรวมตาราง
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {schedule.map((slot, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <span className="font-semibold text-purple-600">
                          {getDayLabel(slot.day)}
                        </span>
                        <span className="text-slate-400">
                          {slot.startTime}–{slot.endTime}
                        </span>
                        {slot.room && (
                          <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {slot.room}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
