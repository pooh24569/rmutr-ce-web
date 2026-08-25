import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/DatePicker";
import ImageUpload from "@/components/form/ImageUpload";

const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
};

const mapProfileToFormValues = (profile) => {
    const sp = profile?.studentProfile || {};
    return {
        // Basic
        firstName: profile?.firstName || "",
        lastName: profile?.lastName || "",
        phoneNumber: profile?.phoneNumber || "",

        // Personal Info
        studentId: sp.studentId || profile?.username || "",
        nationality: sp.nationality || "",
        nationalId: sp.nationalId || "",
        prefix: sp.prefix || "",
        firstNameTH: sp.firstNameTH || profile?.firstName || "",
        lastNameTH: sp.lastNameTH || profile?.lastName || "",
        firstNameEN: sp.firstNameEN || "",
        lastNameEN: sp.lastNameEN || "",
        dateOfBirth: formatDate(sp.dateOfBirth),
        birthProvince: sp.birthProvince || "",
        ethnicity: sp.ethnicity || "",
        religion: sp.religion || "",
        bloodType: sp.bloodType || "",
        maritalStatus: sp.maritalStatus || "",
        talents: sp.talents || "",
        sports: sp.sports || "",
        height: sp.height || "",
        weight: sp.weight || "",
        gender: sp.gender || "",

        // Previous Education
        prevSchoolName: sp.previousEducation?.schoolName || "",
        prevQualification: sp.previousEducation?.qualification || "",
        prevGraduationDate: formatDate(sp.previousEducation?.graduationDate),
        prevGpa: sp.previousEducation?.gpa || "",

        // Address
        houseCode: sp.address?.houseCode || "",
        village: sp.address?.village || "",
        houseNumber: sp.address?.houseNumber || "",
        moo: sp.address?.moo || "",
        soi: sp.address?.soi || "",
        road: sp.address?.road || "",
        province: sp.address?.province || "",
        district: sp.address?.district || "",
        subDistrict: sp.address?.subDistrict || "",
        postalCode: sp.address?.postalCode || "",
        homePhone: sp.address?.homePhone || "",
        mobilePhone: sp.address?.mobilePhone || "",
        addressEmail: sp.address?.email || profile?.email || "",

        // Father
        fatherNationality: sp.father?.nationality || "",
        fatherNationalId: sp.father?.nationalId || "",
        fatherPrefix: sp.father?.prefix || "",
        fatherFirstName: sp.father?.firstName || "",
        fatherLastName: sp.father?.lastName || "",
        fatherStatus: sp.father?.status || "",
        fatherEducation: sp.father?.education || "",
        fatherDob: formatDate(sp.father?.dateOfBirth),
        fatherPhone: sp.father?.phone || "",

        // Mother
        motherNationality: sp.mother?.nationality || "",
        motherNationalId: sp.mother?.nationalId || "",
        motherPrefix: sp.mother?.prefix || "",
        motherFirstName: sp.mother?.firstName || "",
        motherLastName: sp.mother?.lastName || "",
        motherStatus: sp.mother?.status || "",
        motherEducation: sp.mother?.education || "",
        motherDob: formatDate(sp.mother?.dateOfBirth),
        motherPhone: sp.mother?.phone || "",

        // Guardian
        guardianNationality: sp.guardian?.nationality || "",
        guardianNationalId: sp.guardian?.nationalId || "",
        guardianPrefix: sp.guardian?.prefix || "",
        guardianFirstName: sp.guardian?.firstName || "",
        guardianLastName: sp.guardian?.lastName || "",
        guardianRelationship: sp.guardian?.relationship || "",
        guardianDob: formatDate(sp.guardian?.dateOfBirth),
        guardianPhone: sp.guardian?.phone || "",
        // UI-only: infer from relationship if possible
        guardianParentType: sp.guardian?.relationship === "บิดา"
            ? "father"
            : sp.guardian?.relationship === "มารดา"
            ? "mother"
            : sp.guardian?.firstName ? "other" : "",

        // Emergency Contact
        emergencyPrefix: sp.emergencyContact?.prefix || "",
        emergencyFirstName: sp.emergencyContact?.firstName || "",
        emergencyLastName: sp.emergencyContact?.lastName || "",

        // Current Education
        faculty: sp.education?.faculty || "",
        department: sp.education?.department || "",
        year: sp.education?.year || "",
        gpa: sp.education?.gpa || "",
    };
};

