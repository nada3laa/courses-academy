import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";

const BlogCategoryPicker = ({ categories, value, onChange, onCreateCategory, creating }) => {
  const [newCategory, setNewCategory] = useState("");

  const handleCreate = async () => {
    if (!newCategory.trim()) return;
    const created = await onCreateCategory(newCategory.trim());
    if (created) setNewCategory("");
  };

  return (
    <div>
      <label className="block font-['Tajawal'] font-medium text-[14px] text-right text-[#1F2937] pb-2">
        التصنيف
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* التصنيف الحالي */}
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-11 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#123C91] appearance-none text-right text-[#1F2937]"
          >
            <option value="">اختر تصنيفًا</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]" />
        </div>

        {/* إضافة تصنيف جديد */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="اسم التصنيف الجديد..."
            className="flex-1 h-11 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#123C91] text-right text-[#1F2937]"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !newCategory.trim()}
            className="h-11 px-4 rounded-lg bg-[#123C91] text-white flex items-center gap-1 text-[13px] font-medium disabled:opacity-60 shrink-0"
          >
            <Plus size={15} />
            إضافة
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogCategoryPicker;