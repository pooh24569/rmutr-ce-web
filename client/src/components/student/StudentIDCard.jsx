import Barcode from "react-barcode";
import { Edit, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const StudentIDCard = ({ profile, onEdit }) => {
    if (!profile) return null;

    const studentProfile = profile.studentProfile || {};

    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    // ตรวจสอบชื่อไทย/อังกฤษ
    const isThai = (text) => /[\u0E00-\u0E7F]/.test(text);
    const firstName = profile.firstName || "";
    const lastName = profile.lastName || "";
    const firstNameTH = studentProfile.firstNameTH || (isThai(firstName) ? firstName : "");
    const lastNameTH = studentProfile.lastNameTH || (isThai(lastName) ? lastName : "");
    const firstNameEN = !isThai(firstName) ? firstName : "";
    const lastNameEN = !isThai(lastName) ? lastName : "";

    // วันที่ออกบัตร และหมดอายุ
    const issueDate = formatDate(new Date());
    const expiryDate = formatDate(new Date(new Date().setFullYear(new Date().getFullYear() + 4)));

    return (
        <div className="w-full flex justify-center items-center p-4">
            {/* Wrapper for scaling */}
            <div
                className="w-full"
                style={{
                    maxWidth: '1040px',
                    aspectRatio: '1040 / 543'
                }}
            >
                {/* Main Card */}
                <div
                    className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-200"
                >

                    {/* Edit Button */}
                    {onEdit && (
                        <Button
                            onClick={onEdit}
                            className="absolute top-4 right-4 rounded-lg w-10 h-10 p-0 bg-orange-100 hover:bg-orange-200 border border-orange-300 z-20"
                        >
                            <Edit className="w-4 h-4 text-orange-600" />
                        </Button>
                    )}

                    <div className="flex h-full">
                        {/* Logo */}
                        <div className="w-45 flex-shrink-0 flex items-center justify-center">
                            <img
                                src="/LOGO-RMUTR.png"
                                alt="RMUTR Logo"
                                className="w-45 h-auto transform -rotate-90"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex pr-8 py-8 gap-6">
                            {/* Left: Photo & Barcode */}
                            <div className="flex flex-col items-center justify-center gap-6 w-[40%] -ml-8">
                                {/* Photo */}
                                <div className="w-full max-w-[260px]" style={{ aspectRatio: '1/1' }}>
                                    {profile.profileImage ? (
                                        <img
                                            src={profile.profileImage}
                                            alt="Profile"
                                            className="w-full h-full object-cover rounded-lg border-2 border-gray-300 shadow-md"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-gray-300 shadow-md flex items-center justify-center">
                                            <User className="w-20 h-20 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Barcode */}
                                <div className="bg-white p-2 rounded-md ">
                                    <Barcode
                                        value={studentProfile.studentId || profile.username || "0000000000000"}
                                        width={1.5}
                                        height={35}
                                        fontSize={11}
                                        displayValue={true}
                                        margin={0}
                                    />
                                </div>
                            </div>

                            {/* Right: Information */}
                            <div className="flex-1  flex-col justify-center py-20 ">
                                {/* Grid Layout */}
                                <div className="space-y-4 ">
                                    {/* Row 1: ID, Issue Date, Expiry - 3 columns */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-[12px] text-gray-400 mb-0.5">รหัสบัตรประจำตัวประชาชน</p>
                                            <p className="text-base font-bold text-gray-800">
                                                {studentProfile.studentId || profile.username || "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-gray-400 mb-0.5 ml-5">วันที่ออกบัตร</p>
                                            <p className="text-base font-semibold text-gray-700 ml-5">{issueDate}</p>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-gray-400 mb-0.5">วันที่หมดอายุ</p>
                                            <p className="text-base font-semibold text-gray-700">{expiryDate}</p>
                                        </div>
                                    </div>

                                    {/* Row 2: Thai Name - Changed to 3 columns to align with Row 1 */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-[12px] text-gray-400 mb-0.5 ">ชื่อ</p>
                                            <p className="text-base font-semibold text-gray-800">
                                                {firstNameTH ? `นาย${firstNameTH}` : "-"}
                                            </p>
                                        </div>
                                        {/* Added ml-5 to match "Issue Date" style */}
                                        <div className="col-span-2"> 
                                            <div className="w-1/2"> {/* Limit width to simulate grid col 2 */}
                                                <p className="text-[12px] text-gray-400 mb-0.5 ml-5">นามสกุล</p>
                                                <p className="text-base font-semibold text-gray-800 ml-5">
                                                    {lastNameTH || "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 3: English Name - Changed to 3 columns */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-[12px] text-gray-400 mb-0.5">ชื่อภาษาอังกฤษ</p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {firstNameEN ? `Mr. ${firstNameEN}` : "-"}
                                            </p>
                                        </div>
                                        {/* Added ml-5 to match "Issue Date" style */}
                                        <div className="col-span-2">
                                            <div className="w-1/2">
                                                <p className="text-[12px] text-gray-400 mb-0.5 ml-5">นามสกุลภาษาอังกฤษ</p>
                                                <p className="text-sm font-medium text-gray-700 ml-5">
                                                    {lastNameEN || "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 4: Birthday & Nationality - Changed to 3 columns */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-[12px] text-gray-400 mb-0.5">วันเกิด</p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {formatDate(studentProfile.dateOfBirth)}
                                            </p>
                                        </div>
                                        {/* Added ml-5 to match "Issue Date" style */}
                                        <div className="col-span-2">
                                            <div className="w-1/2">
                                                <p className="text-[12px] text-gray-400 mb-0.5 ml-5">สัญชาติ</p>
                                                <p className="text-sm font-medium text-gray-700 ml-5">
                                                    {studentProfile.nationality || "ไทย"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentIDCard;