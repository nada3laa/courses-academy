import { Search, ChevronDown } from "lucide-react";

const STATUS_OPTIONS = ["جميع الحالات", "مكتمل", "قيد المراجعة"];
const TIME_OPTIONS   = ["جميع الأوقات", "هذا الشهر", "الشهر الماضي", "آخر 3 أشهر"];

const EarningsFilters = ({
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterTime,
  onFilterTimeChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mb-1" dir="rtl">

      {/* Search */}
      <div className="relative w-full sm:flex-1 sm:min-w-50" style={{ height: "48px" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="بحث عن رقم معاملة..."
          className="w-full h-full pr-10 pl-4 py-3 bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-[#123C91] transition-colors"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
      </div>

      {/* Status filter */}
      <div className="relative w-full sm:w-47.5 lg:w-55" style={{ height: "48px" }}>
        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange?.(e.target.value)}
          className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
      </div>

      {/* Time filter */}
      <div className="relative w-full sm:w-55 lg:w-60" style={{ height: "48px" }}>
        <select
          value={filterTime}
          onChange={(e) => onFilterTimeChange?.(e.target.value)}
          className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]"
        >
          {TIME_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
      </div>

    </div>
  );
};

export default EarningsFilters;