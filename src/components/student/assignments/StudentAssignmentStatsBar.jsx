import { FileX, FileCheck2, Zap, ClipboardList } from "lucide-react";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ value, label, type }) => {
  const map = {
    red: { bg: "bg-[#FB2C3626]", icon: "text-[#FB2C36]", Icon: FileX },
    green: { bg: "bg-[#00A63E26]", icon: "text-[#00A63E]", Icon: FileCheck2 },
    blue: { bg: "bg-[#EAF4FF]", icon: "text-[#123C91]", Icon: Zap },
    navy: { bg: "bg-[#EAF4FF]", icon: "text-[#123C91]", Icon: ClipboardList },
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

// ─── Stats Bar ──────────────────────────────────────────────────────────────
const StudentAssignmentStatsBar = ({ notSubmitted = 0, submitted = 0, active = 0, total = 0 }) => {
  const stats = [
    { value: notSubmitted, label: "لم يتم التسليم", type: "red" },
    { value: submitted, label: "تم التسليم", type: "green" },
    { value: active, label: "نشطة", type: "blue" },
    { value: total, label: "إجمالي الواجبات", type: "navy" },
  ];

  return (
    <div dir="rtl" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
};

export default StudentAssignmentStatsBar;