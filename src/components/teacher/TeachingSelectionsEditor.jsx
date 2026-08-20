import { useEffect, useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  getCurriculums,
  getCurriculumStages,
  getStageGrades,
  getSubjects,
} from "../../services/APIService";

const list = (response) => {
  const value = response?.data?.data ?? response?.data ?? [];
  if (Array.isArray(value)) return value;
  return value?.items ?? value?.curriculums ?? value?.stages ?? value?.grades ?? value?.subjects ?? [];
};
const idOf = (item) => item?._id ?? item?.id ?? item;
const labelOf = (item) =>
  item?.name?.ar ?? item?.name?.en ?? item?.name ?? item?.label ?? "";
const option = (item) => ({ id: idOf(item), label: labelOf(item) });
const subjectOption = (item) => {
  const arabicName = item?.name?.ar ?? item?.nameAr ?? item?.arabicName ?? "";
  const englishName = item?.name?.en ?? item?.nameEn ?? item?.englishName ?? "";

  return {
    id: idOf(item),
    label: [arabicName, englishName].filter(Boolean).join(" - ") || labelOf(item),
  };
};
const emptyCurriculum = () => ({ curriculum: "", stages: [] });

const Select = ({ value, onChange, options, placeholder, disabled }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
    className="w-full h-11 px-3 rounded-xl border border-[#1F293733] bg-white text-sm outline-none disabled:opacity-50">
    <option value="">{placeholder}</option>
    {options.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
  </select>
);

const Subjects = ({ gradeId, value, onChange }) => {
  const [options, setOptions] = useState([]);
  useEffect(() => {
    let active = true;
    if (!gradeId) return setOptions([]);
    getSubjects({ grade: gradeId }).then((res) => {
      if (active) setOptions(list(res).map(subjectOption));
    }).catch(() => toast.error("تعذر تحميل المواد"));
    return () => { active = false; };
  }, [gradeId]);
  return <div className="flex flex-wrap gap-2 mt-2">
    {options.map((item) => <button key={item.id} type="button"
      onClick={() => onChange(value.includes(item.id) ? value.filter((id) => id !== item.id) : [...value, item.id])}
      className={`px-3 py-1.5 rounded-lg border text-xs ${value.includes(item.id) ? "bg-[#123C91] text-white border-[#123C91]" : "bg-white text-gray-600"}`}>
      {item.label}
    </button>)}
    {!options.length && gradeId && <span className="text-xs text-gray-400">لا توجد مواد متاحة</span>}
  </div>;
};

const StageEditor = ({ value, onChange, stageLabel }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [grades, setGrades] = useState([]);
  useEffect(() => {
    if (!value.stage) return setGrades([]);
    getStageGrades(value.stage).then((res) => setGrades(list(res).map(option))).catch(() => toast.error("تعذر تحميل الصفوف"));
  }, [value.stage]);
  const changeGrade = (index, next) => onChange({ ...value, grades: value.grades.map((g, i) => i === index ? next : g) });
  const toggleGrade = (gradeId) => {
    const selected = value.grades.some((item) => item.grade === gradeId);
    onChange({
      ...value,
      grades: selected
        ? value.grades.filter((item) => item.grade !== gradeId)
        : [...value.grades, { grade: gradeId, subjects: [] }],
    });
  };
  return <div className="rounded-xl border border-gray-200 p-3 space-y-3 bg-gray-50">
    <button type="button" onClick={() => setCollapsed((current) => !current)}
      className="flex w-full items-center justify-between text-sm font-semibold text-[#123C91]"
      aria-expanded={!collapsed}>
      <span>{stageLabel}</span>
      <ChevronDown size={18} className={`transition-transform ${collapsed ? "rotate-90" : ""}`} />
    </button>
    {!collapsed && value.stage && <div>
      <p className="mb-2 text-xs font-medium text-gray-700">اختر صفًا أو أكثر</p>
      <div className="flex flex-wrap gap-2">
        {grades.map((grade) => {
          const selected = value.grades.some((item) => item.grade === grade.id);
          return <button key={grade.id} type="button" onClick={() => toggleGrade(grade.id)}
            className={`px-3 py-1.5 rounded-lg border text-xs ${selected ? "bg-[#123C91] text-white border-[#123C91]" : "bg-white text-gray-600"}`}>
            {grade.label}
          </button>;
        })}
        {!grades.length && <span className="text-xs text-gray-400">لا توجد صفوف متاحة</span>}
      </div>
    </div>}
    {!collapsed && value.grades.map((grade, index) => <div key={grade.grade} className="rounded-lg border bg-white p-3">
      <p className="text-xs font-semibold text-gray-700">
        مواد {grades.find((item) => item.id === grade.grade)?.label || "الصف"}
      </p>
      <Subjects gradeId={grade.grade} value={grade.subjects} onChange={(subjects) => changeGrade(index, { ...grade, subjects })} />
    </div>)}
  </div>;
};

const CurriculumStagesEditor = ({ curriculumId, value, onChange }) => {
  const [stages, setStages] = useState([]);
  const selectedStages = value.filter((item) => item.stage);
  useEffect(() => {
    let active = true;
    if (!curriculumId) return;
    getCurriculumStages(curriculumId)
      .then((res) => { if (active) setStages(list(res).map(option)); })
      .catch(() => toast.error("تعذر تحميل المراحل"));
    return () => { active = false; };
  }, [curriculumId]);

  const toggleStage = (stageId) => {
    const selected = selectedStages.some((item) => item.stage === stageId);
    onChange(selected
      ? selectedStages.filter((item) => item.stage !== stageId)
      : [...selectedStages, { stage: stageId, grades: [] }]);
  };

  if (!curriculumId) return null;
  return <div className="space-y-3">
    <div>
      <p className="mb-2 text-xs font-medium text-gray-700">اختر مرحلة أو أكثر</p>
      <div className="flex flex-wrap gap-2">
        {stages.map((stage) => {
          const selected = selectedStages.some((item) => item.stage === stage.id);
          return <button key={stage.id} type="button" onClick={() => toggleStage(stage.id)}
            className={`px-3 py-1.5 rounded-lg border text-xs ${selected ? "bg-[#123C91] text-white border-[#123C91]" : "bg-white text-gray-600"}`}>
            {stage.label}
          </button>;
        })}
        {!stages.length && <span className="text-xs text-gray-400">لا توجد مراحل متاحة</span>}
      </div>
    </div>
    {selectedStages.map((stage, stageIndex) => <StageEditor key={stage.stage} value={stage}
      stageLabel={stages.find((item) => item.id === stage.stage)?.label || "المرحلة"}
      onChange={(next) => onChange(selectedStages.map((item, index) => index === stageIndex ? next : item))} />)}
  </div>;
};

export default function TeachingSelectionsEditor({ value, onChange }) {
  const [curricula, setCurricula] = useState([]);
  const [collapsedCurricula, setCollapsedCurricula] = useState({});
  useEffect(() => { getCurriculums().then((res) => setCurricula(list(res).map(option))).catch(() => toast.error("تعذر تحميل المناهج")); }, []);
  const changeCurriculum = (index, next) => onChange(value.map((item, i) => i === index ? next : item));
  const visibleSelections = value.length ? value : [emptyCurriculum()];
  return <div className="max-h-[65vh] space-y-4 overflow-y-auto overscroll-contain rounded-xl pl-2">
    {visibleSelections.map((selection, index) => <div key={`${selection.curriculum}-${index}`} className="rounded-2xl border border-[#123C9133] p-4 space-y-3">
      <div className="flex gap-2 items-center">
        <Select value={selection.curriculum} options={curricula.filter((c) => c.id === selection.curriculum || !value.some((x) => x.curriculum === c.id))}
          placeholder="اختر المنهج" onChange={(curriculum) => {
            const next = { curriculum, stages: [] };
            if (value.length) changeCurriculum(index, next);
            else onChange([next]);
          }} />
        {selection.curriculum && <button type="button"
          onClick={() => setCollapsedCurricula((current) => ({ ...current, [index]: !current[index] }))}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#123C91]"
          aria-label={collapsedCurricula[index] ? "فتح المنهج" : "طي المنهج"}
          aria-expanded={!collapsedCurricula[index]}>
          <ChevronDown size={19} className={`transition-transform ${collapsedCurricula[index] ? "rotate-90" : ""}`} />
        </button>}
        {(value.length > 1 || selection.curriculum) && <button type="button" onClick={() => {
          const next = value.filter((_, i) => i !== index);
          onChange(next.length ? next : [emptyCurriculum()]);
        }}><Trash2 size={18} className="text-red-500" /></button>}
      </div>
      {!collapsedCurricula[index] && <CurriculumStagesEditor curriculumId={selection.curriculum} value={selection.stages}
        onChange={(stages) => changeCurriculum(index, { ...selection, stages })} />}
    </div>)}
    <button type="button" disabled={visibleSelections.some((item) => !item.curriculum)} onClick={() => onChange([...value, emptyCurriculum()])}
      className="inline-flex items-center gap-1 rounded-xl border border-[#123C91] px-4 py-2 text-sm font-medium text-[#123C91] disabled:cursor-not-allowed disabled:opacity-40"><Plus size={16}/> إضافة منهج آخر</button>
  </div>;
}

export const sanitizeTeachingSelections = (items) => items.map((curriculum) => ({
  ...curriculum,
  stages: (curriculum.stages || []).filter((stage) => stage.stage),
}));

export const validTeachingSelections = (items) => items.length > 0 && items.every((curriculum) =>
  curriculum.curriculum && curriculum.stages.length > 0 && curriculum.stages.every((stage) =>
    stage.stage && stage.grades.length > 0 && stage.grades.every((grade) => grade.grade && grade.subjects.length > 0)));
