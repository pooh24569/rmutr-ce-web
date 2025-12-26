import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/form/ImageUpload";

/**
 * Profile Edit Form Component
 * Form for editing user and student profile
 */
export const ProfileEditForm = ({
    profile,
    onSave,
    onCancel,
    loading = false,
}) => {
    const [selectedImage, setSelectedImage] = useState(null);

    // ตรวจสอบว่าเป็นภาษาไทยหรือไม่
    const isThai = (text) => /[\u0E00-\u0E7F]/.test(text || "");

    // แยกชื่อไทย/อังกฤษให้ถูกช่อง
    const firstName = profile?.firstName || "";
    const lastName = profile?.lastName || "";
    const firstNameTH = profile?.studentProfile?.firstNameTH || "";
    const lastNameTH = profile?.studentProfile?.lastNameTH || "";

    // ถ้า firstName เป็นไทย ให้ไปอยู่ช่อง TH แทน
    const defaultFirstNameEN = !isThai(firstName) ? firstName : "";
    const defaultLastNameEN = !isThai(lastName) ? lastName : "";
    const defaultFirstNameTH = firstNameTH || (isThai(firstName) ? firstName : "");
    const defaultLastNameTH = lastNameTH || (isThai(lastName) ? lastName : "");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            // Basic profile - ใช้ค่าที่แยกภาษาแล้ว
            firstName: defaultFirstNameEN,
            lastName: defaultLastNameEN,
            phoneNumber: profile?.phoneNumber || "",

            // Student profile
            studentId: profile?.studentProfile?.studentId || "",
            firstNameTH: defaultFirstNameTH,
            lastNameTH: defaultLastNameTH,
            dateOfBirth: profile?.studentProfile?.dateOfBirth
                ? new Date(profile.studentProfile.dateOfBirth)
                    .toISOString()
                    .split("T")[0]
                : "",
            gender: profile?.studentProfile?.gender || "",
            cardIssueDate: profile?.studentProfile?.cardIssueDate
                ? new Date(profile.studentProfile.cardIssueDate)
                    .toISOString()
                    .split("T")[0]
                : "",
            cardExpiryDate: profile?.studentProfile?.cardExpiryDate
                ? new Date(profile.studentProfile.cardExpiryDate)
                    .toISOString()
                    .split("T")[0]
                : "",

            // Address
            street: profile?.studentProfile?.address?.street || "",
            district: profile?.studentProfile?.address?.district || "",
            province: profile?.studentProfile?.address?.province || "",
            postalCode: profile?.studentProfile?.address?.postalCode || "",

            // Education
            faculty: profile?.studentProfile?.education?.faculty || "",
            department: profile?.studentProfile?.education?.department || "",
            year: profile?.studentProfile?.education?.year || "",
            gpa: profile?.studentProfile?.education?.gpa || "",

            // Emergency contact
            emergencyName: profile?.studentProfile?.emergencyContact?.name || "",
            emergencyRelationship:
                profile?.studentProfile?.emergencyContact?.relationship || "",
            emergencyPhone:
                profile?.studentProfile?.emergencyContact?.phoneNumber || "",
        },
    });

    const onSubmit = async (data) => {
        // Split data into basic profile and student profile
        const basicProfile = {
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
        };

        const studentProfile = {
            studentId: data.studentId,
            firstNameTH: data.firstNameTH,
            lastNameTH: data.lastNameTH,
            dateOfBirth: data.dateOfBirth || null,
            gender: data.gender,
            cardIssueDate: data.cardIssueDate || null,
            cardExpiryDate: data.cardExpiryDate || null,
            address: {
                street: data.street,
                district: data.district,
                province: data.province,
                postalCode: data.postalCode,
            },
            education: {
                faculty: data.faculty,
                department: data.department,
                year: data.year ? parseInt(data.year) : null,
                gpa: data.gpa ? parseFloat(data.gpa) : null,
            },
            emergencyContact: {
                name: data.emergencyName,
                relationship: data.emergencyRelationship,
                phoneNumber: data.emergencyPhone,
            },
        };

        await onSave(basicProfile, studentProfile, selectedImage);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Image */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Profile Image
                </h3>
                <ImageUpload
                    currentImage={profile?.profileImage}
                    onImageSelect={setSelectedImage}
                />
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="firstName">First Name </Label>
                        <Input
                            id="firstName"
                            {...register("firstName", { required: "First name is required" })}
                            className="mt-1"
                        />
                        {errors.firstName && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.firstName.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="lastName">Last Name </Label>
                        <Input
                            id="lastName"
                            {...register("lastName", { required: "Last name is required" })}
                            className="mt-1"
                        />
                        {errors.lastName && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.lastName.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="firstNameTH">ชื่อ </Label>
                        <Input id="firstNameTH" {...register("firstNameTH")} className="mt-1" />
                    </div>

                    <div>
                        <Label htmlFor="lastNameTH">นามสกุล </Label>
                        <Input id="lastNameTH" {...register("lastNameTH")} className="mt-1" />
                    </div>

                    <div>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                            id="phoneNumber"
                            type="tel"
                            inputMode="numeric"
                            {...register("phoneNumber", {
                                pattern: {
                                    value: /^[0-9]{9,10}$/,
                                    message: "Phone number must be 9-10 digits",
                                },
                            })}
                            className="mt-1"
                            onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                        />
                        {errors.phoneNumber && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.phoneNumber.message}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Student Information */}
            {profile?.role === "student" && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Student Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="studentId">Student ID</Label>
                            <Input
                                id="studentId"
                                {...register("studentId", {
                                    required: "Student ID is required",
                                    pattern: {
                                        value: /^[0-9]{13}$/,
                                        message: "Student ID must be 13 digits",
                                    },
                                })}
                                className="mt-1"
                                placeholder="6512345678901"
                            />
                            {errors.studentId && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.studentId.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                {...register("dateOfBirth")}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="gender">Gender</Label>
                            <select
                                id="gender"
                                {...register("gender")}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="cardIssueDate">Card Issue Date</Label>
                            <Input
                                id="cardIssueDate"
                                type="date"
                                {...register("cardIssueDate")}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="cardExpiryDate">Card Expiry Date</Label>
                            <Input
                                id="cardExpiryDate"
                                type="date"
                                {...register("cardExpiryDate")}
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Education */}
            {profile?.role === "student" && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="faculty">Faculty</Label>
                            <Input id="faculty" {...register("faculty")} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" {...register("department")} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="year">Year</Label>
                            <select
                                id="year"
                                {...register("year")}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select year</option>
                                <option value="1">Year 1</option>
                                <option value="2">Year 2</option>
                                <option value="3">Year 3</option>
                                <option value="4">Year 4</option>
                                <option value="5">Year 5</option>
                                <option value="6">Year 6</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="gpa">GPA</Label>
                            <Input
                                id="gpa"
                                type="number"
                                step="0.01"
                                min="0"
                                max="4"
                                {...register("gpa", {
                                    min: { value: 0, message: "GPA cannot be negative" },
                                    max: { value: 4, message: "GPA cannot exceed 4.0" },
                                })}
                                className="mt-1"
                                placeholder="3.50"
                            />
                            {errors.gpa && (
                                <p className="text-red-500 text-sm mt-1">{errors.gpa.message}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Address */}
            {profile?.role === "student" && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Label htmlFor="street">Street Address</Label>
                            <Textarea id="street" {...register("street")} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="district">District</Label>
                                <Input id="district" {...register("district")} className="mt-1" />
                            </div>

                            <div>
                                <Label htmlFor="province">Province</Label>
                                <Input id="province" {...register("province")} className="mt-1" />
                            </div>

                            <div>
                                <Label htmlFor="postalCode">Postal Code</Label>
                                <Input
                                    id="postalCode"
                                    {...register("postalCode", {
                                        pattern: {
                                            value: /^[0-9]{5}$/,
                                            message: "Postal code must be 5 digits",
                                        },
                                    })}
                                    className="mt-1"
                                    placeholder="10400"
                                />
                                {errors.postalCode && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.postalCode.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Emergency Contact */}
            {profile?.role === "student" && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="emergencyName">Name</Label>
                            <Input
                                id="emergencyName"
                                {...register("emergencyName")}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="emergencyRelationship">Relationship</Label>
                            <Input
                                id="emergencyRelationship"
                                {...register("emergencyRelationship")}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="emergencyPhone">Phone Number</Label>
                            <Input
                                id="emergencyPhone"
                                type="tel"
                                inputMode="numeric"
                                {...register("emergencyPhone", {
                                    pattern: {
                                        value: /^[0-9]{9,10}$/,
                                        message: "Phone number must be 9-10 digits",
                                    },
                                })}
                                className="mt-1"
                                onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                            />
                            {errors.emergencyPhone && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.emergencyPhone.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form>
    );
};

export default ProfileEditForm;
