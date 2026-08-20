import { Clock, CheckCircle, Zap, ClipboardList } from "lucide-react";

const AssignmentStatsBar = ({ pendingCorrection = 2, corrected = 4, active = 8, total = 12 }) => {
    const stats = [

        { label: "إجمالي الواجبات", value: total, color: "text-teal-600", bg: "bg-teal-50", icon: ClipboardList },
        { label: "نشطة", value: active, color: "text-blue-600", bg: "bg-blue-50", icon: Zap },
        { label: "تم تصحيحها", value: corrected, color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
        { label: "قيد التصحيح", value: pendingCorrection, color: "text-orange-500", bg: "bg-orange-50", icon: Clock },

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

export default AssignmentStatsBar;