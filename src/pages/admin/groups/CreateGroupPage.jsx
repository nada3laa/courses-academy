import { useNavigate } from "react-router-dom";
import { ChevronDown, Link as LinkIcon, Info } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import React, { useState, useEffect } from "react";

import {
  createClassroom,
  getCurriculums,
  getCurriculumStages,
  getStageGrades,
  getSubjects, // بنستخدم النسخة اللي بتاخد params عشان نفلتر المواد حسب الصف
  getTeachers,
} from "../../../services/APIService";
import Breadcrumbs from "../../shared/Breadcrumbs";

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const idOf = (obj) => {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj.id || obj._id || "";
};

const nameOf = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name?.ar || value.name?.en || value.name || value.ar || value.en || "";
};

const normalizedName = (value) =>
  nameOf(value).trim().toLocaleLowerCase("ar");

/* ------------------------------------------------------------------ */
/* Static Data                                                          */
/* ------------------------------------------------------------------ */

// نوع الخدمة: المجموعة خاصة (حصص فردية/مدفوعة لمجموعة صغيرة) أو عامة (مفتوحة لجميع الطلاب المسجلين بالمادة)
const SERVICE_TYPE_OPTIONS = [
  { id: "private", name: "خاص" },
  { id: "public", name: "عام" },
];

/* ------------------------------------------------------------------ */
/* Shared Field Components                                             */
/* ------------------------------------------------------------------ */

const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  error,
}) => (
  <div className="relative w-full">
    <label className="block font-['Tajawal'] font-medium text-[15px] sm:text-[17px] text-right text-[#1F2937] pb-1">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full h-12 px-4 border rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none focus:ring-2 appearance-none transition-all
          ${error ? "border-red-400 focus:ring-red-300" : "border-[#E5E5E5] focus:ring-[#123C91]"}
          ${!value ? "text-[#8C9198]" : "text-[#1F2937]"}
          ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
        <ChevronDown size={16} />
      </div>
    </div>
    {error && (
      <p className="text-red-500 text-[12px] mt-1 text-right">{error}</p>
    )}
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  error,
  min,
}) => (
  <div className="w-full">
    <label className="block font-['Tajawal'] font-medium text-[15px] sm:text-[17px] text-right text-[#1F2937] pb-1">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        className={`w-full h-12 px-4 border rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none focus:ring-2 transition-all placeholder:text-[#8C9198] text-right
          ${icon ? "pl-10" : ""}
          ${error ? "border-red-400 focus:ring-red-300" : "border-[#E5E5E5] focus:ring-[#123C91]"}`}
      />
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
          {icon}
        </div>
      )}
    </div>
    {error && (
      <p className="text-red-500 text-[12px] mt-1 text-right">{error}</p>
    )}
  </div>
);

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

