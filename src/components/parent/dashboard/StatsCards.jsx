import {
  Users,
  Clock3,
  BookOpen,
  TrendingUp,
} from "lucide-react";

const StatsCards = ({ stats, hasChildren = false }) => {
  const display = (value, suffix = "") =>
    hasChildren ? `${value ?? 0}${suffix}` : "--";

  const cards = [
    {
      title: "عدد الأبناء",
      value: display(stats?.totalStudents),
      icon: Users,
      iconBg: "bg-teal-50",
      iconColor: "text-[#12C6B0]",
    },
    {
      title: "ساعات الدراسة",
      value: display(stats?.totalStudyHours),
      icon: Clock3,
      iconBg: "bg-blue-50",
      iconColor: "text-[#123C91]",
    },
    {
      title: "الدروس هذا الشهر",
      value: display(stats?.totalLessonsThisMonth),
      icon: BookOpen,
      iconBg: "bg-teal-50",
      iconColor: "text-[#12C6B0]",
    },
    {
      title: "متوسط الحضور",
      value: display(stats?.averageAttendance, "%"),
      icon: TrendingUp,
      iconBg: "bg-blue-50",
      iconColor: "text-[#123C91]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className={`p-3 rounded-lg ${card.iconBg} shrink-0`}>
              <Icon size={24} className={card.iconColor} />
            </div>

            <div className="text-right flex-1">
              <h3 className="text-xl font-bold text-gray-800">
                {card.value}
              </h3>
              <p className="text-gray-500 text-sm mt-1 font-medium">
                {card.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;