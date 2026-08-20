import { DollarSign } from "lucide-react";

const EarningsStatsBar = ({
    total = 20000,
    available = 13000,
    withdrawn = 7000,
    pending = 3000,
}) => {
    const stats = [
        { label: "إجمالي الأرباح", value: total, color: "text-[#12C6B0]", bg: "bg-[#12C6B026]"},
        { label: "الرصيد المتاح", value: available, color: "text-[#123C91]", bg: "bg-[#EAF4FF]" },
        { label: "إجمالي المسحوب", value: withdrawn, color: "text-[#00A63E]", bg: "bg-[#00A63E26]" },
        { label: "قيد المراجعة", value: pending, color: "text-[#F59E0B]", bg: "bg-[#F59E0B26]" },
    ];

    const fmt = (n) => `EGP ${Number(n).toLocaleString("en-EG")}`;

    return (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
                <div
                    key={s.label}
                    className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all"
                    dir="rtl"
                >
                    <div className={`p-3 rounded-lg ${s.bg} shrink-0`}>
                        <DollarSign size={22} className={s.color} />
                    </div>
                    <div className="text-right">
                        <h3 className={`text-xl font-bold text-[#1F2937]`}>{fmt(s.value)}</h3>
                        <p className="text-[#575F69] text-sm mt-1">{s.label}</p>
                    </div>

                </div>
            ))}
        </div>
    );
};

export default EarningsStatsBar;