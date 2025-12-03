// frontend/src/pages/student/HomeworkList.jsx
import React from "react";
import { Folder } from "lucide-react";
import StudentHeader from "@/components/student/StudentHeader";

const mockCourses = [];
const HomeworkList = () => {
  return (
    <div className="flex flex-col h-full">
      <StudentHeader title="HOMEWORK LIST" />

      <section className="flex-1 px-8 py-6 bg-[#e5e5e5]">
        <div className="space-y-3 max-w-5xl">
          {mockCourses.map((c) => (
            <button
              key={c.code}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-md bg-white shadow-sm hover:bg-[#f7f7f7] text-left"
            >
              <Folder className="w-5 h-5 text-[#c2c2c2]" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#333]">
                  {c.code}
                </span>
                <span className="text-[11px] text-[#999]">{c.name}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeworkList;