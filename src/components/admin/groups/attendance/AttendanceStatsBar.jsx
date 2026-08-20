import { UserX, UserCheck, Users, Clock, Timer, ShieldCheck } from "lucide-react";

const AttendanceStatsBar = ({
  absences = 0,
  attendances = 0,
  late = 0,
  excused = 0,
  students = 0,
  sessions = 0,
  completedSessions = 0,
  scheduledSessions = 0,
  notHeldSessions = 0,
  otherSessions = 0,
}) => {
  const stats = [
    { label: "إجمالي الغياب", value: absences, color: "text-red-500", bg: "bg-red-50", icon: UserX },
    { label: "إجمالي الحضور", value: attendances, color: "text-green-600", bg: "bg-green-50", icon: UserCheck },
    { label: "إجمالي التأخير", value: late, color: "text-amber-600", bg: "bg-amber-50", icon: Timer },
    { label: "غياب بعذر", value: excused, color: "text-[#123C91]", bg: "bg-[#EAF4FF]", icon: ShieldCheck },
    { label: "إجمالي الطلاب", value: students, color: "text-[#123C91]", bg: "bg-[#EAF4FF]", icon: Users },
    {
      label: "إجمالي مواعيد الحصص",
      value: sessions,
      detail: [
        `${completedSessions} تمت`,
        scheduledSessions ? `${scheduledSessions} مجدولة — لم تبدأ بعد` : null,
        notHeldSessions ? `${notHeldSessions} لم تُعقد` : null,
        otherSessions ? `${otherSessions} بحالات أخرى` : null,
      ].filter(Boolean).join(" • "),
      color: "text-teal-600",
      bg: "bg-teal-50",
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4" dir="rtl">
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
              {s.detail && (
                <p className="mt-1 text-[11px] leading-5 text-gray-400">
                  {s.detail}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttendanceStatsBar;
