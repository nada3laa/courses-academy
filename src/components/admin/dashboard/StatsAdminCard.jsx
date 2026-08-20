import {
    Star,
    DollarSign,
    Clock3,
    Users,
} from "lucide-react";

const cards = [
    {
        title: "إجمالي عدد الطلاب",
        value: "204",
        icon: Users,
        iconBg: "bg-teal-50",
        iconColor: "text-teal-600",
    },
    {
        title: "عدد الساعات",
        value: "2",
        icon: Clock3,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
    },
    {
        title: "إجمالي الأرباح",
        value: "EGP 2,450",
        icon: DollarSign,
        iconBg: "bg-teal-50",
        iconColor: "text-teal-600",
    },
    {
        title: "متوسط التقييم",
        value: "4.8",
        icon: Star,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
    },
];

const StatsAdminCard = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => {
                const Icon = card.icon;

                return (
                    <div
                        key={index}
                        className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className={`p-3 rounded-lg ${card.iconBg}`}>
                            <Icon size={24} className={card.iconColor} />
                        </div>
                        
                        <div className="text-right">
                            <h3 className="text-xl font-bold text-gray-800">
                                {card.value}
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">
                                {card.title}
                            </p>
                        </div>

                    </div>
                );
            })}
        </div>
    );
};

export default StatsAdminCard;