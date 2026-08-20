import React from "react";
import { BookOpen, ClipboardList, Users } from "lucide-react";

const StatsOverview = ({
  upcomingLessons = 4,
  activeAssignments = 2,
  activeGroups = 4,
}) => {
  const stats = [
    {
      label: "الحصص القادمة",
      value: upcomingLessons,
      icon: BookOpen,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      label: "الواجبات النشطة",
      value: activeAssignments,
      icon: ClipboardList,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "المجموعات النشطة",
      value: activeGroups,
      icon: Users,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  return (
    <div
      dir="rtl"
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
    >
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

export default StatsOverview;
