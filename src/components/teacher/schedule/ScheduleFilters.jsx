import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

const ScheduleFilters = () => {
  return (
    <div className="w-full" dir="rtl">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

        {/* Search — grows to fill remaining space */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="ابحث عن مادة أو معلم..."
            className="
              w-full h-12
              pr-11 pl-4
              bg-[#F9FAFA] border border-[#E5E5E5] rounded-xl
              text-sm text-[#1F2937] placeholder:text-[#9CA3AF]
              outline-none focus:border-[#123C91] focus:bg-white
              transition-colors duration-200
            "
          />
          <Search
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
            size={18}
          />
        </div>

        {/* Group select */}
        <div className="relative w-full sm:w-56">
          <select
            className="
              w-full h-12
              appearance-none
              bg-[#F9FAFA] border border-[#E5E5E5] rounded-xl
              pr-4 pl-9
              text-sm text-[#575F69]
              outline-none cursor-pointer
              focus:border-[#123C91] focus:bg-white
              transition-colors duration-200
            "
          >
            <option>جميع المجموعات</option>
            <option>الرياضيات A</option>
            <option>الرياضيات B</option>
            <option>الرياضيات C</option>
          </select>
          <ChevronDown
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none"
            size={16}
          />
        </div>

      </div>
    </div>
  );
};

export default ScheduleFilters;