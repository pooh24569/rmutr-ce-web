
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Users, Clock, MapPin, MoreVertical, Edit, Trash2, Eye, BookOpen, Download } from "lucide-react";
import CreateClassModal from "./components/CreateClassModal";
import { classService } from "@/services/classService";
import registrationService from "@/services/registrationService";
import { toast } from "sonner";

const Classes = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [registrationCourses, setRegistrationCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    useEffect(() => {
        fetchClasses();
        fetchRegistrationCourses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await classService.getMyClasses();
            if (response.success) {
                setClasses(response.data);
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRegistrationCourses = async () => {
        try {
            const response = await registrationService.getTeachingCourses();
            if (response.success) {
                const regCourses = response.data;
                setRegistrationCourses(regCourses);
                const regCourseCodes = regCourses.map(c => c.courseCode);

                for (const course of regCourses) {
                    const existingClass = classes.find(c => c.classCode === course.courseCode);
                    if (!existingClass) {
                        try {
                            const classData = {
                                classCode: course.courseCode,
                                className: course.courseName,
                                section: course.section,
                                schedule: course.schedule || [],
                                academicYear: "2567",
                                semester: "1",
                                isFromRegistration: true,
                            };
                            await classService.createClass(classData);
                        } catch (err) {
                            console.log(`Class ${course.courseCode} อาจมีอยู่แล้ว`);
                        }
                    }
                }

                const classesResponse = await classService.getMyClasses();
                if (classesResponse.success) {

                    const filteredByReg = classesResponse.data.filter(c => {
                        if (c.isFromRegistration) {

                            return regCourseCodes.includes(c.classCode);
                        }

                        return true;
                    });
                    setClasses(filteredByReg);
                }
            }
        } catch (error) {
            console.error("Error fetching registration courses:", error);
        }
    };

    const handleCreateClass = async (classData) => {
        try {
            const response = await classService.createClass(classData);
            if (response.success) {
                setClasses([response.data, ...classes]);
                setShowCreateModal(false);
            }
        } catch (error) {
            console.error("Error creating class:", error);
        }
    };

    const handleDeleteClass = async (classId) => {
        if (!window.confirm("Are you sure you want to delete this class?")) return;

        try {
            const response = await classService.deleteClass(classId);
            if (response.success) {
                setClasses(classes.filter((c) => c._id !== classId));
            }
        } catch (error) {
            console.error("Error deleting class:", error);
        }
    };

    const filteredClasses = classes.filter(
        (c) =>
            c.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.classCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDayLabel = (day) => {
        const days = {
            monday: "จันทร์",
            tuesday: "อังคาร",
            wednesday: "พุธ",
            thursday: "พฤหัส",
            friday: "ศุกร์",
            saturday: "เสาร์",
            sunday: "อาทิตย์",
        };
        return days[day] || day;
    };

    return (
        <div className="p-6 space-y-6">
            { }
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
                    <p className="text-gray-500">View your assigned classes and students</p>
                </div>
            </div>

            { }
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search classes by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </div>

            { }
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <BookOpenIcon className="w-16 h-16 mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No classes found</p>
                    <p className="text-sm">Create your first class to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClasses.map((classItem) => (
                        <div
                            key={classItem._id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                        >
                            { }
                            <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 p-4 relative">
                                <div className="text-white">
                                    <p className="text-sm font-medium opacity-80">{classItem.classCode}</p>
                                    <h3 className="text-lg font-bold truncate">{classItem.className}</h3>
                                </div>
                            </div>

                            { }
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="w-4 h-4" />
                                    <span>{classItem.students?.length || 0} students</span>
                                    <span className="text-gray-300">•</span>
                                    <span>Section {classItem.section}</span>
                                </div>

                                { }
                                {classItem.schedule?.length > 0 && (
                                    <div className="space-y-1">
                                        {classItem.schedule.slice(0, 2).map((sch, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                <span>
                                                    {getDayLabel(sch.day)} {sch.startTime} - {sch.endTime}
                                                </span>
                                                <MapPin className="w-4 h-4 ml-2" />
                                                <span>{sch.room}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                { }
                                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => navigate(`/teacher/classes/${classItem._id}`)}
                                        className="group flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    >
                                        <Eye className="w-4 h-4 group-hover:animate-blink" />
                                        <span>View</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            { }
            {showCreateModal && (
                <CreateClassModal
                    isOpen={showCreateModal}
                    onClose={() => {
                        setShowCreateModal(false);
                        setSelectedClass(null);
                    }}
                    onSubmit={handleCreateClass}
                    editData={selectedClass}
                    onRefresh={fetchClasses}
                />
            )}
        </div>
    );
};

const BookOpenIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

export default Classes;