export const ProfileEditForm = ({
    profile,
    onSave,
    onCancel,
    loading = false,
}) => {
    const [selectedImage, setSelectedImage] = useState(null);

    const GUARDIAN_FIELD_MAP = {
        father: {
            guardianNationality: "fatherNationality",
            guardianNationalId:  "fatherNationalId",
            guardianPrefix:      "fatherPrefix",
            guardianFirstName:   "fatherFirstName",
            guardianLastName:    "fatherLastName",
            guardianDob:         "fatherDob",
            guardianPhone:       "fatherPhone",
            guardianRelationship: "",  // will be set to 'บิดา'
        },
        mother: {
            guardianNationality: "motherNationality",
            guardianNationalId:  "motherNationalId",
            guardianPrefix:      "motherPrefix",
            guardianFirstName:   "motherFirstName",
            guardianLastName:    "motherLastName",
            guardianDob:         "motherDob",
            guardianPhone:       "motherPhone",
            guardianRelationship: "",  // will be set to 'มารดา'
        },
    };

    const handleGuardianTypeChange = (type) => {
        setValue("guardianParentType", type);
        if (type === "father" || type === "mother") {
            const map = GUARDIAN_FIELD_MAP[type];
            for (const [guardianField, sourceField] of Object.entries(map)) {
                if (guardianField === "guardianRelationship") {
                    setValue(guardianField, type === "father" ? "บิดา" : "มารดา");
                } else {
                    setValue(guardianField, sourceField ? getValues(sourceField) : "");
                }
            }
        } else {
            // Clear all guardian fields
            for (const field of [
                "guardianNationality", "guardianNationalId", "guardianPrefix",
                "guardianFirstName", "guardianLastName", "guardianRelationship",
                "guardianDob", "guardianPhone",
            ]) {
                setValue(field, "");
            }
        }
    };

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        getValues,
        formState: { errors, isDirty },
    } = useForm({
        defaultValues: mapProfileToFormValues(profile),
    });

    useEffect(() => {
        if (profile) {
            reset(mapProfileToFormValues(profile));
        }
    }, [profile, reset]);


    const onSubmit = async (data) => {

        const basicProfile = {
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
        };

        // Re-sync guardian fields from father/mother at submit time
        // to capture any changes made AFTER selecting guardian type
        const guardianType = data.guardianParentType;
        if (guardianType === "father" || guardianType === "mother") {
            const map = GUARDIAN_FIELD_MAP[guardianType];
            for (const [guardianField, sourceField] of Object.entries(map)) {
                if (guardianField === "guardianRelationship") {
                    data[guardianField] = guardianType === "father" ? "บิดา" : "มารดา";
                } else if (sourceField) {
                    data[guardianField] = data[sourceField];
                }
            }
        }

        const studentProfile = {
            // Use nullish coalescing (??) to ensure we send empty string instead of undefined
            studentId: data.studentId ?? "",
            nationality: data.nationality ?? "",
            nationalId: data.nationalId ?? "",
            prefix: data.prefix ?? "",
            firstNameTH: data.firstNameTH ?? "",
            lastNameTH: data.lastNameTH ?? "",
            firstNameEN: data.firstNameEN ?? "",
            lastNameEN: data.lastNameEN ?? "",
            dateOfBirth: data.dateOfBirth || null,
            birthProvince: data.birthProvince ?? "",
            ethnicity: data.ethnicity ?? "",
            religion: data.religion ?? "",
            bloodType: data.bloodType ?? "",
            maritalStatus: data.maritalStatus ?? "",
            talents: data.talents ?? "",
            sports: data.sports ?? "",
            height: data.height ? parseFloat(data.height) : null,
            weight: data.weight ? parseFloat(data.weight) : null,
            gender: data.gender ?? "",

            previousEducation: {
                schoolName: data.prevSchoolName ?? "",
                qualification: data.prevQualification ?? "",
                graduationDate: data.prevGraduationDate || null,
                gpa: data.prevGpa ? parseFloat(data.prevGpa) : null,
            },

            address: {
                houseCode: data.houseCode ?? "",
                village: data.village ?? "",
                houseNumber: data.houseNumber ?? "",
                moo: data.moo ?? "",
                soi: data.soi ?? "",
                road: data.road ?? "",
                province: data.province ?? "",
                district: data.district ?? "",
                subDistrict: data.subDistrict ?? "",
                postalCode: data.postalCode ?? "",
                homePhone: data.homePhone ?? "",
                mobilePhone: data.mobilePhone ?? "",
                email: data.addressEmail ?? "",
            },

            father: {
                nationality: data.fatherNationality ?? "",
                nationalId: data.fatherNationalId ?? "",
                prefix: data.fatherPrefix ?? "",
                firstName: data.fatherFirstName ?? "",
                lastName: data.fatherLastName ?? "",
                status: data.fatherStatus ?? "",
                education: data.fatherEducation ?? "",
                dateOfBirth: data.fatherDob || null,
                phone: data.fatherPhone ?? "",
            },

            mother: {
                nationality: data.motherNationality ?? "",
                nationalId: data.motherNationalId ?? "",
                prefix: data.motherPrefix ?? "",
                firstName: data.motherFirstName ?? "",
                lastName: data.motherLastName ?? "",
                status: data.motherStatus ?? "",
                education: data.motherEducation ?? "",
                dateOfBirth: data.motherDob || null,
                phone: data.motherPhone ?? "",
            },

            guardian: {
                nationality: data.guardianNationality ?? "",
                nationalId: data.guardianNationalId ?? "",
                prefix: data.guardianPrefix ?? "",
                firstName: data.guardianFirstName ?? "",
                lastName: data.guardianLastName ?? "",
                relationship: data.guardianRelationship ?? "",
                dateOfBirth: data.guardianDob || null,
                phone: data.guardianPhone ?? "",
            },

            emergencyContact: {
                prefix: data.emergencyPrefix ?? "",
                firstName: data.emergencyFirstName ?? "",
                lastName: data.emergencyLastName ?? "",
            },

            education: {
                faculty: data.faculty ?? "",
                department: data.department ?? "",
                year: data.year ? parseInt(data.year) : null,
                gpa: data.gpa ? parseFloat(data.gpa) : null,
            },
        };

        await onSave(basicProfile, studentProfile, selectedImage);
    };

    const SectionTitle = ({ children }) => (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            {children}
        </h3>
    );

    const FormField = ({ label, id, type = "text", ...props }) => (
        <div>
            <Label htmlFor={id} className="text-sm text-gray-600">{label}</Label>
            <Input id={id} type={type} {...register(id)} className="mt-1" {...props} />
        </div>
    );

    const DateFormField = ({ label, id, ...props }) => (
        <div>
            <Label htmlFor={id} className="text-sm text-gray-600">{label}</Label>
            <DatePicker
                value={watch(id)}
                onChange={(val) => setValue(id, typeof val === 'string' ? val : val?.target?.value || "")}
                name={id}
                label={label}
                className="mt-1"
                {...props}
            />
        </div>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Image */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <SectionTitle>รูปโปรไฟล์</SectionTitle>
                <ImageUpload
                    currentImage={profile?.profileImage}
                    onImageSelect={setSelectedImage}
                />
            </div>

            {/* 1. Personal Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <SectionTitle>1. ข้อมูลส่วนบุคคล</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <FormField label="รหัสนักศึกษา" id="studentId" />
                    <FormField label="สัญชาติ" id="nationality" />
                    <FormField label="เลขประจำตัวประชาชน/Passport" id="nationalId" />
                    <div>
                        <Label className="text-sm text-gray-600">วันที่ออกบัตร</Label>
                        <p className="mt-1 px-3 py-2 text-sm bg-gray-100 rounded-md text-gray-600">
                            {profile?.studentProfile?.cardIssueDate
                                ? new Date(profile.studentProfile.cardIssueDate).toLocaleDateString("th-TH", { year: "numeric", month: "2-digit", day: "2-digit" })
                                : "(ระบบตั้งค่าอัตโนมัติเมื่อบันทึก)"}
                        </p>
                    </div>
                    <div>
                        <Label className="text-sm text-gray-600">วันหมดอายุ</Label>
                        <p className="mt-1 px-3 py-2 text-sm bg-gray-100 rounded-md text-gray-600">
                            {profile?.studentProfile?.cardExpiryDate
                                ? new Date(profile.studentProfile.cardExpiryDate).toLocaleDateString("th-TH", { year: "numeric", month: "2-digit", day: "2-digit" })
                                : "(ระบบตั้งค่าอัตโนมัติเมื่อบันทึก)"}
                        </p>
                    </div>
                    <div>
                        <Label htmlFor="prefix" className="text-sm text-gray-600">คำนำหน้า</Label>
                        <select
                            id="prefix"
                            {...register("prefix")}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">เลือก</option>
                            <option value="นาย">นาย</option>
                            <option value="นาง">นาง</option>
                            <option value="นางสาว">นางสาว</option>
                        </select>
                    </div>
                    <FormField label="ชื่อ (ไทย)" id="firstNameTH" />
                    <FormField label="นามสกุล (ไทย)" id="lastNameTH" />
                    <FormField label="ชื่อ (English)" id="firstNameEN" />
                    <FormField label="นามสกุล (English)" id="lastNameEN" />
                    <DateFormField label="วันเดือนปีเกิด" id="dateOfBirth" />
                    <FormField label="ภูมิลำเนาเดิมจังหวัด" id="birthProvince" />
                    <FormField label="เชื้อชาติ" id="ethnicity" />
                    <FormField label="ศาสนา" id="religion" />
                    <div>
                        <Label htmlFor="bloodType" className="text-sm text-gray-600">หมู่โลหิต</Label>
                        <select
                            id="bloodType"
                            {...register("bloodType")}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">เลือก</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="AB">AB</option>
                            <option value="O">O</option>
                        </select>
                    </div>
                    <FormField label="สถานภาพสมรส" id="maritalStatus" />
                    <FormField label="ความถนัด/ความสนใจพิเศษ" id="talents" />
                    <FormField label="ความสามารถด้านกีฬา" id="sports" />
                    <FormField label="ส่วนสูง (ซม.)" id="height" type="number" />
                    <FormField label="น้ำหนัก (กก.)" id="weight" type="number" />
                </div>
            </div>

            {/* 2. Previous Education */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <SectionTitle>2. ข้อมูลการศึกษาเดิม</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField label="ชื่อสถานศึกษาเดิม" id="prevSchoolName" />
                    <FormField label="วุฒิการศึกษา" id="prevQualification" />
                    <DateFormField label="วันที่สำเร็จการศึกษา" id="prevGraduationDate" />
                    <FormField label="ระดับคะแนนเฉลี่ย" id="prevGpa" type="number" step="0.01" min="0" max="4" />
                </div>
            </div>

            {/* 3. Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <SectionTitle>3. ข้อมูลที่อยู่</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <FormField label="รหัสประจำบ้าน" id="houseCode" />
                    <FormField label="หมู่บ้าน/อาคาร" id="village" />
                    <FormField label="บ้านเลขที่" id="houseNumber" />
                    <FormField label="หมู่ที่" id="moo" />
                    <FormField label="ตรอก/ซอย" id="soi" />
                    <FormField label="ถนน" id="road" />
                    <FormField label="จังหวัด" id="province" />
                    <FormField label="อำเภอ/เขต" id="district" />
                    <FormField label="ตำบล/แขวง" id="subDistrict" />
                    <FormField label="รหัสไปรษณีย์" id="postalCode" />
                    <FormField label="โทรศัพท์บ้าน" id="homePhone" />
                    <FormField label="โทรศัพท์มือถือ" id="mobilePhone" />
                    <FormField label="E-mail" id="addressEmail" type="email" />
                </div>
            </div>

            {/* 4. Father Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <SectionTitle>4. ข้อมูลบิดา</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField label="สัญชาติ" id="fatherNationality" />
                    <FormField label="เลขประจำตัวประชาชน" id="fatherNationalId" />
                    <div>
                        <Label htmlFor="fatherPrefix" className="text-sm text-gray-600">คำนำหน้า</Label>
                        <select
                            id="fatherPrefix"
                            {...register("fatherPrefix")}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">เลือก</option>
                            <option value="นาย">นาย</option>
                        </select>
                    </div>
                    <FormField label="ชื่อ" id="fatherFirstName" />
                    <FormField label="นามสกุล" id="fatherLastName" />
                    <div>
                        <Label htmlFor="fatherStatus" className="text-sm text-gray-600">สถานะภาพ</Label>
                        <select
                            id="fatherStatus"
                            {...register("fatherStatus")}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">เลือก</option>
                            <option value="มีชีวิตอยู่">มีชีวิตอยู่</option>
                            <option value="ถึงแก่กรรม">ถึงแก่กรรม</option>
                        </select>
                    </div>
                    <FormField label="วุฒิการศึกษาสูงสุด" id="fatherEducation" />
                    <DateFormField label="วันเดือนปีเกิด" id="fatherDob" />
                    <FormField label="เบอร์โทร" id="fatherPhone" />
                </div>
            </div>

            {/* 5. Mother Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <SectionTitle>5. ข้อมูลมารดา</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField label="สัญชาติ" id="motherNationality" />
                    <FormField label="เลขประจำตัวประชาชน" id="motherNationalId" />
                    <div>
                        <Label htmlFor="motherPrefix" className="text-sm text-gray-600">คำนำหน้า</Label>
                        <select
                            id="motherPrefix"
                            {...register("motherPrefix")}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">เลือก</option>
                            <option value="นาง">นาง</option>
                            <option value="นางสาว">นางสาว</option>
                        </select>
                    </div>
                    <FormField label="ชื่อ" id="motherFirstName" />
                    <FormField label="นามสกุล" id="motherLastName" />
                    <div>
                        <Label htmlFor="motherStatus" className="text-sm text-gray-600">สถานะภาพ</Label>
                        <select
                            id="motherStatus"
                            {...register("motherStatus")}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">เลือก</option>
                            <option value="มีชีวิตอยู่">มีชีวิตอยู่</option>
                            <option value="ถึงแก่กรรม">ถึงแก่กรรม</option>
                        </select>
                    </div>
                    <FormField label="วุฒิการศึกษาสูงสุด" id="motherEducation" />
                    <DateFormField label="วันเดือนปีเกิด" id="motherDob" />
                    <FormField label="เบอร์โทร" id="motherPhone" />
                </div>
            </div>

            {/* 6. Guardian Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <SectionTitle>6. ข้อมูลผู้ปกครอง</SectionTitle>

                {/* Guardian type selector */}
                <div className="mb-4 flex gap-2">
                    {[
                        { value: "father", label: "บิดา" },
                        { value: "mother", label: "มารดา" },
                        { value: "other",  label: "บุคคลอื่น" },
                    ].map(({ value, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => handleGuardianTypeChange(value)}
                            className={[
                                "px-5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150",
                                watch("guardianParentType") === value
                                    ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                                    : "bg-white text-gray-500 border-gray-300 hover:border-gray-500 hover:text-gray-700",
                            ].join(" ")}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField label="สัญชาติ" id="guardianNationality" />
                    <FormField label="เลขประจำตัวประชาชน" id="guardianNationalId" />
                    <div>
                        <Label htmlFor="guardianPrefix" className="text-sm text-gray-600">คำนำหน้า</Label>
                        <select
                            id="guardianPrefix"
                            {...register("guardianPrefix")}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">เลือก</option>
                            <option value="นาย">นาย</option>
                            <option value="นาง">นาง</option>
                            <option value="นางสาว">นางสาว</option>
                        </select>
                    </div>
                    <FormField label="ชื่อ" id="guardianFirstName" />
                    <FormField label="นามสกุล" id="guardianLastName" />
                    <FormField label="ความสัมพันธ์" id="guardianRelationship" />
                    <DateFormField label="วันเดือนปีเกิด" id="guardianDob" />
                    <FormField label="เบอร์โทร" id="guardianPhone" />
                </div>
            </div>

            {/* 7. Emergency Contact */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <SectionTitle>7. ข้อมูลติดต่อบุคคลกรณีฉุกเฉิน</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="emergencyPrefix" className="text-sm text-gray-600">คำนำหน้า</Label>
                        <select
                            id="emergencyPrefix"
                            {...register("emergencyPrefix")}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">เลือก</option>
                            <option value="นาย">นาย</option>
                            <option value="นาง">นาง</option>
                            <option value="นางสาว">นางสาว</option>
                        </select>
                    </div>
                    <FormField label="ชื่อ" id="emergencyFirstName" />
                    <FormField label="นามสกุล" id="emergencyLastName" />
                </div>
            </div>

            {/* Current Education (Additional) */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <SectionTitle>ข้อมูลการศึกษาปัจจุบัน</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField label="คณะ" id="faculty" />
                    <FormField label="สาขา" id="department" />
                    <div>
                        <Label htmlFor="year" className="text-sm text-gray-600">ชั้นปี</Label>
                        <select
                            id="year"
                            {...register("year")}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">เลือก</option>
                            <option value="1">ปี 1</option>
                            <option value="2">ปี 2</option>
                            <option value="3">ปี 3</option>
                            <option value="4">ปี 4</option>
                            <option value="5">ปี 5</option>
                            <option value="6">ปี 6</option>
                        </select>
                    </div>
                    <FormField label="GPA" id="gpa" type="number" step="0.01" min="0" max="4" />
                </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                >
                    ยกเลิก
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </Button>
            </div>
        </form>
    );
};

export default ProfileEditForm;
