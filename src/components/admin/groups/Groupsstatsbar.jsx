import { Users, CheckCircle2, Zap, Layers } from "lucide-react";

const GroupsStatsBar = ({ paused = 3, active = 6, full = 5, total = 14 }) => {
  const stats = [
    { label: "متوقفة", value: paused, color: "text-red-500", bg: "bg-red-50", icon: Users },
    { label: "نشطة", value: active, color: "text-green-600", bg: "bg-green-50", icon: Zap },
    { label: "مكتملة العدد", value: full, color: "text-[#123C91]", bg: "bg-[#EAF4FF]", icon: CheckCircle2 },
    { label: "إجمالي المجموعات", value: total, color: "text-teal-600", bg: "bg-teal-50", icon: Layers },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" dir="rtl">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className={`p-3 rounded-lg ${s.bg}`}>
              <Icon size={24} className={s.color} />
            </div>

            <div className="text-right">
              <h3 className="text-xl font-bold text-gray-800">{s.value}</h3>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GroupsStatsBar;