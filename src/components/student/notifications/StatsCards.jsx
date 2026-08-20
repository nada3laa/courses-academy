import React from "react";
import { Bell, BellRing, GraduationCap, Settings } from "lucide-react";

const StatsCards = ({ notifications = [] }) => {
  const total = notifications.length;
  const unread = notifications.filter((n) => !n.isRead).length;
  const academic = notifications.filter((n) => n.type === "academic").length;
  const system = notifications.filter((n) => n.type === "system").length;

  const stats = [
    { label: "إجمالي الإشعارات", value: total, icon: Bell, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "غير مقروءة", value: unread, icon: BellRing, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "أكاديمية", value: academic, icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "عامة", value: system, icon: Settings, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div dir="rtl" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className={`shrink-0 p-2.5 sm:p-3 rounded-lg ${s.bg}`}>
              <Icon size={22} className={s.color} />
            </div>
            <div className="text-right min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">{s.value}</h3>
              <p className="text-gray-500 text-[11px] sm:text-sm mt-1 truncate">{s.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;