import { Search, ChevronDown } from "lucide-react";

const RecordingsFilters = ({
  search,
  onSearchChange,
  filterGroup,
  onFilterGroupChange,
  groupOptions = [],
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4" dir="rtl">
      {/* Search */}
      <div className="relative w-full sm:flex-1" style={{ height: "48px" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="ابحث باسم التسجيل أو المعلم..."
          className="w-full h-full pr-10 pl-4 bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-[#123C91] transition-colors font-['IBM_Plex_Sans_Arabic'] text-right"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
      </div>

      {/* Group filter */}
      <div className="relative w-full sm:w-56" style={{ height: "48px" }}>
        <select
          value={filterGroup}
          onChange={(e) => onFilterGroupChange?.(e.target.value)}
          className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91] font-['IBM_Plex_Sans_Arabic']"
        >
          {groupOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
      </div>
    </div>
  );
};

export default RecordingsFilters;