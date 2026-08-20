import { Search, ChevronDown } from "lucide-react";

const GroupsFilters = ({
  search,
  onSearchChange,
  filterSubject,
  subjectOptions = ["جميع المواد"],
  onFilterSubjectChange,
  filterStatus,
  statusOptions = ["جميع الحالات"],
  onFilterStatusChange,
  filterStage,
  stageOptions = ["جميع المراحل"],
  onFilterStageChange,
  filterGrade,
  gradeOptions = ["جميع الصفوف"],
  onFilterGradeChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mb-1" dir="rtl">
      <div className="relative w-full sm:flex-1 sm:min-w-50" style={{ height: "48px" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="بحث باسم أو المعلم أو المادة..."
          className="w-full h-full pr-10 pl-4 py-3 bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-[#123C91] transition-colors"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
      </div>

      <div className="relative w-full sm:w-55 lg:w-60" style={{ height: "48px" }}>
        <select
          value={filterSubject}
          onChange={(e) => onFilterSubjectChange?.(e.target.value)}
          className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]"
        >
          {subjectOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
      </div>

      <div className="relative w-full sm:w-47.5 lg:w-55" style={{ height: "48px" }}>
        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange?.(e.target.value)}
          className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]"
        >
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
      </div>

      <div className="relative w-full sm:w-47.5 lg:w-55" style={{ height: "48px" }}>
        <select
          value={filterStage}
          onChange={(e) => onFilterStageChange?.(e.target.value)}
          className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]"
        >
          {stageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
      </div>

      {filterStage !== "جميع المراحل" && (
        <div className="relative w-full sm:w-47.5 lg:w-55" style={{ height: "48px" }}>
          <select
            value={filterGrade}
            onChange={(e) => onFilterGradeChange?.(e.target.value)}
            className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]"
          >
            {gradeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
        </div>
      )}
    </div>
  );
};

export default GroupsFilters;
