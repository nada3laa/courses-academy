import React from "react";
import { HiOutlineUsers, HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";

const StatCard = ({ icon, value, label, iconBg, iconColor }) => (
  <div
    className="flex-1 bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all"
    dir="rtl"
  >
    <div className={`p-3 rounded-lg ${iconBg} flex items-center justify-center`}>
      <span className={`${iconColor} flex items-center`}>{icon}</span>
    </div>
    <div className="text-right">
      <h3 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Tajawal, sans-serif" }}>
        {value}
      </h3>
      <p className="text-gray-500 text-sm mt-1" style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}>
        {label}
      </p>
    </div>
  </div>
);

// For students we show their own attendance status instead of the whole class breakdown
const LessonStats = ({ totalStudents = 22, attendance = 18, absence = 4 }) => (
  <div className="flex flex-col sm:flex-row gap-4 w-full">
    <StatCard
      icon={<HiOutlineUsers size={24} />}
      value={totalStudents}
      label="إجمالي الطلاب"
      iconBg="bg-[#EAF4FF]"
      iconColor="text-[#123C91]"
    />
    <StatCard
      icon={<HiOutlineCheckCircle size={24} />}
      value={attendance}
      label="الحضور"
      iconBg="bg-[#E6F9EE]"
      iconColor="text-[#00A63E]"
    />
    <StatCard
      icon={<HiOutlineXCircle size={24} />}
      value={absence}
      label="الغياب"
      iconBg="bg-[#FDECEA]"
      iconColor="text-[#D32F2F]"
    />
  </div>
);

export default LessonStats;