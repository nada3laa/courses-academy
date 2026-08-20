import React from 'react';
import { Trash2 } from 'lucide-react';

const SubjectCard = ({ subject, onUpdate, onRemove }) => {
  return (
    <div className="flex items-center justify-between p-2 bg-[#F9FAFA] border border-[#E5E5E5] rounded-md group">
      <div className="flex flex-col gap-1 w-full pl-2">
        <input
          className="bg-transparent text-[13px] text-[#1F2937] placeholder-[#8C9198] outline-none border-b border-transparent focus:border-[#123C91] transition-all"
          value={subject.name.ar}
          onChange={(e) => onUpdate({ ...subject, name: { ...subject.name, ar: e.target.value } })}
          placeholder="اسم المادة (عربي)"
        />
        <input
          className="bg-transparent text-[12px] text-[#575F69] placeholder-[#8C9198] outline-none border-b border-transparent focus:border-[#123C91] transition-all"
          dir="ltr"
          value={subject.name.en}
          onChange={(e) => onUpdate({ ...subject, name: { ...subject.name, en: e.target.value } })}
          placeholder="Subject Name (English)"
        />
      </div>
      <button 
        onClick={onRemove}
        className="p-1 text-[#8C9198] hover:text-[#D92D20] hover:bg-[#FEF3F2] rounded transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default SubjectCard;