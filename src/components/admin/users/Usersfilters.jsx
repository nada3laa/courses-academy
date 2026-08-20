import { Search, ChevronDown } from "lucide-react";

const ROLE_OPTIONS = ["جميع المستخدمين", "معلم", "طالب", "ولي أمر", "مشرف", "مشرف عام"];
const STATUS_OPTIONS = [
  "جميع الحالات",
  "نشط",
  "معلق",
  "ملف غير مكتمل",
  "موقوف",
];

const UsersFilters = ({
  search,
  onSearchChange,
  filterRole,
  onFilterRoleChange,
  filterStatus,
  onFilterStatusChange,
  filterGrade,
  gradeOptions = [],
  onFilterGradeChange,
  filterSubject,
  subjectOptions = [],
  onFilterSubjectChange,
  filterCurriculum,
  curriculumOptions = [],
  onFilterCurriculumChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mb-1" dir="rtl">
      <div className="relative w-full sm:flex-1 sm:min-w-50" style={{ height: "48px" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="بحث بالاسم أو البريد الإلكتروني أو رقم الهاتف..."
          className="w-full h-full pr-10 pl-4 py-3 bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-[#123C91] transition-colors"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
      </div>

      <div className="relative w-full sm:w-55 lg:w-60" style={{ height: "48px" }}>
        <select
          value={filterRole}
          onChange={(e) => onFilterRoleChange?.(e.target.value)}
          className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]"
        >
          {ROLE_OPTIONS.map((opt) => (
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
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
      </div>

      {["طالب", "معلم"].includes(filterRole) && (
        <div className="relative w-full sm:w-47.5 lg:w-55" style={{ height: "48px" }}>
          <select
            value={filterGrade}
            onChange={(e) => onFilterGradeChange?.(e.target.value)}
            className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]"
          >
            <option value="جميع الصفوف">جميع الصفوف</option>
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
        </div>
      )}

      {filterRole === "معلم" && (
        <>
          <div className="relative w-full sm:w-47.5 lg:w-55" style={{ height: "48px" }}>
            <select
              value={filterSubject}
              onChange={(e) => onFilterSubjectChange?.(e.target.value)}
              className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]"
            >
              <option value="جميع المواد">جميع المواد</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
          </div>

          <div className="relative w-full sm:w-47.5 lg:w-55" style={{ height: "48px" }}>
            <select
              value={filterCurriculum}
              onChange={(e) => onFilterCurriculumChange?.(e.target.value)}
              className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]"
            >
              <option value="جميع المناهج">جميع المناهج</option>
              {curriculumOptions.map((curriculum) => (
                <option key={curriculum} value={curriculum}>{curriculum}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
          </div>
        </>
      )}
    </div>
  );
};

export default UsersFilters;
