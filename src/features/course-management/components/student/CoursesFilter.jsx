import React from "react";
import { Search, ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "popular", label: "الأكثر شعبية" },
  { value: "price_asc", label: "السعر: الأقل" },
  { value: "price_desc", label: "السعر: الأعلى" },
];

const LEVEL_OPTIONS = [
  { value: "all", label: "المستوى: الكل" },
  { value: "beginner", label: "مبتدئ" },
  { value: "intermediate", label: "متوسط" },
  { value: "advanced", label: "متقدم" },
];

export default function CoursesFilter({ onSearch = () => {}, onChange = () => {} }) {
  return (
    <div
      className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center mb-1"
      dir="rtl"
      style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #E5E5E5",
        boxShadow: "0px 0px 4px 0px #0000001F",
        width: "1136px",
        maxWidth: "100%",
        minHeight: "88px",
        gap: "16px",
        borderRadius: "16px",
        padding: "24px",
      }}
    >

      <div className="relative w-full sm:flex-1 sm:min-w-50" style={{ height: "48px" }}>
        <input
          type="text"
          onChange={(e) => onSearch(e.target.value)}
          placeholder="ابحث عن دورة أو مدرس..."
          className="w-full h-full pr-10 pl-4 py-3 bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-[#123C91] transition-colors"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
      </div>

      <div className="relative w-full sm:w-55 lg:w-70" style={{ height: "48px" }}>
        <select
          onChange={(e) => onChange({ sort: e.target.value })}
          className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
      </div>

      <div className="relative w-full sm:w-47.5 lg:w-60" style={{ height: "48px" }}>
        <select
          onChange={(e) => onChange({ level: e.target.value })}
          className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]"
        >
          {LEVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
      </div>

    </div>
  );
}