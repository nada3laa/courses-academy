import { FileEdit, CheckCircle2, FileText } from "lucide-react";

const BlogsStatsBar = ({ draft = 0, published = 0, total = 0 }) => {
  const stats = [
    { label: "إجمالي المقالات", value: total, color: "text-[#123C91]", bg: "bg-[#EAF4FF]", icon: FileText },
    { label: "منشور", value: published, color: "text-[#00A63E]", bg: "bg-[#00A63E26]", icon: CheckCircle2 },
    { label: "مسودة", value: draft, color: "text-[#FF8A00]", bg: "bg-[#FF8A0026]", icon: FileEdit },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" dir="rtl">
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

export default BlogsStatsBar;