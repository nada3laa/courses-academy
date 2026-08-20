import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, Plus } from "lucide-react";
import GradeAccordion from "./GradeAccordion";

const StageAccordion = ({ stage, onUpdate, onRemove, onRemoveGrade, onRemoveSubject }) => {
  const [isOpen, setIsOpen] = useState(true);

  const addGrade = () => {
    const newGrade = {
      id: crypto.randomUUID(),
      name: { ar: "", en: "" },
      subjects: [],
    };
    onUpdate({ ...stage, grades: [...stage.grades, newGrade] });
  };

  const updateGrade = (gradeId, updatedGrade) => {
    onUpdate({
      ...stage,
      grades: stage.grades.map((g) => (g.id === gradeId ? updatedGrade : g)),
    });
  };

  const removeGrade = (gradeId) => {
    if (onRemoveGrade) {
      onRemoveGrade(gradeId);
      return;
    }
    onUpdate({
      ...stage,
      grades: stage.grades.filter((g) => g.id !== gradeId),
    });
  };

  return (
    <div className="border border-[#E5E5E5] rounded-xl bg-white shadow-sm overflow-hidden">
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
            value={stage.name.ar}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              onUpdate({
                ...stage,
                name: { ...stage.name, ar: e.target.value },
              })
            }
            placeholder="اسم المرحلة (عربي)"
          />

          {/* إدخال الإنجليزي */}
          <input
            className="w-48 bg-white px-3 py-1.5 border border-[#E5E5E5] rounded-md text-[14px] text-[#1F2937] outline-none focus:border-[#123C91] transition-all"
            dir="ltr"
            value={stage.name.en}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              onUpdate({
                ...stage,
                name: { ...stage.name, en: e.target.value },
              })
            }
            placeholder="Stage Name (English)"
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
        <div className="p-4 space-y-4">
          {stage.grades.map((grade) => (
            <GradeAccordion
              key={grade.id}
              grade={grade}
              onUpdate={(u) => updateGrade(grade.id, u)}
              onRemove={() => removeGrade(grade.id)}
              onRemoveSubject={(subjectId) => onRemoveSubject?.(grade.id, subjectId)}
            />
          ))}
          <button
            onClick={addGrade}
            className="w-full py-2 border-2 border-dashed border-[#E5E5E5] rounded-lg text-[#575F69] text-[14px] flex items-center justify-center gap-2 hover:border-[#123C91] hover:text-[#123C91] transition-all"
          >
            <Plus size={16} /> إضافة صف دراسي
          </button>
        </div>
      )}
    </div>
  );
};

export default StageAccordion;