const CreateGroupPages = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({});

  // خيارات الـ selects القادمة من الباك إند
  const [curriculums, setCurriculums] = useState([]);
  const [stages, setStages] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [loadingStages, setLoadingStages] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  /* ---------------------------------------------------------------- */
  /* 1) المنهج — بيتحمل أول ما الصفحة تفتح                              */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    getCurriculums().then((res) => setCurriculums(res.data?.data || []));
  }, []);

  /* ---------------------------------------------------------------- */
  /* 2) المرحلة — بتعتمد على المنهج المختار                             */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!data.curriculum) {
      setStages([]);
      return;
    }
    setLoadingStages(true);
    getCurriculumStages(data.curriculum)
      .then((res) => setStages(res.data?.data || []))
      .catch(() => setStages([]))
      .finally(() => setLoadingStages(false));
  }, [data.curriculum]);

  /* ---------------------------------------------------------------- */
  /* 3) الصف — بيعتمد على المرحلة المختارة                              */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!data.stage) {
      setGrades([]);
      return;
    }
    setLoadingGrades(true);
    getStageGrades(data.stage)
      .then((res) => setGrades(res.data?.data || []))
      .catch(() => setGrades([]))
      .finally(() => setLoadingGrades(false));
  }, [data.stage]);

  /* ---------------------------------------------------------------- */
  /* 4) المادة — تعتمد على الصف المختار                                */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!data.grade) {
      setSubjects([]);
      return;
    }
    setLoadingSubjects(true);
    getSubjects({ grade: data.grade })
      .then((res) => setSubjects(res.data?.data || []))
      .catch(() => setSubjects([]))
      .finally(() => setLoadingSubjects(false));
  }, [data.grade]);

  /* ---------------------------------------------------------------- */
  /* المعلمين — بنجيب كل المعلمين (GET /teachers) ونفلتر محليًا حسب     */
  /* المنهج/الصف/المادة المختارين + النشطين والموثّقين بس                */
  /* ⚠️ endpoint /teachers/available كان بيرجع فاضي دايمًا، فرجعنا      */
  /* لنفس endpoint /teachers المؤكد شغّال من الـ Postman                */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const canLoadTeachers =
      data.curriculum && data.stage && data.grade && data.subject;

    if (!canLoadTeachers) {
      setTeachers([]);
      return;
    }

    setLoadingTeachers(true);

    getTeachers({ page: 1, limit: 1000 })
      .then((res) => {
        const raw = res.data?.data;
        const selectedSubject = subjects.find(
          (subject) => idOf(subject) === data.subject,
        );
        const selectedSubjectName = normalizedName(selectedSubject);

        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.teachers)
            ? raw.teachers
            : Array.isArray(raw?.results)
              ? raw.results
              : [];

        const normalizedTeachers = list
          .map((teacher) => {
            const user = teacher.user || {};
            return {
              id: teacher.id || teacher._id,
              userId: user.id || user._id,
              fullName: user.fullName || "معلم بدون اسم",
              username: user.username,
              rating: teacher.rating,
              totalReviews: teacher.totalReviews,
              isActive: user.isActive,
              registrationStatus: user.registrationStatus,
              profileStatus: String(teacher.status || "").toLowerCase(),
              isDeleted: teacher.isDeleted ?? user.isDeleted ?? false,
              subjectIds: (teacher.subjects || []).map(idOf),
              subjectNames: (teacher.subjects || [])
                .map(normalizedName)
                .filter(Boolean),
              gradeIds: (teacher.grades || []).map(idOf),
              curriculumIds: (teacher.curriculums || []).map(idOf),
            };
          })
          .filter(
            (teacher) =>
              teacher.id &&
              (["approved", "active"].includes(teacher.profileStatus) ||
                (teacher.isActive === true &&
                  teacher.registrationStatus === "active")) &&
              teacher.isDeleted !== true &&
              (teacher.subjectIds.includes(data.subject) ||
                (selectedSubjectName &&
                  teacher.subjectNames.includes(selectedSubjectName))) &&
              teacher.gradeIds.includes(data.grade) &&
              teacher.curriculumIds.includes(data.curriculum),
          );

        setTeachers(normalizedTeachers);
      })
      .catch((err) => {
        console.error("فشل تحميل المعلمين المتاحين:", err);
        setTeachers([]);
      })
      .finally(() => setLoadingTeachers(false));
  }, [data.curriculum, data.stage, data.grade, data.subject, subjects]);

  const handleField = (field, value) => {
    setData((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "curriculum") {
        next.stage = "";
        next.grade = "";
        next.subject = "";
        next.teacher = "";
      } else if (field === "stage") {
        next.grade = "";
        next.subject = "";
        next.teacher = "";
      } else if (field === "grade") {
        next.subject = "";
        next.teacher = "";
      } else if (field === "subject") {
        next.teacher = "";
      }

      return next;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const next = {};
    if (!data.curriculum) next.curriculum = "المنهج مطلوب";
    if (!data.stage) next.stage = "المرحلة الدراسية مطلوبة";
    if (!data.grade) next.grade = "الصف الدراسي مطلوب";
    if (!data.subject) next.subject = "اسم المادة مطلوب";
    if (!data.teacher) next.teacher = "المعلم مطلوب";
    if (!data.name?.trim()) next.name = "اسم المجموعة مطلوب";
    if (!data.serviceType) next.serviceType = "نوع الخدمة مطلوب";
    if (!data.capacity) next.capacity = "عدد الطلاب مطلوب";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCancel = () => navigate("/admin/groups");

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setSubmitError(null);
    try {
      await createClassroom({
        name: data.name,
        curriculum: data.curriculum,
        stage: data.stage,
        grade: data.grade,
        subject: data.subject,
        teacher: data.teacher,
        type: "group",
        serviceType: data.serviceType,
        capacity: Number(data.capacity),
        description: data.description || "",
        meetingLink: data.meetingLink || "",
      });
      navigate("/admin/groups");
    } catch (err) {
      console.error(err);
      setSubmitError(
        err.response?.data?.message || "حدث خطأ أثناء إنشاء المجموعة",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <div
        dir="rtl"
        className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right mx-auto space-y-5"
      >
        <div>
          <h2 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[18px] sm:text-[20px] text-[#1F2937] mb-1">
            إنشاء مجموعة جديدة
          </h2>
          <p className="font-['IBM_Plex_Sans_Arabic'] text-[#575F69] text-[14px] sm:text-[16px]">
            أدخل تفاصيل المجموعة.
          </p>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 space-y-4">
          {/* 1. المنهج */}
          <SelectField
            label="المنهج"
            value={data.curriculum || ""}
            onChange={(v) => handleField("curriculum", v)}
            options={curriculums.map((c) => ({
              id: c.id || c._id,
              name: c.name?.ar || c.name,
            }))}
            placeholder="اختر المنهج"
            error={errors.curriculum}
          />

          {/* 2. المرحلة الدراسية — تعتمد على المنهج */}
          <SelectField
            label="المرحلة الدراسية"
            value={data.stage || ""}
            onChange={(v) => handleField("stage", v)}
            options={stages.map((s) => ({
              id: s.id || s._id,
              name: s.name?.ar || s.name,
            }))}
            placeholder={
              !data.curriculum
                ? "اختر المنهج أولاً"
                : loadingStages
                  ? "جارٍ تحميل المراحل..."
                  : "اختر المرحلة الدراسية"
            }
            disabled={!data.curriculum || loadingStages}
            error={errors.stage}
          />

          {/* 3. الصف الدراسي — يعتمد على المرحلة */}
          <SelectField
            label="الصف الدراسي"
            value={data.grade || ""}
            onChange={(v) => handleField("grade", v)}
            options={grades.map((g) => ({
              id: g.id || g._id,
              name: g.name?.ar || g.name,
            }))}
            placeholder={
              !data.stage
                ? "اختر المرحلة أولاً"
                : loadingGrades
                  ? "جارٍ تحميل الصفوف..."
                  : "اختر الصف الدراسي"
            }
            disabled={!data.stage || loadingGrades}
            error={errors.grade}
          />

          {/* 4. المادة — تعتمد على الصف */}
          <SelectField
            label="اسم المادة"
            value={data.subject || ""}
            onChange={(v) => handleField("subject", v)}
            options={subjects.map((s) => ({
              id: s.id || s._id,
              name: s.name?.ar || s.name,
            }))}
            placeholder={
              !data.grade
                ? "اختر الصف أولاً"
                : loadingSubjects
                  ? "جارٍ تحميل المواد..."
                  : subjects.length
                    ? "اختر المادة الدراسية"
                    : "لا توجد مواد لهذا الصف"
            }
            disabled={!data.grade || loadingSubjects}
            error={errors.subject}
          />

          {/* 5. المعلم — يعتمد على المنهج/المرحلة/الصف/المادة */}
          <SelectField
            label="المعلم"
            value={data.teacher || ""}
            onChange={(v) => handleField("teacher", v)}
            options={teachers.map((teacher) => ({
              id: teacher.id,
              name: teacher.fullName,
            }))}
            placeholder={
              !data.subject
                ? "اختر المادة أولًا"
                : loadingTeachers
                  ? "جارٍ تحميل المعلمين..."
                  : teachers.length
                    ? "اختر المعلم"
                    : "لا يوجد معلمون متاحون لهذه المادة"
            }
            disabled={!data.subject || loadingTeachers}
            error={errors.teacher}
          />

          <InputField
            label="اسم المجموعة"
            value={data.name || ""}
            onChange={(v) => handleField("name", v)}
            placeholder="مجموعة أ"
            error={errors.name}
          />

          <SelectField
            label="نوع الخدمة"
            value={data.serviceType || ""}
            onChange={(v) => handleField("serviceType", v)}
            options={SERVICE_TYPE_OPTIONS}
            placeholder="اختر نوع الخدمة"
            error={errors.serviceType}
          />

          <InputField
            label="عدد الطلاب (سعة الفصل)"
            value={data.capacity || ""}
            onChange={(v) => handleField("capacity", v)}
            placeholder="20"
            type="number"
            min="1"
            error={errors.capacity}
          />

          <InputField
            label="وصف المجموعة (اختياري)"
            value={data.description || ""}
            onChange={(v) => handleField("description", v)}
            placeholder="رياضيات - الصف الثالث الثانوي...."
          />

          <InputField
            label="رابط المجموعة التعليمية"
            value={data.meetingLink || ""}
            onChange={(v) => handleField("meetingLink", v)}
            placeholder="https://zoom.us/12548"
            icon={<LinkIcon size={16} />}
          />

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-lg px-4 py-2">
              {submitError}
            </div>
          )}

          <div className="flex items-start gap-2 bg-[#EAF4FF] border border-[#D6E6FB] rounded-lg px-4 py-3">
            <Info size={16} className="text-[#123C91] shrink-0 mt-0.5" />
            <p className="font-['IBM_Plex_Sans_Arabic'] text-[13px] text-[#1F2937] leading-5">
              سيُستخدم هذا الرابط لجميع حصص هذه المجموعة. تأكد من صحة الرابط
              وإمكانية انضمام الطلاب إليه في الوقت المحدد للحصة.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 px-6 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium cursor-pointer text-[14px] sm:text-[16px] disabled:opacity-60"
          >
            {saving ? "جارٍ الإنشاء..." : "إنشاء المجموعة"}
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 py-3 px-6 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium cursor-pointer text-[14px] sm:text-[16px]"
          >
            إلغاء
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateGroupPages;
