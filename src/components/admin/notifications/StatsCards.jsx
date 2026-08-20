import { Bell, BellOff, GraduationCap, Settings } from "lucide-react";

const ACADEMIC_TYPES = ["lesson", "absence", "attendance", "academic"];
const isAcademic = (n) =>
  ACADEMIC_TYPES.includes(n.type) || ACADEMIC_TYPES.includes(n.key);

const StatsCardds = ({ notifications = [] }) => {
  const total = notifications.length;
  const unread = notifications.filter((n) => !n.isRead).length;
  const academic = notifications.filter((n) => isAcademic(n)).length;
  const system = total - academic;

  const cards = [
    {
      title: "إجمالي الإشعارات",
      value: String(total),
      icon: Bell,
      iconBg: "bg-[#12C6B01A]",
      iconColor: "text-[#12C6B0]",
    },
    {
      title: "غير مقروءة",
      value: String(unread),
      icon: BellOff,
      iconBg: "bg-[#EAF4FF]",
      iconColor: "text-[#123C91]",
    },
    {
      title: "إشعارات أكاديمية",
      value: String(academic),
      icon: GraduationCap,
      iconBg: "bg-[#12C6B01A]",
      iconColor: "text-[#12C6B0]",
    },
    {
      title: "إشعارات النظام والإدارة",
      value: String(system),
      icon: Settings,
      iconBg: "bg-[#EAF4FF]",
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

export default StatsCardds;