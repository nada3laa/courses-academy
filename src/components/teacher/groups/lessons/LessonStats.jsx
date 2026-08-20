import React, { useState } from "react";
import {
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineX,
} from "react-icons/hi";

const StatCard = ({ icon, value, label, iconBg, iconColor, onClick, clickable }) => (
  <div
    onClick={onClick}
    className={`flex-1 bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all ${
      clickable ? "cursor-pointer active:scale-[0.98]" : ""
    }`}
    dir="rtl"
  >
    <div className={`p-3 rounded-lg ${iconBg} flex items-center justify-center`}>
      <span className={`${iconColor} flex items-center`}>{icon}</span>
    </div>

    <div className="text-right">
      <h3
        className="text-2xl font-bold text-gray-800"
        style={{ fontFamily: "Tajawal, sans-serif" }}
      >
        {value}
      </h3>
      <p
        className="text-gray-500 text-sm mt-1"
        style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
      >
        {label}
      </p>
    </div>
  </div>
);

// موديال عرض قائمة الطلاب (حضور / غياب)
const StudentsModal = ({ open, onClose, title, students, type }) => {
  if (!open) return null;

  const isAttendance = type === "attendance";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isAttendance ? "bg-[#E6F9EE]" : "bg-[#FDECEA]"
          }`}
        >
          <div className="flex items-center gap-2">
            {isAttendance ? (
              <HiOutlineCheckCircle className="text-[#00A63E]" size={22} />
            ) : (
              <HiOutlineXCircle className="text-[#D32F2F]" size={22} />
            )}
            <h2
              className="text-lg font-bold text-gray-800"
              style={{ fontFamily: "Tajawal, sans-serif" }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-white/60"
          >
            <HiOutlineX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-80 overflow-y-auto px-3 py-2">
          {students.length === 0 ? (
            <p
              className="text-center text-gray-400 py-8 text-sm"
              style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
            >
              لا يوجد طلاب في هذه القائمة
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {students.map((student, idx) => (
                <li
                  key={student.id ?? idx}
                  className="flex items-center gap-3 py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      isAttendance
                        ? "bg-[#E6F9EE] text-[#00A63E]"
                        : "bg-[#FDECEA] text-[#D32F2F]"
                    }`}
                  >
                    {student.name?.charAt(0) ?? "?"}
                  </div>
                  <span
                    className="text-gray-700 text-sm font-medium"
                    style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
                  >
                    {student.name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-gray-50 text-left">
          <span
            className="text-xs text-gray-400"
            style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
          >
            إجمالي: {students.length} طالب
          </span>
        </div>
      </div>
    </div>
  );
};

const LessonStats = ({
  totalStudents = 22,
  attendance = 18,
  absence = 4,
  attendanceList = [],
  absenceList = [],
}) => {
  const [modalType, setModalType] = useState(null); // "attendance" | "absence" | null

  return (
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
        clickable
        onClick={() => setModalType("attendance")}
      />
      <StatCard
        icon={<HiOutlineXCircle size={24} />}
        value={absence}
        label="الغياب"
        iconBg="bg-[#FDECEA]"
        iconColor="text-[#D32F2F]"
        clickable
        onClick={() => setModalType("absence")}
      />

      <StudentsModal
        open={modalType === "attendance"}
        onClose={() => setModalType(null)}
        title="قائمة الطلاب الحاضرين"
        students={attendanceList}
        type="attendance"
      />
      <StudentsModal
        open={modalType === "absence"}
        onClose={() => setModalType(null)}
        title="قائمة الطلاب الغائبين"
        students={absenceList}
        type="absence"
      />
    </div>
  );
};

export default LessonStats;