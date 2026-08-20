import { BookOpen, CheckCircle2, XCircle, ClipboardList } from "lucide-react";

const StudentStatsCards = ({ student }) => {
  if (!student) return null;

  const stats = [
    { label: "إجمالي الحصص", value: student.totalLessons, color: "text-blue-600", bg: "bg-blue-50", icon: BookOpen },
    { label: "عدد مرات الحضور", value: student.attendanceCount, color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
    { label: "عدد مرات الغياب", value: student.absenceCount, color: "text-red-500", bg: "bg-red-50", icon: XCircle },
    { label: "الواجبات", value: `${student.homeworkDone}/${student.homeworkTotal}`, color: "text-purple-600", bg: "bg-purple-50", icon: ClipboardList },
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
              <h3 className="text-xl font-bold text-gray-800">{s.value}</h3>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StudentStatsCards;