// src/pages/teacher/components/CreateClassModal.jsx
import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Clock, MapPin } from "lucide-react";
import { classService } from "@/services/classService";

const DAYS = [
    { value: "monday", label: "จันทร์" },
    { value: "tuesday", label: "อังคาร" },
    { value: "wednesday", label: "พุธ" },
    { value: "thursday", label: "พฤหัส" },
    { value: "friday", label: "ศุกร์" },
    { value: "saturday", label: "เสาร์" },
    { value: "sunday", label: "อาทิตย์" },
];

const SEMESTERS = [
    { value: "1", label: "เทอม 1" },
    { value: "2", label: "เทอม 2" },
    { value: "summer", label: "Summer" },
];

const initialFormData = {
    classCode: "",
    className: "",
    section: "",
    description: "",
    academicYear: new Date().getFullYear() + 543 + "", // พ.ศ.
    semester: "1",
    schedule: [{ day: "monday", startTime: "09:00", endTime: "12:00", room: "" }],
};

const CreateClassModal = ({ isOpen, onClose, onSubmit, editData, onRefresh }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (editData) {
            setFormData({
                classCode: editData.classCode || "",
                className: editData.className || "",
                section: editData.section || "",
                description: editData.description || "",
                academicYear: editData.academicYear || "",
                semester: editData.semester || "1",
                schedule: editData.schedule || initialFormData.schedule,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [editData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleScheduleChange = (index, field, value) => {
        const newSchedule = [...formData.schedule];
        newSchedule[index][field] = value;
        setFormData((prev) => ({ ...prev, schedule: newSchedule }));
    };

    const addSchedule = () => {
        setFormData((prev) => ({
            ...prev,
            schedule: [
                ...prev.schedule,
                { day: "monday", startTime: "09:00", endTime: "12:00", room: "" },
            ],
        }));
    };

    const removeSchedule = (index) => {
        setFormData((prev) => ({
            ...prev,
            schedule: prev.schedule.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            let response;
            if (editData) {
                response = await classService.updateClass(editData._id, formData);
            } else {
                response = await classService.createClass(formData);
            }

            if (response.success) {
                onRefresh();
                onClose();
            } else {
                setError(response.message || "เกิดข้อผิดพลาด");
            }
        } catch (err) {
            setError(err.message || "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">
                        {editData ? "Edit Class" : "Create New Class"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Class Code & Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                รหัสวิชา *
                            </label>
                            <input
                                type="text"
                                name="classCode"
                                value={formData.classCode}
                                onChange={handleChange}
                                placeholder="e.g. MATH101"
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Section *
                            </label>
                            <input
                                type="text"
                                name="section"
                                value={formData.section}
                                onChange={handleChange}
                                placeholder="e.g. 01"
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ชื่อวิชา *
                        </label>
                        <input
                            type="text"
                            name="className"
                            value={formData.className}
                            onChange={handleChange}
                            placeholder="e.g. คณิตศาสตร์วิศวกรรม 1"
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            คำอธิบาย
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="คำอธิบายรายวิชา (optional)"
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                        />
                    </div>

                    {/* Academic Year & Semester */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ปีการศึกษา *
                            </label>
                            <input
                                type="text"
                                name="academicYear"
                                value={formData.academicYear}
                                onChange={handleChange}
                                placeholder="e.g. 2567"
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                เทอม *
                            </label>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                {SEMESTERS.map((sem) => (
                                    <option key={sem.value} value={sem.value}>
                                        {sem.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                ตารางเรียน *
                            </label>
                            <button
                                type="button"
                                onClick={addSchedule}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                            >
                                <Plus className="w-4 h-4" />
                                เพิ่มวัน
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.schedule.map((sch, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                >
                                    <select
                                        value={sch.day}
                                        onChange={(e) =>
                                            handleScheduleChange(index, "day", e.target.value)
                                        }
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        {DAYS.map((day) => (
                                            <option key={day.value} value={day.value}>
                                                {day.label}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <input
                                            type="time"
                                            value={sch.startTime}
                                            onChange={(e) =>
                                                handleScheduleChange(index, "startTime", e.target.value)
                                            }
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="time"
                                            value={sch.endTime}
                                            onChange={(e) =>
                                                handleScheduleChange(index, "endTime", e.target.value)
                                            }
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 flex-1">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={sch.room}
                                            onChange={(e) =>
                                                handleScheduleChange(index, "room", e.target.value)
                                            }
                                            placeholder="ห้องเรียน"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    {formData.schedule.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeSchedule(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : editData ? "Update" : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateClassModal;
