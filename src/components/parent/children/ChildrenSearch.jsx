import { Search } from 'lucide-react';

const ChildrenSearch = ({ value, onChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-1" dir="rtl">
      <div className="relative flex-1 min-w-50" style={{ height: '48px' }}>
        <input
          type="text"
          placeholder="بحث عن ابن....."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full pr-10 pl-4 py-3 bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-[#123C91] transition-colors"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
      </div>
    </div>
  );
};

export default ChildrenSearch;