import Barcode from "react-barcode";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

export const StudentIDCard = ({ profile, onEdit }) => {
    // ถ้าไม่มี profile เลย ไม่แสดงอะไร
    if (!profile) return null;

    // ใช้ค่า default ถ้าไม่มี studentProfile
    const studentProfile = profile.studentProfile || {};

    // Format date to Thai format
    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    return (
        <div className="relative w-full max-w-6xl mx-auto px-4 py-4">
            {/* Card Container */}
            <div
                className="relative rounded-2xl shadow-xl overflow-y-auto"
                style={{
                    minHeight: "400px",
                    maxHeight: "80vh",
                    background: studentProfile.cardBackground
                        ? `url(${studentProfile.cardBackground})`
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* Edit Button */}
                {onEdit && (
                    <Button
                        onClick={onEdit}
                        className="absolute top-4 right-4 rounded-full w-12 h-12 p-0 bg-orange-500 hover:bg-orange-600 shadow-lg z-20"
                    >
                        <Edit className="w-5 h-5" />
                    </Button>
                )}

                {/* Card Content */}
                <div className="bg-white/90 backdrop-blur-sm p-6 min-h-full">
                    {/* Header */}
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            RAJAMANGALA UNIVERSITY
                        </h2>
                        <p className="text-sm text-gray-600">OF TECHNOLOGY RATTANAKOSIN</p>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-4">
                        {/* Photo & Student ID */}
                        <div className="flex gap-4 items-start">
                            {/* Photo */}
                            <div className="flex-shrink-0">
                                {profile.profileImage ? (
                                    <img
                                        src={profile.profileImage}
                                        alt="Profile"
                                        className="w-32 h-40 object-cover rounded-lg border-2 border-blue-500 shadow-md"
                                    />
                                ) : (
                                    <div className="w-32 h-40 bg-gray-200 rounded-lg border-2 border-blue-500 flex items-center justify-center">
                                        <span className="text-gray-400 text-3xl">📷</span>
                                    </div>
                                )}
                            </div>

                            {/* Student ID & Info */}
                            <div className="flex-1 space-y-3">
                                {/* Student ID */}
                                <div className="bg-blue-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">รหัสนักศึกษา / Student ID</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {studentProfile.studentId || profile.username || "-"}
                                    </p>
                                </div>

                                {/* Names - แสดงเฉพาะภาษาที่กรอก */}
                                {(() => {
                                    // ตรวจสอบว่าเป็นภาษาไทยหรือไม่
                                    const isThai = (text) => /[\u0E00-\u0E7F]/.test(text);

                                    const firstName = profile.firstName || "";
                                    const lastName = profile.lastName || "";
                                    const firstNameTH = studentProfile.firstNameTH || "";
                                    const lastNameTH = studentProfile.lastNameTH || "";

                                    // ถ้ามีชื่อไทยใน studentProfile ให้ใช้
                                    // ถ้าไม่มี ให้เช็คว่า firstName เป็นภาษาไทยไหม
                                    const thaiFirst = firstNameTH || (isThai(firstName) ? firstName : "");
                                    const thaiLast = lastNameTH || (isThai(lastName) ? lastName : "");
                                    const engFirst = !isThai(firstName) ? firstName : "";
                                    const engLast = !isThai(lastName) ? lastName : "";

                                    return (
                                        <>
                                            {/* Thai Name */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-gray-50 rounded p-2">
                                                    <p className="text-xs text-gray-500">ชื่อ</p>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {thaiFirst || "-"}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 rounded p-2">
                                                    <p className="text-xs text-gray-500">นามสกุล</p>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {thaiLast || "-"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* English Name */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-gray-50 rounded p-2">
                                                    <p className="text-xs text-gray-500">Name</p>
                                                    <p className="text-sm text-gray-700">
                                                        {engFirst || "-"}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 rounded p-2">
                                                    <p className="text-xs text-gray-500">Surname</p>
                                                    <p className="text-sm text-gray-700">
                                                        {engLast || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-blue-50 rounded p-2">
                                <p className="text-xs text-gray-500">วันเกิด / Date of Birth</p>
                                <p className="text-sm font-semibold text-gray-700">
                                    {formatDate(studentProfile.dateOfBirth)}
                                </p>
                            </div>
                            <div className="bg-purple-50 rounded p-2">
                                <p className="text-xs text-gray-500">สัญชาติ / Nationality</p>
                                <p className="text-sm font-semibold text-gray-700">
                                    {studentProfile.nationality || "ไทย / Thai"}
                                </p>
                            </div>
                        </div>

                        {/* Faculty */}
                        {studentProfile.education?.faculty && (
                            <div className="bg-indigo-50 rounded p-2">
                                <p className="text-xs text-gray-500">คณะ / Faculty</p>
                                <p className="text-sm font-semibold text-gray-700">
                                    {studentProfile.education.faculty}
                                </p>
                            </div>
                        )}

                        {/* Barcode & Signature */}
                        <div className="flex items-center justify-between pt-4 border-t">
                            {/* Barcode */}
                            <div className="bg-white p-2 rounded">
                                <Barcode
                                    value={studentProfile.studentId || profile.username || "N/A"}
                                    width={1.5}
                                    height={40}
                                    fontSize={10}
                                    displayValue={true}
                                />
                            </div>

                            {/* Signature */}
                            <div className="text-center">
                                {studentProfile.signature ? (
                                    <img
                                        src={studentProfile.signature}
                                        alt="Signature"
                                        className="h-12 w-auto mb-1"
                                    />
                                ) : (
                                    <div className="h-12 w-32 border-b-2 border-gray-300 mb-1"></div>
                                )}
                                <p className="text-xs text-gray-500">Signature</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentIDCard;
