import { Presentation, CheckSquare, Calendar, BookOpen } from "lucide-react";

const LessonStatsBar = ({ total = 0, upcoming = 0, completed = 0, notHeld = 0 }) => {
  const stats = [
    { label: "إجمالي الحصص", value: total, color: "text-teal-600", bg: "bg-teal-50", icon: BookOpen },
    { label: "الحصص القادمة", value: upcoming, color: "text-blue-600", bg: "bg-blue-50", icon: Calendar },
    { label: "الحصص المكتملة", value: completed, color: "text-gray-600", bg: "bg-gray-100", icon: CheckSquare },
    { label: "حصص لم تُعقد", value: notHeld, color: "text-red-600", bg: "bg-red-50", icon: Presentation },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <h3 className="text-2xl font-bold text-gray-800">{s.value}</h3>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default LessonStatsBar;
