import { User, Users, UserMinus } from "lucide-react";

const StudentStatsBar = ({ total = 22, active = 18, excluded = 4 }) => {
  const stats = [
    { label: "إجمالي الطلاب", value: total, icon: Users, color: "text-green-600", bg: "bg-green-50" },
    { label: "الطلاب النشطين", value: active, icon: User, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "الطلاب المستبعدون", value: excluded, icon: UserMinus, color: "text-red-500", bg: "bg-red-50" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StudentStatsBar;