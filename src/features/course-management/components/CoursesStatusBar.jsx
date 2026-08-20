import {
    BookOpen,
    CheckCircle2,
    Clock3,
    WalletCards,
} from "lucide-react";

const CoursesStatusBar = ({
    total = 0,
    published = 0,
    pending = 0,
    revenue = 0,
}) => {
    const stats = [
        {
            label: "إجمالي الدورات",
            value: total,
            icon: BookOpen,
            iconClass: "bg-[#EAF2FF] text-[#3567C8]",
        },
        {
            label: "منشور",
            value: published,
            icon: CheckCircle2,
            iconClass: "bg-[#DDF7E8] text-[#17864B]",
        },
        {
            label: "قيد المراجعة",
            value: pending,
            icon: Clock3,
            iconClass: "bg-[#FFF2C8] text-[#C47A00]",
        },
        {
            label: "إجمالي الأرباح",
            value: `${Number(revenue).toLocaleString("ar-EG")} جنيه`,
            icon: WalletCards,
            iconClass: "bg-[#DDFBF6] text-[#12A895]",
        },
    ];

    return (
        <div
            dir="rtl"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
            {stats.map(({ label, value, icon: Icon, iconClass }) => (
                <div
                    key={label}
                className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all"
                >
                    <div className={`shrink-0 rounded-lg p-3 ${iconClass}`}>
                        <Icon size={20} />
                    </div>
                    <div className="text-right">
                        <h3 className="text-xl font-bold text-[#1F2937]">
                            {typeof value === "number"
                                ? value.toLocaleString("ar-EG")
                                : value}
                        </h3>
                        <p className="mt-1 text-sm text-[#575F69]">{label}</p>
                    </div>
                   
                </div>
            ))}
        </div>
    );
};

export default CoursesStatusBar;
