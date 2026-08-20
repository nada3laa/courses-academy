import React from "react";
import { Clock, BookCheck, BookOpen, ClipboardList } from "lucide-react";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ value, label, type }) => {
  const map = {
    blue: { bg: "bg-[#123C9126]", icon: "text-[#123C91]", Icon: Clock },
    green: { bg: "bg-[#0A9B7226]", icon: "text-[#0A9B72]", Icon: BookCheck },
    navy: { bg: "bg-[#EAF4FF]", icon: "text-[#123C91]", Icon: BookOpen },
    purple: { bg: "bg-[#7C3AED26]", icon: "text-[#7C3AED]", Icon: ClipboardList },
  };
  const { bg, icon, Icon } = map[type] ?? map.navy;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-2xl sm:text-[28px] font-bold text-[#1A1A1A] leading-none">{value}</span>
        <div className={`p-2.5 rounded-lg ${bg}`}>
          <Icon size={20} className={icon} />
        </div>
      </div>
      <span className="text-xs sm:text-sm font-medium text-[#8C9198]">{label}</span>
    </div>
  );
};

// ─── Status Bar ─────────────────────────────────────────────────────────────
export default function StatusBar({ stats = {} }) {
  const items = [
    { value: `${stats.learningHours ?? "0"} ساعة`, label: "وقت التعلم", type: "blue" },
    { value: stats.completedLessons ?? 0, label: "الدروس المكتملة", type: "green" },
    { value: stats.activeCourses ?? 0, label: "الدورات المفتوحة", type: "navy" },
    { value: stats.tests ?? 0, label: "الاختبارات", type: "purple" },
  ];

  return (
    <div dir="rtl" className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
      {items.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}