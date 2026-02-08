import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import ProfileEditForm from "@/components/student/ProfileEditForm";
import StudentHeader from "@/components/student/StudentHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

const ProfileEdit = () => {
    const navigate = useNavigate();
    const {
        profile,
        loading,
        updateProfile,
        updateStudentProfile,
        uploadImage,
        fetchProfile,
    } = useProfile();
    const [saving, setSaving] = useState(false);

    const handleSave = async (basicProfile, studentProfile, imageFile) => {
        setSaving(true);
        try {

            if (imageFile) {
                await uploadImage(imageFile);
            }

            await updateProfile(basicProfile);

            if (profile?.role === "student") {
                await updateStudentProfile(studentProfile);
            }

            await fetchProfile();

            navigate('/student/profile');
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/student/profile');
    };

    if (loading && !profile) {
        return (
            <div className="flex flex-col h-full">
                <StudentHeader
                    breadcrumbs={[
                        { label: "My Profile", link: "/student/profile" },
                        { label: "EDIT PROFILE" }
                    ]}
                />
                <div className="flex-1 flex items-center justify-center bg-[#e5e5e5]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <StudentHeader
                breadcrumbs={[
                    { label: "My Profile", link: "/student/profile" },
                    { label: "EDIT PROFILE" }
                ]}
            />

            <section className="flex-1 px-8 py-6 bg-[#e5e5e5] overflow-y-auto">

                { }
                <ProfileEditForm
                    profile={profile}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    loading={saving}
                />
            </section>
        </div>
    );
};

export default ProfileEdit;
