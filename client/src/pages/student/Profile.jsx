import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import StudentIDCard from "@/components/student/StudentIDCard";
import ProfileEditForm from "@/components/student/ProfileEditForm";
import StudentHeader from "@/components/student/StudentHeader";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router";

/**
 * Profile Page
 * Main page for viewing and editing user profile
 */
const Profile = () => {
    const navigate = useNavigate();
    const {
        profile,
        loading,
        updateProfile,
        updateStudentProfile,
        uploadImage,
        fetchProfile,
    } = useProfile();

    if (loading && !profile) {
        return (
            <div className="flex flex-col h-full">
                <StudentHeader title="MY PROFILE" />
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
            <StudentHeader title="MY PROFILE" />

            <section className="flex-1 px-8 py-6 bg-[#e5e5e5] overflow-y-auto">
                {/* Content */}
                <StudentIDCard
                    profile={profile}
                    onEdit={() => navigate('/student/profile/edit')}
                />
            </section>
        </div>
    );
};

export default Profile;
