import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, Plus } from "lucide-react";
import SubjectCard from "./SubjectAccordion";

const GradeAccordion = ({ grade, onUpdate, onRemove, onRemoveSubject }) => {
  const [isOpen, setIsOpen] = useState(false);

  const addSubject = () => {
    const newSubject = {
      id: crypto.randomUUID(),
      name: { ar: "", en: "" },
    };
    onUpdate({ ...grade, subjects: [...grade.subjects, newSubject] });
  };

  const updateSubject = (subjectId, updatedSubject) => {
    onUpdate({
      ...grade,
      subjects: grade.subjects.map((s) =>
        s.id === subjectId ? updatedSubject : s,
      ),
    });
  };

  const removeSubject = (subjectId) => {
    if (onRemoveSubject) {
      onRemoveSubject(subjectId);
      return;
    }
    onUpdate({
      ...grade,
      subjects: grade.subjects.filter((s) => s.id !== subjectId),
    });
  };

  return (
    <div className="border border-[#E5E5E5] rounded-lg bg-white overflow-hidden ml-4">
      <div
        className="flex items-center justify-between p-4 bg-[#F9FAFA] border-b border-[#E5E5E5] cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* الجزء الخاص بالاسم (عربي + إنجليزي) */}
        <div className="flex items-center gap-4 flex-1">
          {/* أيقونة الفتح والقفل */}
          {isOpen ? (
            <ChevronUp size={20} className="text-[#8C9198]" />
          ) : (
            <ChevronDown size={20} className="text-[#8C9198]" />
          )}

          {/* إدخال العربي */}
          <input
            className="w-48 bg-white px-3 py-1.5 border border-[#E5E5E5] rounded-md text-[14px] text-[#1F2937] outline-none focus:border-[#123C91] transition-all"
            value={grade.name.ar}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              onUpdate({
                ...grade,
                name: { ...grade.name, ar: e.target.value },
              })
            }
            placeholder="اسم الصف (عربي)"
          />

          {/* إدخال الإنجليزي */}
          <input
            className="w-48 bg-white px-3 py-1.5 border border-[#E5E5E5] rounded-md text-[14px] text-[#1F2937] outline-none focus:border-[#123C91] transition-all"
            dir="ltr"
            value={grade.name.en}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              onUpdate({
                ...grade,
                name: { ...grade.name, en: e.target.value },
              })
            }
            placeholder="Grade Name (English)"
          />
        </div>

        {/* زر الحذف */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1.5 text-[#D92D20] hover:bg-[#FEF3F2] rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {isOpen && (
        <div className="p-3 space-y-2 border-t border-[#E5E5E5]">
          {grade.subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onUpdate={(u) => updateSubject(subject.id, u)}
              onRemove={() => removeSubject(subject.id)}
            />
          ))}
          <button
            onClick={addSubject}
            className="w-full py-1.5 text-[#123C91] text-[13px] flex items-center justify-center gap-1 hover:bg-[#F2F4F7] rounded transition-all"
          >
            <Plus size={14} /> إضافة مادة
          </button>
        </div>
      )}
    </div>
  );
};

export default GradeAccordion;
