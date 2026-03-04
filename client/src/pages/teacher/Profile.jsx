import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, User, Mail, Phone, Save, X, Camera } from "lucide-react";

const TeacherProfile = () => {
    const { profile, loading, updateProfile, uploadImage, fetchProfile } = useProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
    });

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
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile(formData);
            await fetchProfile();
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];

        if (!file || !(file instanceof Blob)) {
            console.error("No valid file selected");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("ไฟล์ใหญ่เกินไป (สูงสุด 5MB)");
            return;
        }

        try {

            await uploadImage(file);
            await fetchProfile();
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("เกิดข้อผิดพลาดในการอัพโหลดรูป");
        }
    };

    if (loading && !profile) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
                    <div className="flex items-center gap-6">
                        {}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                                {profile?.profileImage ? (
                                    <img
                                        src={profile.profileImage}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-12 h-12 text-white/80" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 cursor-pointer shadow-lg hover:bg-gray-100 transition">
                                <Camera className="w-4 h-4 text-gray-600" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold">
                                {profile?.firstName || profile?.username} {profile?.lastName || ""}
                            </h1>
                            <p className="text-white/80">อาจารย์</p>
                            <p className="text-white/60 text-sm">{profile?.email}</p>
                        </div>

                        {!isEditing && (
                            <Button
                                onClick={handleStartEdit}
                                variant="outline"
                                className="ml-auto bg-white/10 border-white/30 text-white hover:bg-white/20"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                แก้ไข
                            </Button>
                        )}
                    </div>
                </div>

                {}
                <div className="p-6">
                    {isEditing ? (

                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800">แก้ไขข้อมูลส่วนตัว</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="firstName">ชื่อ / First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, firstName: e.target.value })
                                        }
                                        className="mt-1"
                                        placeholder="ใส่ชื่อ"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="lastName">นามสกุล / Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, lastName: e.target.value })
                                        }
                                        className="mt-1"
                                        placeholder="ใส่นามสกุล"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phoneNumber">เบอร์โทรศัพท์</Label>
                                    <Input
                                        id="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phoneNumber: e.target.value })
                                        }
                                        className="mt-1"
                                        placeholder="0812345678"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button onClick={handleSave} disabled={saving}>
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? "กำลังบันทึก..." : "บันทึก"}
                                </Button>
                                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                                    <X className="w-4 h-4 mr-2" />
                                    ยกเลิก
                                </Button>
                            </div>
                        </div>
                    ) : (

                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800">ข้อมูลส่วนตัว</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">ชื่อ-นามสกุล</p>
                                        <p className="font-medium text-gray-800">
                                            {profile?.firstName || "-"} {profile?.lastName || ""}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">อีเมล</p>
                                        <p className="font-medium text-gray-800">
                                            {profile?.email || "-"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                                        <p className="font-medium text-gray-800">
                                            {profile?.phoneNumber || "-"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Username</p>
                                        <p className="font-medium text-gray-800">
                                            {profile?.username || "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherProfile;
