import React, { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/context/AuthContext";
import {
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
    CameraIcon,
    ShieldCheckIcon,
    KeyIcon,
} from "@heroicons/react/24/outline";

export default function AdminProfile() {
    const { user: currentUser, updateUser } = useAuth();
    const { profile, loading, updateProfile, uploadImage, fetchProfile } = useProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
    });
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        if (profile) {
            setFormData({
                firstName: profile.firstName || "",
                lastName: profile.lastName || "",
                phoneNumber: profile.phoneNumber || "",
            });
        }
    }, [profile]);

    const handleStartEdit = () => {
        setFormData({
            firstName: profile?.firstName || "",
            lastName: profile?.lastName || "",
            phoneNumber: profile?.phoneNumber || "",
        });
        setIsEditing(true);
        setSuccessMsg("");
    };

    const handleCancel = () => setIsEditing(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile(formData);
            await fetchProfile();
            setIsEditing(false);
            setSuccessMsg("Profile updated successfully!");
            updateUser({ firstName: formData.firstName, lastName: formData.lastName, phoneNumber: formData.phoneNumber });
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("File too large (max 5MB)");
            return;
        }

        try {
            await uploadImage(file);
            await fetchProfile();
            // Update sidebar avatar
            const reader = new FileReader();
            reader.onload = () => updateUser({ profileImage: reader.result });
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    if (loading && !profile) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const roleBadge = currentUser?.role === "superadmin"
        ? { label: "Super Admin", color: "bg-red-100 text-red-700" }
        : { label: "Admin", color: "bg-purple-100 text-purple-700" };

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                    <CheckIcon className="w-5 h-5" />
                    {successMsg}
                </div>
            )}

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-[#25343F] to-[#1a252d] px-6 py-8">
                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center overflow-hidden ring-4 ring-white/20">
                                {profile?.profileImage ? (
                                    <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-white/80">
                                        {(profile?.firstName || profile?.username || "A").charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-amber-500 hover:bg-amber-600 rounded-full p-1.5 cursor-pointer shadow-lg transition-colors">
                                <CameraIcon className="w-3.5 h-3.5 text-white" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-white">
                                {profile?.firstName || profile?.username || "Admin"} {profile?.lastName || ""}
                            </h1>
                            <p className="text-white/60 text-sm">{profile?.email}</p>
                            <span className={`inline-flex mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge.color}`}>
                                {roleBadge.label}
                            </span>
                        </div>

                        {!isEditing && (
                            <button
                                onClick={handleStartEdit}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                            >
                                <PencilIcon className="w-4 h-4" />
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isEditing ? (
                        <div className="space-y-5">
                            <h2 className="text-base font-semibold text-gray-900">Edit Personal Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                        placeholder="Enter last name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                        placeholder="0812345678"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 text-sm flex items-center gap-2"
                                >
                                    <CheckIcon className="w-4 h-4" />
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm flex items-center gap-2"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h2 className="text-base font-semibold text-gray-900">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { icon: UserCircleIcon, label: "Full Name", value: `${profile?.firstName || "-"} ${profile?.lastName || ""}`.trim() || "-" },
                                    { icon: EnvelopeIcon, label: "Email", value: profile?.email || "-" },
                                    { icon: PhoneIcon, label: "Phone", value: profile?.phoneNumber || "-" },
                                    { icon: KeyIcon, label: "Username", value: profile?.username || "-" },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                                        <item.icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500">{item.label}</p>
                                            <p className="text-sm font-medium text-gray-800">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                        <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Role</p>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge.color}`}>
                                {roleBadge.label}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                        <KeyIcon className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Member Since</p>
                            <p className="text-sm font-medium text-gray-800">
                                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "-"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
