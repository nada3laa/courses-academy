import { Users, BookOpen, FileText, TrendingUp } from "lucide-react";

const ChildrenStatsCards = ({ stats, hasChildren = false }) => {
  const display = (value, suffix = "") =>
    hasChildren ? `${value ?? 0}${suffix}` : "--";

  const cardsData = [
    {
      title: "عدد الأبناء",
      value: display(stats?.totalStudents),
      icon: Users,
      iconBg: "bg-[#12C6B01A]",
      iconColor: "text-[#12C6B0]",
    },
    {
      title: "إجمالي الإختبارات",
      value: "--",
      icon: FileText,
      iconBg: "bg-[#EAF4FF]",
      iconColor: "text-[#123C91]",
    },
    {
      title: "إجمالي الواجبات",
      value: "--",
      icon: BookOpen,
      iconBg: "bg-[#12C6B01A]",
      iconColor: "text-[#12C6B0]",
    },
    {
      title: "متوسط الحضور",
      value: display(stats?.averageAttendance, "%"),
      icon: TrendingUp,
      iconBg: "bg-[#EAF4FF]",
      iconColor: "text-[#123C91]",
    },
  ];

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" dir="rtl">
      {cardsData.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <div
            key={index}
            className="w-full bg-white border border-[#E5E5E5] mt-3 rounded-2xl p-6 flex flex-col items-start gap-3 shadow-sm"
          >
            <div className={`p-3 rounded-lg ${stat.iconBg}`}>
              <Icon size={24} className={stat.iconColor} />
            </div>

            <div className="text-right">
              <p className="text-[#6B7280] text-sm font-medium">
                {stat.title}
              </p>
              <h3 className="text-2xl font-bold text-[#1F2937] mt-2">
                {stat.value}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChildrenStatsCards;