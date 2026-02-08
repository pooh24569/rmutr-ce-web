
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { DatePicker } from "@/components/ui/DatePicker";

export default function EventModal({ isOpen, onClose, onSave, event = null, eventTypes = [] }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDate: "",
        startTime: "09:00",
        endDate: "",
        endTime: "10:00",
        allDay: true,
        type: "personal",
        color: "#3b82f6",
        visibility: "private",
        location: "",
    });

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (event) {
            const start = new Date(event.startDate);
            const end = new Date(event.endDate);

            setFormData({
                title: event.title || "",
                description: event.description || "",
                startDate: start.toISOString().split("T")[0],
                startTime: start.toTimeString().slice(0, 5),
                endDate: end.toISOString().split("T")[0],
                endTime: end.toTimeString().slice(0, 5),
                allDay: event.allDay ?? true,
                type: event.type || "personal",
                color: event.color || "#3b82f6",
                visibility: event.visibility || "private",
                location: event.location || "",
            });
        } else {

            const today = new Date().toISOString().split("T")[0];
            setFormData((prev) => ({
                ...prev,
                startDate: today,
                endDate: today,
            }));
        }
    }, [event, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }

        if (!formData.startDate) {
            newErrors.startDate = "Start date is required";
        }

        if (!formData.endDate) {
            newErrors.endDate = "End date is required";
        }

        if (formData.startDate && formData.endDate) {
            const start = new Date(`${formData.startDate}T${formData.startTime}`);
            const end = new Date(`${formData.endDate}T${formData.endTime}`);

            if (start > end) {
                newErrors.endDate = "End date must be after start date";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setSaving(true);

        try {

            const startDateTime = formData.allDay
                ? new Date(formData.startDate)
                : new Date(`${formData.startDate}T${formData.startTime}`);

            const endDateTime = formData.allDay
                ? new Date(formData.endDate)
                : new Date(`${formData.endDate}T${formData.endTime}`);

            const eventData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
                allDay: formData.allDay,
                type: formData.type,
                color: formData.color,
                visibility: formData.visibility,
                location: formData.location.trim(),
            };

            await onSave(eventData);
            onClose();
        } catch (error) {
            console.error("Save event error:", error);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                { }
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <h2 className="text-xl font-semibold text-neutral-900">
                        {event ? "Edit Event" : "Create Event"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                        disabled={saving}
                    >
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>

                { }
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    { }
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter event title"
                            className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? "border-red-500" : "border-neutral-300"
                                }`}
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    { }
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Add description (optional)"
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    { }
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-neutral-700 mb-1">
                                Type
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {eventTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="color" className="block text-sm font-medium text-neutral-700 mb-1 ml-1">
                                Color
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="w-11 h-11 rounded-lg border border-neutral-300 overflow-hidden flex-shrink-0">
                                    <input
                                        type="color"
                                        id="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        className="w-16 h-16 -m-2.5 cursor-pointer"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="#3b82f6"
                                />
                            </div>
                        </div>
                    </div>

                    { }
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="allDay"
                            name="allDay"
                            checked={formData.allDay}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="allDay" className="text-sm text-neutral-700">
                            All day event
                        </label>
                    </div>

                    { }
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700 mb-1">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <DatePicker
                                value={formData.startDate}
                                onChange={handleChange}
                                name="startDate"
                                label="Start Date"
                                placeholder="เลือกวันเริ่มต้น"
                                maxYear={new Date().getFullYear() + 5}
                                minYear={2020}
                            />
                            {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
                        </div>

                        {!formData.allDay && (
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-neutral-700 mb-1">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    id="startTime"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                    </div>

                    { }
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-neutral-700 mb-1">
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <DatePicker
                                value={formData.endDate}
                                onChange={handleChange}
                                name="endDate"
                                label="End Date"
                                placeholder="เลือกวันสิ้นสุด"
                                maxYear={new Date().getFullYear() + 5}
                                minYear={2020}
                            />
                            {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
                        </div>

                        {!formData.allDay && (
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-neutral-700 mb-1">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    id="endTime"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                    </div>

                    { }
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1">
                            Location
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Add location (optional)"
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    { }
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? "Saving..." : event ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}