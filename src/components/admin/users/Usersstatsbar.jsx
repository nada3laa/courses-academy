import { Users, GraduationCap, UserCog, Layers } from "lucide-react";

const UsersStatsBar = ({ parents = 0, teachers = 0, students = 0, total = 0 }) => {
  const stats = [
    { label: "أولياء الأمور", value: parents, color: "text-orange-500", bg: "bg-orange-50", icon: UserCog },
    { label: "إجمالي المعلمين", value: teachers, color: "text-teal-600", bg: "bg-teal-50", icon: Users },
    { label: "إجمالي الطلاب", value: students, color: "text-green-600", bg: "bg-green-50", icon: GraduationCap },
    { label: "إجمالي المستخدمين", value: total, color: "text-[#123C91]", bg: "bg-[#EAF4FF]", icon: Layers },
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

export default UsersStatsBar;