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

    const isThai = (text) => /[\u0E00-\u0E7F]/.test(text);
    const firstName = profile.firstName || "";
    const lastName = profile.lastName || "";
    const firstNameTH = studentProfile.firstNameTH || (isThai(firstName) ? firstName : "");
    const lastNameTH = studentProfile.lastNameTH || (isThai(lastName) ? lastName : "");
    // Use firstNameEN/lastNameEN from studentProfile, fallback to profile name if not Thai
    const firstNameEN = studentProfile.firstNameEN || (!isThai(firstName) ? firstName : "");
    const lastNameEN = studentProfile.lastNameEN || (!isThai(lastName) ? lastName : "");

    // Get prefix from studentProfile
    const prefixTH = studentProfile.prefix || "";
    // Convert Thai prefix to English
    const getPrefixEN = (thaiPrefix) => {
        const prefixMap = {
            "นาย": "Mr.",
            "นาง": "Mrs.",
            "นางสาว": "Miss"
        };
        return prefixMap[thaiPrefix] || "";
    };
    const prefixEN = getPrefixEN(prefixTH);



    return (
        <div className="w-full flex justify-center items-center p-4">
            { }
            <div
                className="w-full"
                style={{
                    maxWidth: '1040px',
                    aspectRatio: '1040 / 543'
                }}
            >
                { }
                <div
                    className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-200"
                >

                    { }
                    {onEdit && (
                        <Button
                            onClick={onEdit}
                            className="absolute top-4 right-4 rounded-lg w-10 h-10 p-0 bg-orange-100 hover:bg-orange-200 border border-orange-300 z-20"
                        >
                            <Edit className="w-4 h-4 text-orange-600" />
                        </Button>
                    )}

                    <div className="flex h-full">
                        { }
                        <div className="w-45 flex-shrink-0 flex items-center justify-center">
                            <img
                                src="/LOGO-RMUTR.png"
                                alt="RMUTR Logo"
                                className="w-45 h-auto transform -rotate-90"
                            />
                        </div>

                        { }
                        <div className="flex-1 flex pr-8 py-8 gap-6">
                            { }
                            <div className="flex flex-col items-center justify-center gap-6 w-[40%] -ml-8">
                                { }
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

                                { }
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

                            { }
                            <div className="flex-1  flex-col justify-center py-20 ">
                                { }
                                <div className="space-y-4 ">
                                    {/* Row 1 - National ID, Issue Date, Expiry Date */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-[12px] text-gray-400 mb-0.5">รหัสบัตรประชาชน</p>
                                            <p className="text-base font-semibold text-gray-700">
                                                {studentProfile.nationalId || "-"}
                                            </p>
                                        </div>
                                        { }
                                        <div className="col-span-2">
                                            <div className="flex gap-12 ml-5">
                                                <div>
                                                    <p className="text-[12px] text-gray-400 mb-0.5">วันที่ออกบัตร</p>
                                                    <p className="text-base font-semibold text-gray-700">
                                                        {formatDate(studentProfile.cardIssueDate)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[12px] text-gray-400 mb-0.5">วันหมดอายุ</p>
                                                    <p className="text-base font-semibold text-gray-700">
                                                        {formatDate(studentProfile.cardExpiryDate)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    { }
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-[12px] text-gray-400 mb-0.5 ">ชื่อ</p>
                                            <p className="text-base font-semibold text-gray-800">
                                                {firstNameTH ? `${prefixTH} ${firstNameTH}` : ""}
                                            </p>
                                        </div>
                                        { }
                                        <div className="col-span-2">
                                            <div className="w-1/2"> { }
                                                <p className="text-[12px] text-gray-400 mb-0.5 ml-5">นามสกุล</p>
                                                <p className="text-base font-semibold text-gray-800 ml-5">
                                                    {lastNameTH || ""}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    { }
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-[12px] text-gray-400 mb-0.5">ชื่อภาษาอังกฤษ</p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {firstNameEN ? `${prefixEN} ${firstNameEN}` : ""}
                                            </p>
                                        </div>
                                        { }
                                        <div className="col-span-2">
                                            <div className="w-1/2">
                                                <p className="text-[12px] text-gray-400 mb-0.5 ml-5">นามสกุลภาษาอังกฤษ</p>
                                                <p className="text-sm font-medium text-gray-700 ml-5">
                                                    {lastNameEN || ""}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    { }
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-[12px] text-gray-400 mb-0.5">วันเกิด</p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {formatDate(studentProfile.dateOfBirth)}
                                            </p>
                                        </div>
                                        { }
                                        <div className="col-span-2">
                                            <div className="w-1/2">
                                                <p className="text-[12px] text-gray-400 mb-0.5 ml-5">สัญชาติ</p>
                                                <p className="text-sm font-medium text-gray-700 ml-5">
                                                    {studentProfile.nationality || "-"}
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