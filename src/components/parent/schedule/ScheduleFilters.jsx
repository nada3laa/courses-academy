import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

/**
 * ScheduleFilters
 * students / subjects are derived from the real API data by the parent
 * (FamilySchedule.jsx): students from getMyStudents(), subjects from the
 * unique subjects found across getMyClassrooms(). All three controls are
 * fully controlled — no more static "جميع الأبناء" placeholder option.
 */
const ScheduleFilters = ({
  search,
  onSearchChange,
  students = [],
  studentId,
  onStudentChange,
  subjects = [],
  subjectId,
  onSubjectChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-1" dir="rtl">

      <div className="relative flex-1 min-w-50" style={{ height: '48px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="ابحث عن مادة أو معلم..."
          className="w-full h-full pr-10 pl-4 py-3  bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-[#123C91] transition-colors"
        />
        <Search className="absolute right-3 top-1/2  -translate-y-1/2 text-[#9CA3AF]" size={18} />
      </div>

      <div className="relative" style={{ width: '280px', height: '48px' }}>
        <select
          value={studentId || ''}
          onChange={(e) => onStudentChange?.(e.target.value)}
          className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]"
        >
          <option value="">جميع الأبناء</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.fullName}</option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
      </div>

      <div className="relative" style={{ width: '240px', height: '48px' }}>
        <select
          value={subjectId || ''}
          onChange={(e) => onSubjectChange?.(e.target.value)}
          className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]"
        >
          <option value="">جميع المواد</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>{sub.name}</option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
      </div>

    </div>
  );
};

export default ScheduleFilters;