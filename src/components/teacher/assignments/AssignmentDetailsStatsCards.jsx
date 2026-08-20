import { ClipboardList, CheckCircle2, FileText } from "lucide-react";

const AssignmentDetailsStatsCards = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    { label: "قيد التصحيح", value: stats.pendingCorrection, color: "text-orange-500", bg: "bg-orange-50", icon: ClipboardList },
    { label: "تم تصحيحها", value: stats.corrected, color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
    { label: "إجمالي التسليمات", value: stats.totalSubmissions, color: "text-blue-600", bg: "bg-blue-50", icon: FileText },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((s) => {
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

export default AssignmentDetailsStatsCards;