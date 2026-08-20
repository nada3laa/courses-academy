// components/parent/schedule/StatsCards.jsx
import React from 'react';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

const StatsCards = ({ stats = { upcoming: 0, completed: 0, totalHours: 0 } }) => {
  const cards = [
    {
      title: "الحصص القادمة",
      value: String(stats.upcoming),
      icon: <Calendar className="text-[#10B981]" />,
      bgColor: "bg-green-50"
    },
    {
      title: "الحصص المكتملة",
      value: String(stats.completed),
      icon: <CheckCircle className="text-[#123C91]" />,
      bgColor: "bg-blue-50"
    },
    {
      title: "إجمالي الساعات",
      value: String(stats.totalHours),
      icon: <Clock className="text-[#10B981]" />,
      bgColor: "bg-green-50"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-8">
      {cards.map((stat, index) => (
        <div key={index} className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
          <div className={`p-3 rounded-lg shrink-0 ${stat.bgColor}`}>
            {stat.icon}
          </div>
          <div className="text-right flex-1">
            <h3 className="text-xl font-bold text-[#1F2937]">{stat.value}</h3>
            <p className="text-[#575F69] text-sm mt-1 font-medium">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;