// frontend/src/pages/student/HomeworkList.jsx
// หน้ารวมวิชา - แสดงกล่องวิชาให้คลิกเข้าไป
import React, { useState, useEffect, useMemo } from "react";
import { FileText, RefreshCw, BookOpen, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { homeworkService } from "@/services/homeworkService";
import StudentHeader from "@/components/student/StudentHeader";

// สีสำหรับกล่องวิชา
const COLORS = [
  { bg: "bg-gradient-to-br from-blue-500 to-blue-600", light: "bg-blue-50" },
  { bg: "bg-gradient-to-br from-purple-500 to-purple-600", light: "bg-purple-50" },
  { bg: "bg-gradient-to-br from-green-500 to-green-600", light: "bg-green-50" },
  { bg: "bg-gradient-to-br from-orange-500 to-orange-600", light: "bg-orange-50" },
  { bg: "bg-gradient-to-br from-pink-500 to-pink-600", light: "bg-pink-50" },
  { bg: "bg-gradient-to-br from-teal-500 to-teal-600", light: "bg-teal-50" },
];

const HomeworkList = () => {
  const navigate = useNavigate();
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHomework();
  }, []);

  const fetchHomework = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await homeworkService.getMyHomework();
      if (response.success) {
        setHomework(response.data);
      }
    } catch (err) {
      console.error("Error fetching homework:", err);
      setError("ไม่สามารถโหลดข้อมูลการบ้านได้");
    } finally {
      setLoading(false);
    }
  };

  // จัดกลุ่มการบ้านตามวิชา
  const groupedClasses = useMemo(() => {
    const groups = {};
    homework.forEach((hw) => {
      const classId = hw.class?._id || "unknown";
      if (!groups[classId]) {
        groups[classId] = {
          classId,
          classCode: hw.class?.classCode || "ไม่ระบุ",
          className: hw.class?.className || "วิชาไม่ระบุ",
          total: 0,
          pending: 0,
          submitted: 0,
          graded: 0,
        };
      }
      groups[classId].total++;
      if (hw.submitted) {
        if (hw.submission?.status === "graded") {
          groups[classId].graded++;
        } else {
          groups[classId].submitted++;
        }
      } else {
        groups[classId].pending++;
      }
    });
    return Object.values(groups);
  }, [homework]);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <StudentHeader title="HOMEWORK" />
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <StudentHeader title="HOMEWORK" />

      <section className="flex-1 px-6 py-6 bg-gray-100 overflow-y-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">วิชาของฉัน</h2>
            <p className="text-sm text-gray-500">
              เลือกวิชาเพื่อดูการบ้าน
            </p>
          </div>
          <button
            onClick={fetchHomework}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-600">
            {error}
          </div>
        )}

        {groupedClasses.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              ยังไม่มีการบ้าน
            </h3>
            <p className="text-gray-500">
              อาจารย์ยังไม่ได้สั่งการบ้านในวิชาที่คุณลงทะเบียน
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedClasses.map((cls, index) => {
              const color = COLORS[index % COLORS.length];

              return (
                <div
                  key={cls.classId}
                  onClick={() => navigate(`/student/homework/class/${cls.classId}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-100 group"
                >
                  {/* Header สี */}
                  <div className={`${color.bg} p-5 relative`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-white">
                        <h3 className="font-bold text-lg">{cls.classCode}</h3>
                        <p className="text-white/80 text-sm truncate max-w-[150px]">
                          {cls.className}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Stats */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {cls.pending > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                            <span className="text-sm text-gray-600">
                              {cls.pending} รอส่ง
                            </span>
                          </div>
                        )}
                        {cls.submitted > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span className="text-sm text-gray-600">
                              {cls.submitted} ส่งแล้ว
                            </span>
                          </div>
                        )}
                        {cls.graded > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm text-gray-600">
                              {cls.graded} ตรวจแล้ว
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {cls.total} การบ้าน
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                      {cls.graded > 0 && (
                        <div
                          className="bg-green-500"
                          style={{ width: `${(cls.graded / cls.total) * 100}%` }}
                        />
                      )}
                      {cls.submitted > 0 && (
                        <div
                          className="bg-blue-500"
                          style={{ width: `${(cls.submitted / cls.total) * 100}%` }}
                        />
                      )}
                      {cls.pending > 0 && (
                        <div
                          className="bg-yellow-400"
                          style={{ width: `${(cls.pending / cls.total) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomeworkList;