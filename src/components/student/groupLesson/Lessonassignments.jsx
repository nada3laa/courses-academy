import React from "react";
import { HiOutlineClipboardList, HiOutlineUpload } from "react-icons/hi";

const StatusPill = ({ status }) => {
  const styles = {
    "لم يتم التسليم": "bg-[#FDECEA] text-[#D32F2F]",
    "تم التسليم": "bg-[#E6F9EE] text-[#00A63E]",
    متأخر: "bg-[#FFF4E5] text-[#B45309]",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

const AssignmentRow = ({ title, dueDate, status, onOpen }) => (
  <div
    onClick={onOpen}
    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#E5E5E5] hover:border-gray-300 cursor-pointer transition-all"
  >
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-lg bg-[#EAF4FF] flex items-center justify-center shrink-0">
        <HiOutlineClipboardList size={18} className="text-[#123C91]" />
      </div>
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-[#1F2937] truncate" style={{ fontFamily: "IBM Plex Sans Arabic" }}>
          {title}
        </p>
        <p className="text-[12px] text-[#9CA3AF] mt-1" style={{ fontFamily: "IBM Plex Sans Arabic" }}>
          الموعد النهائي: {dueDate}
        </p>
      </div>
    </div>
    <StatusPill status={status} />
  </div>
);

const LessonAssignments = ({ assignments = [] }) => {
  const defaultAssignments = [
    { id: 1, title: "واجب التفاضل والتكامل", dueDate: "خلال يومين", status: "لم يتم التسليم" },
    { id: 2, title: "واجب المصفوفات", dueDate: "خلال 5 أيام", status: "تم التسليم" },
  ];

  const displayAssignments = assignments.length > 0 ? assignments : defaultAssignments;

  return (
    <div dir="rtl" className="bg-white rounded-2xl border border-[#E5E5E5] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[18px] font-semibold text-[#1F2937]" style={{ fontFamily: "IBM Plex Sans Arabic" }}>
          الواجبات
        </h3>
        <HiOutlineUpload size={18} className="text-[#9CA3AF]" />
      </div>
      <div className="flex flex-col gap-3">
        {displayAssignments.length === 0 ? (
          <p className="text-[13px] text-[#9CA3AF] text-center py-6">لا توجد واجبات لهذه الحصة</p>
        ) : (
          displayAssignments.map((a) => (
            <AssignmentRow key={a.id} {...a} onOpen={() => console.log("open assignment", a.id)} />
          ))
        )}
      </div>
    </div>
  );
};

export default LessonAssignments;