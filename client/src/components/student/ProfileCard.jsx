import { User, Mail, Phone, Calendar, MapPin, GraduationCap } from "lucide-react";

/**
 * Profile Card Component
 * Displays user profile information in read-only mode
 */
export const ProfileCard = ({ profile }) => {
    if (!profile) return null;

    const { studentProfile } = profile;

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                        {profile.profileImage ? (
                            <img
                                src={profile.profileImage}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center">
                                <User className="w-12 h-12 text-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {profile.firstName && profile.lastName
                                ? `${profile.firstName} ${profile.lastName}`
                                : profile.username}
                        </h2>
                        {studentProfile?.firstNameTH && studentProfile?.lastNameTH && (
                            <p className="text-lg text-gray-600">
                                {studentProfile.firstNameTH} {studentProfile.lastNameTH}
                            </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {profile.role}
                            </span>
                            {profile.isAccountVerified && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                    ✓ Verified
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Contact Information
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{profile.email}</span>
                    </div>
                    {profile.phoneNumber && (
                        <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-700">{profile.phoneNumber}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Student Profile */}
            {studentProfile && (
                <>
                    {/* Student Information */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Student Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {studentProfile.studentId && (
                                <div>
                                    <p className="text-sm text-gray-500">Student ID</p>
                                    <p className="text-gray-900 font-medium">
                                        {studentProfile.studentId}
                                    </p>
                                </div>
                            )}
                            {studentProfile.dateOfBirth && (
                                <div>
                                    <p className="text-sm text-gray-500">Date of Birth</p>
                                    <p className="text-gray-900 font-medium">
                                        {new Date(studentProfile.dateOfBirth).toLocaleDateString(
                                            "th-TH"
                                        )}
                                    </p>
                                </div>
                            )}
                            {studentProfile.gender && (
                                <div>
                                    <p className="text-sm text-gray-500">Gender</p>
                                    <p className="text-gray-900 font-medium capitalize">
                                        {studentProfile.gender}
                                    </p>
                                </div>
                            )}
                            {studentProfile.cardIssueDate && (
                                <div>
                                    <p className="text-sm text-gray-500">Card Issue Date</p>
                                    <p className="text-gray-900 font-medium">
                                        {new Date(studentProfile.cardIssueDate).toLocaleDateString(
                                            "th-TH"
                                        )}
                                    </p>
                                </div>
                            )}
                            {studentProfile.cardExpiryDate && (
                                <div>
                                    <p className="text-sm text-gray-500">Card Expiry Date</p>
                                    <p className="text-gray-900 font-medium">
                                        {new Date(
                                            studentProfile.cardExpiryDate
                                        ).toLocaleDateString("th-TH")}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Education Information */}
                    {studentProfile.education && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <GraduationCap className="w-5 h-5 mr-2" />
                                Education
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {studentProfile.education.faculty && (
                                    <div>
                                        <p className="text-sm text-gray-500">Faculty</p>
                                        <p className="text-gray-900 font-medium">
                                            {studentProfile.education.faculty}
                                        </p>
                                    </div>
                                )}
                                {studentProfile.education.department && (
                                    <div>
                                        <p className="text-sm text-gray-500">Department</p>
                                        <p className="text-gray-900 font-medium">
                                            {studentProfile.education.department}
                                        </p>
                                    </div>
                                )}
                                {studentProfile.education.year && (
                                    <div>
                                        <p className="text-sm text-gray-500">Year</p>
                                        <p className="text-gray-900 font-medium">
                                            Year {studentProfile.education.year}
                                        </p>
                                    </div>
                                )}
                                {studentProfile.education.gpa !== null &&
                                    studentProfile.education.gpa !== undefined && (
                                        <div>
                                            <p className="text-sm text-gray-500">GPA</p>
                                            <p className="text-gray-900 font-medium">
                                                {studentProfile.education.gpa.toFixed(2)}
                                            </p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}

                    {/* Address */}
                    {studentProfile.address && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <MapPin className="w-5 h-5 mr-2" />
                                Address
                            </h3>
                            <p className="text-gray-700">
                                {[
                                    studentProfile.address.street,
                                    studentProfile.address.district,
                                    studentProfile.address.province,
                                    studentProfile.address.postalCode,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </p>
                        </div>
                    )}

                    {/* Emergency Contact */}
                    {studentProfile.emergencyContact?.name && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Emergency Contact
                            </h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="text-gray-900 font-medium">
                                        {studentProfile.emergencyContact.name}
                                    </p>
                                </div>
                                {studentProfile.emergencyContact.relationship && (
                                    <div>
                                        <p className="text-sm text-gray-500">Relationship</p>
                                        <p className="text-gray-900 font-medium">
                                            {studentProfile.emergencyContact.relationship}
                                        </p>
                                    </div>
                                )}
                                {studentProfile.emergencyContact.phoneNumber && (
                                    <div>
                                        <p className="text-sm text-gray-500">Phone Number</p>
                                        <p className="text-gray-900 font-medium">
                                            {studentProfile.emergencyContact.phoneNumber}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProfileCard;
